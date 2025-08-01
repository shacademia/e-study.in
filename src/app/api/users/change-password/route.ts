import { z } from "zod";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the schema for the request body
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  // Redirect POST to PUT for backward compatibility
  return PUT(request);
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get("x-auth-token");

  // This shouldn't happen if middleware is working, but just in case

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  // Extract the current and new passwords from the request body
  const { currentPassword, newPassword, confirmPassword } =
    await request.json();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        error: "Current password, new password, and confirmation are required",
      },
      { status: 400 }
    );
  }

  const validation = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input data",
      },
      { status: 400 }
    );
  }

  // Check if the current password matches the user's existing password
  const isPasswordValid = await bcrypt.compare(
    validation.data.currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    return NextResponse.json(
      { success: false, error: "Current password is incorrect" },
      { status: 401 }
    );
  }

  // Hash the new password and update the user record
  const hashedNewPassword = await bcrypt.hash(validation.data.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return NextResponse.json(
    { success: true, message: "Password changed successfully" },
    { status: 200 }
  );
}
