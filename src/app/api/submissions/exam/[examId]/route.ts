import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters
const examSubmissionsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  sortBy: z.enum(['score', 'completedAt', 'timeSpent', 'createdAt']).optional().default('completedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeDetails: z.string().optional().transform(val => val === 'true'),
  status: z.enum(['submitted', 'draft', 'all']).optional().default('submitted')
});

// GET /api/submissions/exam/[examId] - Get submissions by exam
export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
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

    const { examId } = params;
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const parsedQuery = examSubmissionsSchema.safeParse(queryParams);
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

    const { page, limit, sortBy, sortOrder, includeDetails, status } = parsedQuery.data;

    if (!examId) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam ID is required"
        },
        { status: 400 }
      );
    }

    // Get user role for authorization
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    // Verify exam exists and user has access
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          select: { id: true, marks: true }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam not found"
        },
        { status: 404 }
      );
    }

    // Build where clause
    const where: { examId: string; isSubmitted?: boolean; userId?: string } = { examId };

    // Filter by submission status
    if (status === 'submitted') {
      where.isSubmitted = true;
    } else if (status === 'draft') {
      where.isSubmitted = false;
    }
    // 'all' includes both submitted and draft

    // If not admin/moderator, only show user's own submissions
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MODERATOR') {
      where.userId = userId;
    }

    // Get submissions with pagination
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
        ...(includeDetails && {
          questionStatuses: true
        })
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.submission.count({ where });

    // Format submissions with statistics
    const formattedSubmissions = submissions.map(submission => {
      const answers = submission.answers as Record<string, number>;
      const totalAnswered = Object.keys(answers).length;
      const percentage = submission.totalQuestions > 0 
        ? Math.round((submission.score / exam.totalMarks) * 100) 
        : 0;

      const baseSubmission = {
        id: submission.id,
        userId: submission.userId,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        totalAnswered,
        percentage,
        timeSpent: submission.timeSpent,
        isSubmitted: submission.isSubmitted,
        completedAt: submission.completedAt,
        createdAt: submission.createdAt,
        user: submission.user
      };

      if (includeDetails && submission.questionStatuses) {
        const questionStats = submission.questionStatuses.reduce((acc, qs) => {
          acc[qs.status] = (acc[qs.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...baseSubmission,
          questionStatistics: {
            answered: questionStats.ANSWERED || 0,
            notAnswered: questionStats.NOT_ANSWERED || 0,
            markedForReview: questionStats.MARKED_FOR_REVIEW || 0
          }
        };
      }

      return baseSubmission;
    });

    // Calculate exam statistics
    const examStats = {
      totalSubmissions: total,
      averageScore: submissions.length > 0 
        ? Math.round(submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length)
        : 0,
      highestScore: submissions.length > 0 
        ? Math.max(...submissions.map(sub => sub.score))
        : 0,
      lowestScore: submissions.length > 0 
        ? Math.min(...submissions.map(sub => sub.score))
        : 0,
      averageTimeSpent: submissions.length > 0
        ? Math.round(submissions.reduce((sum, sub) => sum + sub.timeSpent, 0) / submissions.length)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        exam: {
          id: exam.id,
          name: exam.name,
          totalMarks: exam.totalMarks,
          timeLimit: exam.timeLimit,
          totalQuestions: exam.questions.length
        },
        submissions: formattedSubmissions,
        statistics: examStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: "Exam submissions retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching exam submissions:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch exam submissions"
      },
      { status: 500 }
    );
  }
}
