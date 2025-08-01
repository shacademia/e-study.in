import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail, generateExpiryDate } from "@/lib/email";

// Validation schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Generate JWT token for password reset (expires in 10 minutes)
    const resetToken = jwt.sign(
      { 
        id: user.id,
        type: 'forgotPasswordToken',
        email: user.email 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '10m' }
    );

    // Generate expiry date
    const expiryDate = generateExpiryDate();

    console.log("😊😊_USERID_😒😒", user.id)

    // Update user with forgot password token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        forgotPasswordToken: resetToken,
        forgotPasswordExpiry: expiryDate,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}