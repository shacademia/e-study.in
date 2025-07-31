// GET /api/rankings/global - Get global rankings across all exams
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters
const globalRankingsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  sortBy: z.enum(['averageScore', 'totalExams', 'highestScore', 'recentActivity']).optional().default('averageScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeStats: z.string().optional().transform(val => val === 'true')
});

// GET /api/rankings/global - Get global rankings across all exams
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

    const { page, limit, sortBy, sortOrder, includeStats } = parsedQuery.data;

    // Calculate global user statistics
    const userStats = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        rankings: {
          select: {
            score: true,
            percentage: true,
            totalQuestions: true,
            completedAt: true,
            examName: true
          }
        },
        submissions: {
          where: {
            isSubmitted: true
          },
          select: {
            score: true,
            completedAt: true,
            exam: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate aggregated statistics for each user
    const globalRankings = userStats.map(user => {
      const rankings = user.rankings;
      
      if (rankings.length === 0) {
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            joinedAt: user.createdAt
          },
          totalExams: 0,
          averageScore: 0,
          averagePercentage: 0,
          highestScore: 0,
          highestPercentage: 0,
          totalQuestions: 0,
          recentActivity: null,
          examNames: []
        };
      }

      const totalExams = rankings.length;
      const totalScore = rankings.reduce((sum, r) => sum + r.score, 0);
      const totalPercentage = rankings.reduce((sum, r) => sum + r.percentage, 0);
      const highestScore = Math.max(...rankings.map(r => r.score));
      const highestPercentage = Math.max(...rankings.map(r => r.percentage));
      const totalQuestions = rankings.reduce((sum, r) => sum + r.totalQuestions, 0);
      const recentActivity = rankings.length > 0 
        ? rankings.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0].completedAt
        : null;

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          joinedAt: user.createdAt
        },
        totalExams,
        averageScore: totalExams > 0 ? Math.round((totalScore / totalExams) * 100) / 100 : 0,
        averagePercentage: totalExams > 0 ? Math.round((totalPercentage / totalExams) * 100) / 100 : 0,
        highestScore,
        highestPercentage,
        totalQuestions,
        recentActivity,
        examNames: [...new Set(rankings.map(r => r.examName))]
      };
    });

    // Filter out users with no exam activity
    const activeUsers = globalRankings.filter(ranking => ranking.totalExams > 0);

    // Sort based on sortBy parameter
    const sortedRankings = activeUsers.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'averageScore':
          comparison = a.averageScore - b.averageScore;
          break;
        case 'totalExams':
          comparison = a.totalExams - b.totalExams;
          break;
        case 'highestScore':
          comparison = a.highestScore - b.highestScore;
          break;
        case 'recentActivity':
          const aDate = a.recentActivity ? new Date(a.recentActivity).getTime() : 0;
          const bDate = b.recentActivity ? new Date(b.recentActivity).getTime() : 0;
          comparison = aDate - bDate;
          break;
        default:
          comparison = a.averageScore - b.averageScore;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Add global rank
    const rankedUsers = sortedRankings.map((ranking, index) => ({
      ...ranking,
      globalRank: index + 1
    }));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRankings = rankedUsers.slice(startIndex, endIndex);

    // Calculate global statistics if requested
    let globalStats = null;
    if (includeStats) {
      const allRankings = await prisma.ranking.findMany({
        select: {
          score: true,
          percentage: true,
          totalQuestions: true
        }
      });

      if (allRankings.length > 0) {
        globalStats = {
          totalUsers: activeUsers.length,
          totalExams: await prisma.exam.count({ where: { isPublished: true } }),
          totalSubmissions: await prisma.submission.count({ where: { isSubmitted: true } }),
          averageScore: Math.round((allRankings.reduce((sum, r) => sum + r.score, 0) / allRankings.length) * 100) / 100,
          averagePercentage: Math.round((allRankings.reduce((sum, r) => sum + r.percentage, 0) / allRankings.length) * 100) / 100,
          highestScore: Math.max(...allRankings.map(r => r.score)),
          highestPercentage: Math.max(...allRankings.map(r => r.percentage))
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        rankings: paginatedRankings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(rankedUsers.length / limit),
          totalItems: rankedUsers.length,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(rankedUsers.length / limit),
          hasPrevPage: page > 1
        },
        ...(globalStats && { globalStatistics: globalStats }),
        sorting: {
          sortBy,
          sortOrder
        }
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
