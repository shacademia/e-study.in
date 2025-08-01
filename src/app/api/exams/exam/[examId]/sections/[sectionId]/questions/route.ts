// POST /api/exams/[examId]/sections/[sectionId]/questions - Add questions to section
// GET /api/exams/[examId]/sections/[sectionId]/questions - Get questions in section

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for adding questions to section
const addQuestionsSchema = z.object({
  questionIds: z.array(z.string().uuid('Invalid question ID format')).min(1, 'At least one question ID is required'),
  marks: z.number().min(1, 'Marks must be at least 1').optional().default(1),
});

// POST - Add questions to section
export async function POST(
  request: Request,
  { params }: { params: { examId: string; sectionId: string } }
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
      return NextResponse.json({ error: 'Insufficient permissions to add questions to exam sections' }, { status: 403 });
    }

    const { examId, sectionId } = params;

    // Verify exam exists and user has permission
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, createdById: true, isPublished: true }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // && exam.createdById !== userId
    // EDITED

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Insufficient permissions to modify this exam' }, { status: 403 });
    }

    // Verify section exists and belongs to the exam
    const section = await prisma.examSection.findUnique({
      where: { 
        id: sectionId,
        examId: examId,
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsedData = addQuestionsSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { questionIds, marks } = parsedData.data;

    // Verify all questions exist
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, content: true, subject: true, topic: true, difficulty: true }
    });

    if (questions.length !== questionIds.length) {
      const foundIds = questions.map(q => q.id);
      const missingIds = questionIds.filter(id => !foundIds.includes(id));
      return NextResponse.json({
        error: 'Some questions not found',
        details: `Missing question IDs: ${missingIds.join(', ')}`,
      }, { status: 404 });
    }

    // Check for existing questions in this section
    const existingQuestions = await prisma.examSectionQuestion.findMany({
      where: {
        examSectionId: sectionId,
        questionId: { in: questionIds },
      },
      select: { questionId: true },
    });

    const existingQuestionIds = existingQuestions.map(eq => eq.questionId);
    const newQuestionIds = questionIds.filter(id => !existingQuestionIds.includes(id));

    if (newQuestionIds.length === 0) {
      return NextResponse.json({
        error: 'All questions are already in this section',
        details: 'Please select different questions to add.',
      }, { status: 409 });
    }

    // Get the current maximum order for proper ordering
    const maxOrder = await prisma.examSectionQuestion.findFirst({
      where: { examSectionId: sectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const startOrder = (maxOrder?.order || 0) + 1;

    // Add questions to section
    const sectionQuestions = await Promise.all(
      newQuestionIds.map((questionId, index) =>
        prisma.examSectionQuestion.create({
          data: {
            examSectionId: sectionId,
            questionId,
            order: startOrder + index,
            marks,
          },
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
        })
      )
    );

    // Update section marks if needed
    const totalSectionMarks = await prisma.examSectionQuestion.aggregate({
      where: { examSectionId: sectionId },
      _sum: { marks: true },
    });

    await prisma.examSection.update({
      where: { id: sectionId },
      data: { marks: totalSectionMarks._sum.marks || 0 },
    });

    return NextResponse.json({
      success: true,
      data: {
        addedQuestions: sectionQuestions,
        summary: {
          totalAdded: newQuestionIds.length,
          alreadyExists: existingQuestionIds.length,
          newSectionMarks: totalSectionMarks._sum.marks || 0,
        },
      },
      message: `${newQuestionIds.length} question(s) added to section successfully`,
    });

  } catch (error) {
    console.error('Error adding questions to section:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get questions in section
export async function GET(
  request: Request,
  { params }: { params: { examId: string; sectionId: string } }
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

    const { examId, sectionId } = params;

    // Verify exam and section exist
    const section = await prisma.examSection.findUnique({
      where: { 
        id: sectionId,
        examId: examId,
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            isPublished: true,
            createdById: true,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {

      //&& section.exam.createdById !== userId
      // EDITED
      
      if (!section.exam.isPublished) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }
    }

    // Get questions in section
    const sectionQuestions = await prisma.examSectionQuestion.findMany({
      where: { examSectionId: sectionId },
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
    });

    // Calculate statistics
    const totalQuestions = sectionQuestions.length;
    const totalMarks = sectionQuestions.reduce((sum, sq) => sum + sq.marks, 0);
    const difficultyStats = sectionQuestions.reduce((acc, sq) => {
      const difficulty = sq.question.difficulty;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const subjectStats = sectionQuestions.reduce((acc, sq) => {
      const subject = sq.question.subject;
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        section: {
          id: section.id,
          name: section.name,
          description: section.description,
          timeLimit: section.timeLimit,
          marks: section.marks,
        },
        questions: sectionQuestions,
        statistics: {
          totalQuestions,
          totalMarks,
          difficultyStats,
          subjectStats,
          averageMarksPerQuestion: totalQuestions > 0 ? Math.round((totalMarks / totalQuestions) * 100) / 100 : 0,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching section questions:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
