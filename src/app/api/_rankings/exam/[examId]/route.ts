// GET /api/rankings/exam/[examId] - Get rankings for specific exam
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
  includeUserDetails: z.string().optional().transform(val => val === 'true'),
  includeExamDetails: z.string().optional().transform(val => val === 'true'),
  userId: z.string().uuid().optional()
});

// GET /api/rankings/exam/[examId] - Get rankings for specific exam
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
    const { page, limit, sortBy, sortOrder, includeUserDetails, includeExamDetails, userId: targetUserId } = parsedQuery.data;

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        name: true,
        description: true,
        totalMarks: true,
        timeLimit: true,
        isPublished: true,
        createdById: true,
        createdAt: true
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

    // Build where clause
    const where: { examId: string; userId?: string } = { examId };
    
    if (targetUserId) {
      where.userId = targetUserId;
    }

    // Get rankings for the exam
    const rankings = await prisma.ranking.findMany({
      where,
      include: {
        ...(includeUserDetails && {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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

    // Get exam statistics
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

    // Get top 3 performers for this exam
    const topPerformers = await prisma.ranking.findMany({
      where: { examId },
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
        { rank: 'asc' }
      ],
      take: 3
    });

    // Get user's rank if they're looking at their own performance
    let currentUserRank = null;
    if (!targetUserId) {
      currentUserRank = await prisma.ranking.findUnique({
        where: {
          userId_examId: {
            userId,
            examId
          }
        },
        select: {
          rank: true,
          score: true,
          percentage: true,
          completedAt: true
        }
      });
    }

    // Format rankings
    const formattedRankings = rankings.map(ranking => ({
      id: ranking.id,
      rank: ranking.rank,
      ...(includeUserDetails && ranking.user && {
        user: {
          id: ranking.user.id,
          name: ranking.user.name,
          email: ranking.user.email,
          joinedAt: ranking.user.createdAt
        }
      }),
      userId: ranking.userId,
      userName: ranking.userName,
      score: ranking.score,
      totalQuestions: ranking.totalQuestions,
      percentage: ranking.percentage,
      completedAt: ranking.completedAt,
      createdAt: ranking.createdAt
    }));

    // Calculate performance distribution
    const performanceDistribution = await prisma.ranking.groupBy({
      by: ['percentage'],
      where: { examId },
      _count: {
        percentage: true
      }
    });

    const distribution = {
      excellent: performanceDistribution.filter(p => p.percentage >= 90).reduce((sum, p) => sum + p._count.percentage, 0),
      good: performanceDistribution.filter(p => p.percentage >= 70 && p.percentage < 90).reduce((sum, p) => sum + p._count.percentage, 0),
      average: performanceDistribution.filter(p => p.percentage >= 50 && p.percentage < 70).reduce((sum, p) => sum + p._count.percentage, 0),
      poor: performanceDistribution.filter(p => p.percentage < 50).reduce((sum, p) => sum + p._count.percentage, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        rankings: formattedRankings,
        ...(includeExamDetails && {
          exam: {
            id: exam.id,
            name: exam.name,
            description: exam.description,
            totalMarks: exam.totalMarks,
            timeLimit: exam.timeLimit,
            isPublished: exam.isPublished,
            createdAt: exam.createdAt
          }
        }),
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
          lowestPercentage: examStats._min.percentage || 0,
          performanceDistribution: distribution
        },
        topPerformers: topPerformers.map(tp => ({
          rank: tp.rank,
          user: {
            id: tp.user.id,
            name: tp.user.name,
            email: tp.user.email
          },
          score: tp.score,
          percentage: tp.percentage,
          completedAt: tp.completedAt
        })),
        ...(currentUserRank && {
          currentUserRank: {
            rank: currentUserRank.rank,
            score: currentUserRank.score,
            percentage: currentUserRank.percentage,
            completedAt: currentUserRank.completedAt
          }
        }),
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
