import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters
const userSubmissionsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  examId: z.string().uuid().optional(),
  sortBy: z.enum(['score', 'completedAt', 'timeSpent', 'createdAt']).optional().default('completedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeStats: z.string().optional().transform(val => val === 'true'),
  status: z.enum(['submitted', 'draft', 'all']).optional().default('submitted')
});

// GET /api/submissions/user/[userId] - Get submissions by user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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
    const currentUserId = decoded.id;

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const parsedQuery = userSubmissionsSchema.safeParse(queryParams);
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

    const { page, limit, examId, sortBy, sortOrder, includeStats, status } = parsedQuery.data;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required"
        },
        { status: 400 }
      );
    }

    // Get current user role for authorization
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    });

    // Check authorization - users can only see their own submissions unless they're admin
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MODERATOR' && userId !== currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found"
        },
        { status: 404 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = { userId };

    // Filter by exam if specified
    if (examId) {
      where.examId = examId;
    }

    // Filter by submission status
    if (status === 'submitted') {
      where.isSubmitted = true;
    } else if (status === 'draft') {
      where.isSubmitted = false;
    }
    // 'all' includes both submitted and draft

    // Get submissions with pagination
    const submissions = await prisma.submission.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            description: true,
            totalMarks: true,
            timeLimit: true,
            isPublished: true
          }
        },
        ...(includeStats && {
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
      const percentage = submission.totalQuestions > 0 && submission.exam.totalMarks > 0
        ? Math.round((submission.score / submission.exam.totalMarks) * 100) 
        : 0;

      const baseSubmission = {
        id: submission.id,
        examId: submission.examId,
        answers: answers, // Include the original answers
        questionStatuses: submission.questionStatuses,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        totalAnswered,
        percentage,
        timeSpent: submission.timeSpent,
        isSubmitted: submission.isSubmitted,
        completedAt: submission.completedAt,
        createdAt: submission.createdAt,
        exam: submission.exam
      };

      if (includeStats && submission.questionStatuses) {
        const questionStats = submission.questionStatuses.reduce((acc, qs) => {
          acc[qs.status] = (acc[qs.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...baseSubmission,
          questionStatistics: {
            answered: questionStats.ANSWERED || 0,
            notAnswered: questionStats.NOT_ANSWERED || 0,
            markedForReview: questionStats.MARKED_FOR_REVIEW || 0,
            accuracy: totalAnswered > 0 
              ? Math.round((submission.score / (totalAnswered * (submission.exam.totalMarks / submission.totalQuestions))) * 100)
              : 0
          },
          timeAnalysis: {
            averageTimePerQuestion: submission.totalQuestions > 0 
              ? Math.round(submission.timeSpent / submission.totalQuestions) 
              : 0,
            timeUtilization: submission.exam.timeLimit > 0 
              ? Math.round((submission.timeSpent / (submission.exam.timeLimit * 60)) * 100) 
              : 0
          }
        };
      }

      return baseSubmission;
    });

    // Calculate user statistics if requested
    let userStats = null;
    if (includeStats) {
      const allSubmissions = await prisma.submission.findMany({
        where: { userId, isSubmitted: true },
        include: {
          exam: {
            select: { totalMarks: true }
          }
        }
      });

      if (allSubmissions.length > 0) {
        const totalScore = allSubmissions.reduce((sum, sub) => sum + sub.score, 0);
        const totalMaxScore = allSubmissions.reduce((sum, sub) => sum + sub.exam.totalMarks, 0);
        const averagePercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

        userStats = {
          totalExamsTaken: allSubmissions.length,
          averageScore: Math.round(totalScore / allSubmissions.length),
          averagePercentage,
          highestScore: Math.max(...allSubmissions.map(sub => sub.score)),
          lowestScore: Math.min(...allSubmissions.map(sub => sub.score)),
          totalTimeSpent: allSubmissions.reduce((sum, sub) => sum + sub.timeSpent, 0),
          averageTimeSpent: Math.round(allSubmissions.reduce((sum, sub) => sum + sub.timeSpent, 0) / allSubmissions.length),
          performance: {
            excellent: allSubmissions.filter(sub => (sub.score / sub.exam.totalMarks) >= 0.9).length,
            good: allSubmissions.filter(sub => (sub.score / sub.exam.totalMarks) >= 0.7 && (sub.score / sub.exam.totalMarks) < 0.9).length,
            average: allSubmissions.filter(sub => (sub.score / sub.exam.totalMarks) >= 0.5 && (sub.score / sub.exam.totalMarks) < 0.7).length,
            poor: allSubmissions.filter(sub => (sub.score / sub.exam.totalMarks) < 0.5).length
          }
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: targetUser,
        submissions: formattedSubmissions,
        statistics: userStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: "User submissions retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching user submissions:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user submissions"
      },
      { status: 500 }
    );
  }
}
