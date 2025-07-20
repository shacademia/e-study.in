// GET /api/admin/overview - Get admin dashboard overview (Admin only)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// GET /api/admin/overview - Get admin dashboard overview (Admin only)
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
    const adminUserId = decoded.id;

    // Verify admin exists and has proper permissions
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { id: true, role: true }
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    if (adminUser.role !== 'ADMIN' && adminUser.role !== 'MODERATOR') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    // Define time periods
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get key metrics in parallel
    const [
      // Total counts
      totalUsers,
      totalExams,
      totalQuestions,
      totalSubmissions,
      
      // Today's activity
      todayUsers,
      todaySubmissions,
      todayExams,
      
      // Yesterday's activity for comparison
      yesterdayUsers,
      yesterdaySubmissions,
      yesterdayExams,
      
      // Weekly trends
      weeklyUsers,
      weeklySubmissions,
      weeklyExams,
      
      // Monthly trends
      monthlyUsers,
      monthlySubmissions,
      monthlyExams,
      
      // Status counts
      publishedExams,
      draftExams,
      completedSubmissions,
      
      // Role distribution
      adminUsers,
      moderatorUsers,
      regularUsers,
      
      // Recent activity
      recentSubmissions,
      recentUsers,
      recentExams
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.exam.count(),
      prisma.question.count(),
      prisma.submission.count(),
      
      // Today's activity
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.submission.count({ where: { createdAt: { gte: today } } }),
      prisma.exam.count({ where: { createdAt: { gte: today } } }),
      
      // Yesterday's activity
      prisma.user.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      prisma.submission.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      prisma.exam.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      
      // Weekly trends
      prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.submission.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.exam.count({ where: { createdAt: { gte: lastWeek } } }),
      
      // Monthly trends
      prisma.user.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.submission.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.exam.count({ where: { createdAt: { gte: lastMonth } } }),
      
      // Status counts
      prisma.exam.count({ where: { isPublished: true } }),
      prisma.exam.count({ where: { isDraft: true } }),
      prisma.submission.count({ where: { isSubmitted: true } }),
      
      // Role distribution
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'MODERATOR' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      
      // Recent activity
      prisma.submission.findMany({
        where: { isSubmitted: true },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          exam: {
            select: { id: true, name: true }
          }
        },
        orderBy: { completedAt: 'desc' },
        take: 5
      }),
      
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      prisma.exam.findMany({
        select: {
          id: true,
          name: true,
          isPublished: true,
          createdAt: true,
          createdBy: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Get system health indicators
    const activeUsers = await prisma.user.count({
      where: {
        submissions: {
          some: {
            createdAt: { gte: lastWeek }
          }
        }
      }
    });

    const systemHealth = {
      userEngagement: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      examPublishRate: totalExams > 0 ? Math.round((publishedExams / totalExams) * 100) : 0,
      submissionCompletionRate: totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0,
      averageSubmissionsPerUser: totalUsers > 0 ? Math.round((completedSubmissions / totalUsers) * 100) / 100 : 0
    };

    // Get performance insights
    const performanceInsights = await prisma.ranking.aggregate({
      _avg: { percentage: true, score: true },
      _max: { percentage: true, score: true },
      _min: { percentage: true, score: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalExams,
          totalQuestions,
          totalSubmissions,
          publishedExams,
          draftExams,
          completedSubmissions
        },
        
        todayActivity: {
          newUsers: todayUsers,
          newSubmissions: todaySubmissions,
          newExams: todayExams,
          growth: {
            users: calculateGrowth(todayUsers, yesterdayUsers),
            submissions: calculateGrowth(todaySubmissions, yesterdaySubmissions),
            exams: calculateGrowth(todayExams, yesterdayExams)
          }
        },
        
        weeklyTrends: {
          newUsers: weeklyUsers,
          newSubmissions: weeklySubmissions,
          newExams: weeklyExams
        },
        
        monthlyTrends: {
          newUsers: monthlyUsers,
          newSubmissions: monthlySubmissions,
          newExams: monthlyExams
        },
        
        userDistribution: {
          admins: adminUsers,
          moderators: moderatorUsers,
          users: regularUsers,
          active: activeUsers
        },
        
        systemHealth,
        
        performanceInsights: {
          averagePercentage: performanceInsights._avg.percentage ? Math.round(performanceInsights._avg.percentage * 100) / 100 : 0,
          averageScore: performanceInsights._avg.score ? Math.round(performanceInsights._avg.score * 100) / 100 : 0,
          highestPercentage: performanceInsights._max.percentage || 0,
          lowestPercentage: performanceInsights._min.percentage || 0
        },
        
        recentActivity: {
          recentSubmissions: recentSubmissions.map(sub => ({
            id: sub.id,
            score: sub.score,
            completedAt: sub.completedAt,
            user: sub.user,
            exam: sub.exam
          })),
          recentUsers: recentUsers,
          recentExams: recentExams
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin overview:', error);
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
