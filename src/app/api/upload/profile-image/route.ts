import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadProfilePicture } from '@/services/supabase/storage';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
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
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    try {
      // Upload to Supabase Storage
      const imageUrl = await uploadProfilePicture(userId, file);

      // Update user's profile picture URL in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          profileImage: imageUrl,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          role: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          imageUrl,
          user: updatedUser
        }
      });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, message: 'Failed to upload image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
