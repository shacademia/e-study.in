import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { isCodeExpired } from "@/lib/email";

// Validation schema for reset password request
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { token, newPassword } = validation.data;

    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        type: string;
        email: string;
      };
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token type is correct
    if (decodedToken.type !== 'forgotPasswordToken') {
      return NextResponse.json(
        { success: false, error: "Invalid token type" },
        { status: 400 }
      );
    }

    const userId = decodedToken.id;

    console.log("😊😊USERID😒😒", userId)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        forgotPasswordToken: true,
        forgotPasswordExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if reset token exists
    if (!user.forgotPasswordToken || !user.forgotPasswordExpiry) {
      return NextResponse.json(
        { success: false, error: "No password reset request found" },
        { status: 400 }
      );
    }

    // Check if token matches
    if (user.forgotPasswordToken !== token) {
      return NextResponse.json(
        { success: false, error: "Invalid reset token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (isCodeExpired(user.forgotPasswordExpiry)) {
      // Clear expired token
      await prisma.user.update({
        where: { id: userId },
        data: {
          forgotPasswordToken: null,
          forgotPasswordExpiry: null,
        },
      });

      return NextResponse.json(
        { success: false, error: "Reset token has expired. Please request a new password reset." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        forgotPasswordToken: null,
        forgotPasswordExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}