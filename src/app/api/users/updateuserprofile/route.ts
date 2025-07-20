import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// Validation schema for user profile update
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional()
}).refine(
  (data) => {
    // If newPassword is provided, currentPassword must also be provided
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Current password is required when setting a new password",
    path: ["currentPassword"]
  }
);

export async function PUT(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    let validatedData;
    try {
      validatedData = updateProfileSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error },
        { status: 400 }
      );
    }

    const { name, email, bio, currentPassword, newPassword } = validatedData;

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      name: string;
      email?: string;
      bio?: string;
      password?: string;
      updatedAt: Date;
    } = {
      name,
      updatedAt: new Date()
    };

    // Add optional fields if provided
    if (email && email !== existingUser.email) {
      updateData.email = email;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // Handle password change
    if (newPassword && currentPassword) {
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        lastLogin: true,
        isEmailVerified: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        passwordChanged: !!newPassword
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}