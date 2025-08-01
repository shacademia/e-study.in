// POST /api/exams/[id]/validate-password - Validate exam password

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for password validation
const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const examId = params.id;

    // Get exam details
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        name: true,
        isPublished: true,
        isPasswordProtected: true,
        password: true,
        createdById: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    
    // EDITED
    //  && exam.createdById !== userId

    // Check if exam is published (unless user is admin/creator)
    if (!exam.isPublished && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Exam not available' }, { status: 404 });
    }

    // Check if exam is password protected
    if (!exam.isPasswordProtected) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: true,
          message: 'Exam is not password protected',
          examId: exam.id,
          examName: exam.name,
        },
      });
    }

    const body = await request.json();
    const parsedData = passwordSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { password } = parsedData.data;

    // Validate password
    const isValidPassword = password === exam.password;

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        data: {
          isValid: false,
          message: 'Invalid password',
        },
      }, { status: 401 });
    }

    // Password is valid
    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        message: 'Password validated successfully',
        examId: exam.id,
        examName: exam.name,
        accessGranted: true,
      },
    });

  } catch (error) {
    console.error('Error validating exam password:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
