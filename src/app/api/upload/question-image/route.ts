import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadQuestionImage } from '@/services/supabase/storage';
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
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { userId, role } = decodedToken;

    // Check if user has permission (admin or teacher)
    if (role !== 'ADMIN' && role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

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
    const questionId = formData.get('questionId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.' },
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

    // If questionId is provided, verify the question exists and user has access
    if (questionId) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { 
          author: {
            select: { id: true, name: true }
          }
        }
      });

      if (!question) {
        return NextResponse.json(
          { success: false, message: 'Question not found' },
          { status: 404 }
        );
      }

      // Check if user owns the question or is admin
      if (question.author.id !== userId && role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, message: 'You can only upload images for your own questions' },
          { status: 403 }
        );
      }
    }

    try {
      // Use questionId or generate a temporary ID for the upload
      const uploadId = questionId || `temp_${userId}_${Date.now()}`;
      
      // Upload to Supabase Storage
      const imageUrl = await uploadQuestionImage(uploadId, file);

      // If this is for an existing question, optionally update the question with the image URL
      // This depends on how you want to handle question images in your schema
      // For now, we'll just return the URL for the frontend to use

      return NextResponse.json({
        success: true,
        message: 'Question image uploaded successfully',
        data: {
          imageUrl,
          uploadId
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
    console.error('Question image upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
