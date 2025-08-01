import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';



// GET - Retrieve a specific question by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const questionId = params.id;

    // Fetch the question from the database
    const question = await prisma.question.findUnique({
      where: { id: questionId },
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

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a specific question by ID
export async function PUT(
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
    const { id } = await params;
    const questionId = id

    const body = await request.json();
    const { author, _count, createdAt, updatedAt, ...updateData } = body;

    // Check if the question exists and user has permission to update it
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      select: { authorId: true },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Check if user is the author of the question or an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!['ADMIN', 'MODERATOR'].includes(user?.role || '')) {
      return NextResponse.json(
        { error: 'You do not have permission to update this question' },
        { status: 403 }
      );
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...updateData,
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
    }
    );

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a specific question by ID
export async function DELETE(
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
    const questionId = params.id;

    // Check if the question exists and user has permission to delete it
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      select: { 
        authorId: true,
        examSections: true,
        exams: true,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Check if user is the author of the question or an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (existingQuestion.authorId !== userId && !['ADMIN', 'MODERATOR'].includes(user?.role || '')) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this question' },
        { status: 403 }
      );
    }

    // Check if question is being used in any exams
    if (existingQuestion.examSections.length > 0 || existingQuestion.exams.length > 0) {
      return NextResponse.json(
        { 
          error: 'Question is currently being used in active exams and cannot be deleted',
          details: 'This question is part of one or more exams. Please remove it from all exams before deleting.',
          code: 'QUESTION_IN_USE'
        },
        { status: 409 }
      );
    }

    // Delete the question (cascade delete will handle related records)
    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
