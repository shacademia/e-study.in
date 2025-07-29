import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { isCodeExpired } from "@/lib/email";

// Validation schema for verification code
const verifyEmailSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    // Get the token from the x-auth-token header
    const token = request.headers.get("x-auth-token");
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.id;

    console.log('😒IS THIS THIS THE DATA😒', userId)

    // Parse and validate request body
    const body = await request.json();
    const validation = verifyEmailSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid verification code" },
        { status: 400 }
      );
    }

    const { code } = validation.data;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        emailVerificationCode: true,
        emailVerificationExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Check if verification code exists
    if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
      return NextResponse.json(
        { success: false, error: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (isCodeExpired(user.emailVerificationExpiry)) {
      // Clear expired code
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerificationCode: null,
          emailVerificationExpiry: null,
        },
      });

      return NextResponse.json(
        { success: false, error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if code matches
    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Verify the email and clear verification code
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiry: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        bio: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        lastLogin: true,
        isEmailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify email" },
      { status: 500 }
    );
  }
}