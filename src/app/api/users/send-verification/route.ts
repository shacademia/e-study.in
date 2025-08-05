import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, generateVerificationCode, generateExpiryDate } from "@/lib/email";
import z from "zod";

const verifyEmailSchema = z.object({
  userEmail: z.email(),
});

export async function POST(request: NextRequest) {
  try {
    // Get the token from the x-auth-token header
    const token = request.headers.get("x-auth-token") || request.headers.get("Authorization")?.replace("Bearer ", "");
    const userEmail = await request.json();
    if(!userEmail || !userEmail.userEmail) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }
    const parsedEmail = verifyEmailSchema.safeParse(userEmail);

    if (!parsedEmail.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId ?? parsedEmail.data.userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
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

    // Generate verification code and expiry
    const verificationCode = generateVerificationCode();
    const expiryDate = generateExpiryDate();

    // Update user with verification code
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpiry: expiryDate,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode, user.name);

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    });

  } catch (error) {
    console.error("Send verification email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}