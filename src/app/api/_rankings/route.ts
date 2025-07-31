// GET /api/rankings - Get global rankings across all exams
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters
const globalRankingsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  sortBy: z.enum(['score', 'percentage', 'completedAt', 'rank']).optional().default('rank'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  examId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  includeExamDetails: z.string().optional().transform(val => val === 'true')
});

// GET /api/rankings - Get global rankings
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
    
    const parsedQuery = globalRankingsSchema.safeParse(queryParams);
    
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

    const { page, limit, sortBy, sortOrder, examId, userId: targetUserId, includeExamDetails } = parsedQuery.data;

    // Build where clause
    const where: { examId?: string; userId?: string } = {};
    
    if (examId) {
      where.examId = examId;
    }
    
    if (targetUserId) {
      where.userId = targetUserId;
    }

    // Get rankings with pagination
    const rankings = await prisma.ranking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ...(includeExamDetails && {
          exam: {
            select: {
              id: true,
              name: true,
              description: true,
              totalMarks: true,
              timeLimit: true,
              createdAt: true
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

    const total = await prisma.ranking.count({ where });

    // Calculate additional statistics
    const stats = await prisma.ranking.aggregate({
      where,
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

    // Get top performers (top 5 by percentage)
    const topPerformers = await prisma.ranking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { percentage: 'desc' },
        { score: 'desc' },
        { completedAt: 'asc' }
      ],
      take: 5
    });

    // Format rankings
    const formattedRankings = rankings.map(ranking => ({
      id: ranking.id,
      rank: ranking.rank,
      user: {
        id: ranking.user.id,
        name: ranking.user.name,
        email: ranking.user.email
      },
      ...(includeExamDetails && ranking.exam && {
        exam: {
          id: ranking.exam.id,
          name: ranking.exam.name,
          description: ranking.exam.description,
          totalMarks: ranking.exam.totalMarks,
          timeLimit: ranking.exam.timeLimit,
          createdAt: ranking.exam.createdAt
        }
      }),
      examId: ranking.examId,
      examName: ranking.examName,
      score: ranking.score,
      totalQuestions: ranking.totalQuestions,
      percentage: ranking.percentage,
      completedAt: ranking.completedAt,
      createdAt: ranking.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
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
          totalRankings: stats._count.id,
          averageScore: stats._avg.score ? Math.round(stats._avg.score * 100) / 100 : 0,
          averagePercentage: stats._avg.percentage ? Math.round(stats._avg.percentage * 100) / 100 : 0,
          highestScore: stats._max.score || 0,
          lowestScore: stats._min.score || 0,
          highestPercentage: stats._max.percentage || 0,
          lowestPercentage: stats._min.percentage || 0
        },
        topPerformers: topPerformers.map(tp => ({
          id: tp.id,
          rank: tp.rank,
          user: {
            id: tp.user.id,
            name: tp.user.name,
            email: tp.user.email
          },
          examName: tp.examName,
          score: tp.score,
          percentage: tp.percentage,
          completedAt: tp.completedAt
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching global rankings:', error);
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
