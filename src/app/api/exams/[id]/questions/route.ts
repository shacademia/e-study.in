// PUT /api/exams/[id]/questions - Add/Update questions directly to exam (without sections)
// GET /api/exams/[id]/questions - Get all questions for an exam
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for adding questions to exam
const addQuestionsSchema = z.object({
  questions: z.array(z.object({
    questionId: z.string(),
    order: z.number().default(0),
    marks: z.number().min(0).default(1),
  })),
});

// PUT - Add/Update questions directly to exam
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

    // Check if user exists and has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const examId = params.id;
    const body = await request.json();
    const parsedData = addQuestionsSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { questions } = parsedData.data;

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, createdById: true }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    // Update exam with questions in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing direct exam-question relationships
      await tx.examQuestion.deleteMany({
        where: { examId },
      });

      // 2. Create new question relationships
      for (const questionData of questions) {
        await tx.examQuestion.create({
          data: {
            examId,
            questionId: questionData.questionId,
            order: questionData.order,
            marks: questionData.marks,
          },
        });
      }

      // 3. Update exam total marks
      await tx.exam.update({
        where: { id: examId },
        data: { totalMarks },
      });
    });

    // Fetch updated exam with questions
    const updatedExam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                options: true,
                correctOption: true,
                difficulty: true,
                subject: true,
                topic: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            questions: true,
            sections: true,
            submissions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedExam,
      message: 'Questions added to exam successfully',
    });

  } catch (error) {
    console.error('Error adding questions to exam:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get all questions for an exam
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

    // Get exam with questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                options: true,
                correctOption: true,
                difficulty: true,
                subject: true,
                topic: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            questions: true,
            sections: true,
            submissions: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      if (!exam.isPublished) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        examId: exam.id,
        questions: exam.questions,
        totalQuestions: exam._count.questions,
      },
    });

  } catch (error) {
    console.error('Error fetching exam questions:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
