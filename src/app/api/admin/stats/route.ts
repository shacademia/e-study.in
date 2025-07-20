// GET /api/admin/stats - Get dashboard statistics
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters
const adminStatsSchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', 'all']).optional().default('30d'),
  includeRecentData: z.string().optional().transform(val => val === 'true')
});

// GET /api/admin/stats - Get dashboard statistics
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

    // Verify user exists and has admin privileges
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

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsedQuery = adminStatsSchema.safeParse(queryParams);
    
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

    const { timeframe, includeRecentData } = parsedQuery.data;

    // Calculate date range based on timeframe
    const now = new Date();
    const dateRanges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      'all': new Date(0)
    };
    const startDate = dateRanges[timeframe];

    // Get total counts
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalExams,
      publishedExams,
      draftExams,
      totalQuestions,
      totalSubmissions,
      completedSubmissions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'MODERATOR'] } } }),
      prisma.exam.count(),
      prisma.exam.count({ where: { isPublished: true } }),
      prisma.exam.count({ where: { isDraft: true } }),
      prisma.question.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { isSubmitted: true } })
    ]);

    // Get growth metrics for the timeframe
    const [
      newUsers,
      newExams,
      newQuestions,
      newSubmissions
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.exam.count({ where: { createdAt: { gte: startDate } } }),
      prisma.question.count({ where: { createdAt: { gte: startDate } } }),
      prisma.submission.count({ where: { createdAt: { gte: startDate } } })
    ]);

    // Get exam statistics
    const examStats = await prisma.exam.aggregate({
      _avg: {
        timeLimit: true,
        totalMarks: true
      },
      _max: {
        timeLimit: true,
        totalMarks: true
      },
      _min: {
        timeLimit: true,
        totalMarks: true
      }
    });

    // Get submission statistics
    const submissionStats = await prisma.submission.aggregate({
      where: { isSubmitted: true },
      _avg: {
        score: true,
        timeSpent: true
      },
      _max: {
        score: true,
        timeSpent: true
      },
      _min: {
        score: true,
        timeSpent: true
      }
    });

    // Get question difficulty distribution
    const questionDifficulty = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: {
        difficulty: true
      }
    });

    // Get subject distribution
    const subjectDistribution = await prisma.question.groupBy({
      by: ['subject'],
      _count: {
        subject: true
      },
      orderBy: {
        _count: {
          subject: 'desc'
        }
      },
      take: 10
    });

    // Get top performing users (by average score)
    const topUsers = await prisma.ranking.groupBy({
      by: ['userId', 'userName'],
      _avg: {
        percentage: true,
        score: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _avg: {
          percentage: 'desc'
        }
      },
      take: 5
    });

    // Get most popular exams (by submission count)
    const popularExams = await prisma.submission.groupBy({
      by: ['examId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // Get exam names for popular exams
    const popularExamDetails = await prisma.exam.findMany({
      where: {
        id: { in: popularExams.map(e => e.examId) }
      },
      select: {
        id: true,
        name: true,
        isPublished: true,
        createdAt: true
      }
    });

    // Format popular exams with submission counts
    const formattedPopularExams = popularExams.map(exam => {
      const details = popularExamDetails.find(d => d.id === exam.examId);
      return {
        examId: exam.examId,
        examName: details?.name || 'Unknown Exam',
        submissionCount: exam._count.id,
        isPublished: details?.isPublished || false,
        createdAt: details?.createdAt || null
      };
    });

    // Get recent activity if requested
    let recentActivity = null;
    if (includeRecentData) {
      const [recentUsers, recentExams, recentSubmissions] = await Promise.all([
        prisma.user.findMany({
          where: { createdAt: { gte: startDate } },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.exam.findMany({
          where: { createdAt: { gte: startDate } },
          select: {
            id: true,
            name: true,
            isPublished: true,
            createdAt: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.submission.findMany({
          where: { 
            createdAt: { gte: startDate },
            isSubmitted: true
          },
          select: {
            id: true,
            score: true,
            completedAt: true,
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
                name: true
              }
            }
          },
          orderBy: { completedAt: 'desc' },
          take: 10
        })
      ]);

      recentActivity = {
        recentUsers,
        recentExams,
        recentSubmissions
      };
    }

    // Calculate system health metrics
    const activeUsers = await prisma.user.count({
      where: {
        submissions: {
          some: {
            createdAt: { gte: startDate }
          }
        }
      }
    });

    const systemHealth = {
      activeUserRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      examCompletionRate: totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0,
      examPublishRate: totalExams > 0 ? Math.round((publishedExams / totalExams) * 100) : 0,
      avgExamParticipation: totalExams > 0 ? Math.round(completedSubmissions / totalExams) : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStudents,
          totalAdmins,
          totalExams,
          publishedExams,
          draftExams,
          totalQuestions,
          totalSubmissions,
          completedSubmissions
        },
        growth: {
          timeframe,
          newUsers,
          newExams,
          newQuestions,
          newSubmissions
        },
        examStatistics: {
          averageTimeLimit: examStats._avg.timeLimit ? Math.round(examStats._avg.timeLimit) : 0,
          averageTotalMarks: examStats._avg.totalMarks ? Math.round(examStats._avg.totalMarks) : 0,
          maxTimeLimit: examStats._max.timeLimit || 0,
          minTimeLimit: examStats._min.timeLimit || 0,
          maxTotalMarks: examStats._max.totalMarks || 0,
          minTotalMarks: examStats._min.totalMarks || 0
        },
        submissionStatistics: {
          averageScore: submissionStats._avg.score ? Math.round(submissionStats._avg.score * 100) / 100 : 0,
          averageTimeSpent: submissionStats._avg.timeSpent ? Math.round(submissionStats._avg.timeSpent) : 0,
          highestScore: submissionStats._max.score || 0,
          lowestScore: submissionStats._min.score || 0,
          maxTimeSpent: submissionStats._max.timeSpent || 0,
          minTimeSpent: submissionStats._min.timeSpent || 0
        },
        distributions: {
          questionDifficulty: questionDifficulty.reduce((acc, curr) => {
            acc[curr.difficulty] = curr._count.difficulty;
            return acc;
          }, {} as Record<string, number>),
          subjectDistribution: subjectDistribution.map(subject => ({
            subject: subject.subject,
            count: subject._count.subject
          }))
        },
        topPerformers: topUsers.map(user => ({
          userId: user.userId,
          userName: user.userName,
          averagePercentage: user._avg.percentage ? Math.round(user._avg.percentage * 100) / 100 : 0,
          averageScore: user._avg.score ? Math.round(user._avg.score * 100) / 100 : 0,
          examCount: user._count.id
        })),
        popularExams: formattedPopularExams,
        systemHealth,
        ...(recentActivity && { recentActivity })
      }
    });

  } catch (error) {
    console.error('Error fetching admin statistics:', error);
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
