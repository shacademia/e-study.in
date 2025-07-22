// GET /api/exams/[id]/edit - Get exam with sections for editing
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Use request headers since it's more reliable
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

    // Get exam with complete section and question details for editing
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
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
          },
          orderBy: { createdAt: 'asc' },
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

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check if user has permission to edit this exam
    if (exam.createdById !== userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions to edit this exam' }, { status: 403 });
    }

    // Transform data for frontend editing
    const examForEdit = {
      exam: {
        id: exam.id,
        name: exam.name,
        description: exam.description,
        timeLimit: exam.timeLimit,
        totalMarks: exam.totalMarks,
        isPasswordProtected: exam.isPasswordProtected,
        password: exam.password,
        instructions: exam.instructions,
        isPublished: exam.isPublished,
        isDraft: exam.isDraft,
        createdBy: exam.createdBy,
        questionsCount: exam._count.questions,
        sectionsCount: exam._count.sections,
        submissionsCount: exam._count.submissions,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      },
      sections: exam.sections.map(section => ({
        id: section.id,
        name: section.name,
        description: section.description,
        timeLimit: section.timeLimit,
        marks: section.marks,
        questionsCount: section.questions.length,
        questions: section.questions.map(esq => ({
          id: esq.id, // ExamSectionQuestion ID
          questionId: esq.questionId,
          order: esq.order,
          marks: esq.marks,
          question: {
            ...esq.question,
            marks: esq.marks, // Use the section-specific marks
          },
        })),
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      })),
      questions: exam.questions?.map(eq => ({
        id: eq.id, // ExamQuestion ID
        questionId: eq.questionId,
        order: eq.order,
        marks: eq.marks,
        question: {
          ...eq.question,
          marks: eq.marks, // Use the exam-specific marks
        },
      })) || [],
    };

    // Prepare response
    const response = {
      success: true,
      data: examForEdit,
      message: 'Exam loaded for editing successfully',
    };
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error loading exam for edit:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
