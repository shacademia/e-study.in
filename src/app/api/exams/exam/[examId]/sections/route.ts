// POST /api/exams/[examId]/sections - Create exam section
// GET /api/exams/[examId]/sections - Get all sections for an exam

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for creating a section
const createSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  description: z.string().optional().default(''),
  timeLimit: z.number().min(0, 'Time limit cannot be negative').optional().default(0),
  marks: z.number().min(0, 'Marks cannot be negative').optional().default(0),
});

// POST - Create exam section
export async function POST(
  request: Request,
  { params }: { params: { examId: string } }
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
      return NextResponse.json({ error: 'Insufficient permissions to create exam sections' }, { status: 403 });
    }

    const examId = params.examId;

    // Check if exam exists and user has permission
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, createdById: true, isPublished: true, name: true }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check permissions - only exam creator or admin can add sections
    //&& exam.createdById !== userId
    //EDITED

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Insufficient permissions to modify this exam' }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = createSectionSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { name, description, timeLimit, marks } = parsedData.data;

    // Check if section name already exists in this exam
    const existingSection = await prisma.examSection.findFirst({
      where: {
        examId: examId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existingSection) {
      return NextResponse.json({
        error: 'Section name already exists in this exam',
        details: 'Please choose a different name for the section.',
      }, { status: 409 });
    }

    // Create the section
    const section = await prisma.examSection.create({
      data: {
        name,
        description,
        timeLimit,
        marks,
        examId,
      },
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
          orderBy: {
            order: 'asc',
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: section,
      message: 'Exam section created successfully',
    });

  } catch (error) {
    console.error('Error creating exam section:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get all sections for an exam
export async function GET(
  request: Request,
  { params }: { params: { examId: string } }
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

    const examId = params.examId;

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { 
        id: true, 
        name: true, 
        isPublished: true, 
        createdById: true,
        timeLimit: true,
        totalMarks: true,
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check permissions - non-admin users can only see published exams or their own
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {

      //&& exam.createdById !== userId
      //EDITED
      
      if (!exam.isPublished) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }
    }

    // Get all sections with their questions
    const sections = await prisma.examSection.findMany({
      where: { examId },
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
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate section statistics
    const sectionsWithStats = sections.map(section => {
      const totalMarks = section.questions.reduce((sum, q) => sum + q.marks, 0);
      const difficultyStats = section.questions.reduce((acc, q) => {
        const difficulty = q.question.difficulty;
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        ...section,
        questionsCount: section._count.questions,
        totalMarks,
        difficultyStats,
      };
    });

    // Calculate overall exam statistics
    const totalQuestions = sections.reduce((sum, section) => sum + section._count.questions, 0);
    const totalSectionMarks = sectionsWithStats.reduce((sum, section) => sum + section.totalMarks, 0);
    const totalSectionTime = sections.reduce((sum, section) => sum + (section.timeLimit || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        exam: {
          id: exam.id,
          name: exam.name,
          isPublished: exam.isPublished,
          timeLimit: exam.timeLimit,
          totalMarks: exam.totalMarks,
        },
        sections: sectionsWithStats,
        statistics: {
          totalSections: sections.length,
          totalQuestions,
          totalSectionMarks,
          totalSectionTime,
          averageQuestionsPerSection: sections.length > 0 ? Math.round(totalQuestions / sections.length) : 0,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching exam sections:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
