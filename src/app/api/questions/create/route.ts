import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for creating a question
const createQuestionSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  options: z.array(z.string()).min(2, 'At least 2 options are required'),
  correctOption: z.number().min(0, 'Correct option must be a valid index'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  tags: z.array(z.string()).default([]),
});

// POST - Create a new question
export async function POST(request: Request) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    const body = await request.json();
    const parsedData = createQuestionSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { content, options, correctOption, difficulty, subject, topic, tags } = parsedData.data;

    // Validate correct option index
    if (correctOption >= options.length) {
      return NextResponse.json(
        { error: 'Correct option index is out of range' },
        { status: 400 }
      );
    }

    // Check if user exists and has permission to create questions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    // Only allow ADMIN and MODERATOR roles to create questions
    if (!['ADMIN', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to create questions' },
        { status: 403 }
      );
    }

    // Create the question
    const newQuestion = await prisma.question.create({
      data: {
        content,
        options,
        correctOption,
        difficulty,
        subject,
        topic,
        tags,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
