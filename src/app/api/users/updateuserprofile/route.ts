import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Validation schema for user profile update
const updateProfileSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
    phoneNumber: z.string().max(20, "Phone number too long").optional(),
    bio: z.string().max(500, "Bio too long").optional(),
  }
  );

export async function PUT(request: NextRequest) {
  try {
    // Get the token from the x-auth-token header (consistent with other routes)
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

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, phoneNumber, bio } = validation.data;

    // Prepare update data
    const updateData: {
      name?: string;
      phoneNumber?: string;
      bio?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    // Add optional fields if provided
    if (name !== undefined) {
      updateData.name = name;
    }

    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
