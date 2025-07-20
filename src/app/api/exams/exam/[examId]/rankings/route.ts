// GET /api/exams/[examId]/rankings - Get exam rankings
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters
const examRankingsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  sortBy: z.enum(['rank', 'score', 'percentage', 'completedAt']).optional().default('rank'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  includeUserDetails: z.string().optional().transform(val => val === 'true')
});

// GET /api/exams/[examId]/rankings - Get exam rankings
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsedQuery = examRankingsSchema.safeParse(queryParams);
    
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

    const examId = params.examId;
    const { page, limit, sortBy, sortOrder, includeUserDetails } = parsedQuery.data;

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        name: true,
        isPublished: true,
        createdById: true
      }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Check permissions - non-admin users can only see published exams or their own
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      if (!exam.isPublished && exam.createdById !== userId) {
        return NextResponse.json(
          { success: false, error: 'Exam not found' },
          { status: 404 }
        );
      }
    }

    // Get rankings for the exam
    const rankings = await prisma.ranking.findMany({
      where: { examId },
      include: {
        ...(includeUserDetails && {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        })
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.ranking.count({
      where: { examId }
    });

    // Get basic exam statistics
    const examStats = await prisma.ranking.aggregate({
      where: { examId },
      _avg: {
        score: true,
        percentage: true
      },
      _max: {
        score: true,
        percentage: true
      },
      _min: {
        score: true,
        percentage: true
      },
      _count: {
        id: true
      }
    });

    // Format rankings
    const formattedRankings = rankings.map(ranking => ({
      id: ranking.id,
      rank: ranking.rank,
      ...(includeUserDetails && ranking.user && {
        user: {
          id: ranking.user.id,
          name: ranking.user.name,
          email: ranking.user.email
        }
      }),
      userId: ranking.userId,
      userName: ranking.userName,
      score: ranking.score,
      totalQuestions: ranking.totalQuestions,
      percentage: ranking.percentage,
      completedAt: ranking.completedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        examId: exam.id,
        examName: exam.name,
        rankings: formattedRankings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        statistics: {
          totalParticipants: examStats._count.id,
          averageScore: examStats._avg.score ? Math.round(examStats._avg.score * 100) / 100 : 0,
          averagePercentage: examStats._avg.percentage ? Math.round(examStats._avg.percentage * 100) / 100 : 0,
          highestScore: examStats._max.score || 0,
          lowestScore: examStats._min.score || 0,
          highestPercentage: examStats._max.percentage || 0,
          lowestPercentage: examStats._min.percentage || 0
        },
        sorting: {
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error fetching exam rankings:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
