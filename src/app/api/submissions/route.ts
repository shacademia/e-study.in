import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for creating a submission
const createSubmissionSchema = z.object({
  examId: z.string().uuid('Invalid exam ID format'),
  answers: z.record(z.string(), z.number()),
  questionStatuses: z.record(z.string(), z.object({
    status: z.enum(['NOT_ANSWERED', 'ANSWERED', 'MARKED_FOR_REVIEW']),
    answer: z.number().optional(),
    timeSpent: z.number().min(0).default(0)
  })).optional().default({}),
  score: z.number().min(0).optional(),
  totalQuestions: z.number().min(1),
  timeSpent: z.number().min(0).default(0),
  isSubmitted: z.boolean().optional().default(true),
});

// Schema for getting submissions
const getSubmissionsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  examId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'score', 'completedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Helper function to calculate score
async function calculateScore(examId: string, answers: Record<string, number>) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });

  if (!exam) {
    throw new Error('Exam not found');
  }

  let score = 0;
  const totalQuestions = exam.questions.length;

  for (const examQuestion of exam.questions) {
    const userAnswer = answers[examQuestion.questionId];
    if (userAnswer !== undefined && userAnswer === examQuestion.question.correctOption) {
      score += examQuestion.marks;
    }
  }

  return { score, totalQuestions };
}

// GET /api/submissions - Get all submissions (with filtering)
export async function GET(request: NextRequest) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsedQuery = getSubmissionsSchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: parsedQuery.error.issues
        },
        { status: 400 }
      );
    }

    const { page, limit, examId, userId: filterUserId, sortBy, sortOrder } = parsedQuery.data;

    // Build where clause
    const where: any = {};
    
    // If not admin, only show user's own submissions
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      where.userId = userId;
    } else {
      // Admin can filter by userId if provided
      if (filterUserId) {
        where.userId = filterUserId;
      }
    }

    if (examId) {
      where.examId = examId;
    }

    // Only show submitted exams
    where.isSubmitted = true;

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        exam: {
          select: {
            id: true,
            name: true,
            totalMarks: true,
            timeLimit: true
          }
        },
        questionStatuses: true
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.submission.count({ where });

    // Format the response
    const formattedSubmissions = submissions.map(submission => {
      const answers = submission.answers as Record<string, number>;
      const correctAnswers = Object.keys(answers).length; // This would need proper calculation
      const totalAnswered = Object.keys(answers).length;
      const percentage = submission.totalQuestions > 0 
        ? Math.round((submission.score / (submission.totalQuestions * 1)) * 100) // Assuming 1 mark per question
        : 0;

      return {
        id: submission.id,
        userId: submission.userId,
        examId: submission.examId,
        answers: answers, // Include the original answers
        questionStatuses: submission.questionStatuses,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        correctAnswers,
        totalAnswered,
        percentage,
        timeSpent: submission.timeSpent,
        isSubmitted: submission.isSubmitted,
        completedAt: submission.completedAt,
        createdAt: submission.createdAt,
        user: submission.user,
        exam: submission.exam
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        submissions: formattedSubmissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Submissions retrieved successfully'
    });

  } catch (error) {
    console.error("Error retrieving submissions:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve submissions"
      },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Create a new submission (submit exam)
export async function POST(request: NextRequest) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    const body = await request.json();
    const parsedData = createSubmissionSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: parsedData.error.issues
        },
        { status: 400 }
      );
    }

    const { examId, answers, questionStatuses, timeSpent } = parsedData.data;

    // Verify exam exists and is accessible
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      );
    }

    if (!exam.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Exam is not published' },
        { status: 403 }
      );
    }

    // Check if user has already submitted this exam
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        userId_examId: {
          userId,
          examId
        }
      }
    });

    if (existingSubmission && existingSubmission.isSubmitted) {
      return NextResponse.json(
        { success: false, error: 'Exam already submitted' },
        { status: 409 }
      );
    }

    // Calculate score
    const { score, totalQuestions } = await calculateScore(examId, answers);

    let submission;

    if (existingSubmission) {
      // Update existing draft to submitted
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          answers,
          score,
          totalQuestions,
          timeSpent,
          isSubmitted: true,
          completedAt: new Date()
        }
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          userId,
          examId,
          answers,
          score,
          totalQuestions,
          timeSpent,
          isSubmitted: true,
          completedAt: new Date()
        }
      });
    }

    // Update or create question statuses
    for (const [questionId, status] of Object.entries(questionStatuses)) {
      await prisma.questionStatus.upsert({
        where: {
          questionId_submissionId: {
            questionId,
            submissionId: submission.id
          }
        },
        update: {
          status: status.status,
          answer: status.answer,
          timeSpent: status.timeSpent
        },
        create: {
          questionId,
          submissionId: submission.id,
          status: status.status,
          answer: status.answer,
          timeSpent: status.timeSpent
        }
      });
    }

    // Create or update ranking
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    
    await prisma.ranking.upsert({
      where: {
        userId_examId: {
          userId,
          examId
        }
      },
      update: {
        score,
        totalQuestions,
        percentage,
        completedAt: submission.completedAt!
      },
      create: {
        userId,
        examId,
        userName: decoded.email, // You might want to get actual name
        examName: exam.name,
        score,
        rank: 1, // Will need to calculate actual rank
        totalQuestions,
        percentage,
        completedAt: submission.completedAt!
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        submissionId: submission.id,
        score,
        totalQuestions,
        percentage: Math.round(percentage),
        timeSpent,
        completedAt: submission.completedAt
      },
      message: 'Exam submitted successfully'
    });

  } catch (error) {
    console.error("Error creating submission:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit exam"
      },
      { status: 500 }
    );
  }
}
