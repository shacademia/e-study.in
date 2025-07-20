// GET /api/admin/analytics - Get detailed analytics data
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters
const adminAnalyticsSchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '180d', '1y', 'all']).optional().default('30d'),
  metric: z.enum(['engagement', 'performance', 'difficulty', 'subjects', 'trends', 'all']).optional().default('all'),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
  includeComparisons: z.string().optional().transform(val => val === 'true')
});

// GET /api/admin/analytics - Get detailed analytics data
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
    
    const parsedQuery = adminAnalyticsSchema.safeParse(queryParams);
    
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

    const { timeframe, metric, groupBy, includeComparisons } = parsedQuery.data;

    // Calculate date range based on timeframe
    const now = new Date();
    const dateRanges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '180d': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      'all': new Date(0)
    };
    const startDate = dateRanges[timeframe];

    const analytics = {} as Record<string, unknown>;

    // User Engagement Analytics
    if (metric === 'engagement' || metric === 'all') {
      // Daily active users
      const dailyActiveUsers = await prisma.$queryRaw`
        SELECT 
          DATE(s."createdAt") as date,
          COUNT(DISTINCT s."userId") as active_users
        FROM "Submission" s
        WHERE s."createdAt" >= ${startDate}
          AND s."isSubmitted" = true
        GROUP BY DATE(s."createdAt")
        ORDER BY date ASC
      `;

      // User registration trend
      const userRegistrations = await prisma.$queryRaw`
        SELECT 
          DATE(u."createdAt") as date,
          COUNT(*) as registrations
        FROM "User" u
        WHERE u."createdAt" >= ${startDate}
        GROUP BY DATE(u."createdAt")
        ORDER BY date ASC
      `;

      // Session duration analytics
      const sessionAnalytics = await prisma.submission.aggregate({
        where: {
          createdAt: { gte: startDate },
          isSubmitted: true
        },
        _avg: {
          timeSpent: true
        },
        _max: {
          timeSpent: true
        },
        _min: {
          timeSpent: true
        }
      });

      // User retention (users who took multiple exams)
      const userRetention = await prisma.$queryRaw`
        SELECT 
          COUNT(CASE WHEN exam_count = 1 THEN 1 END) as single_exam_users,
          COUNT(CASE WHEN exam_count > 1 AND exam_count <= 5 THEN 1 END) as moderate_users,
          COUNT(CASE WHEN exam_count > 5 THEN 1 END) as active_users
        FROM (
          SELECT 
            "userId",
            COUNT(DISTINCT "examId") as exam_count
          FROM "Submission"
          WHERE "isSubmitted" = true
            AND "createdAt" >= ${startDate}
          GROUP BY "userId"
        ) user_activity
      `;

      analytics.engagement = {
        dailyActiveUsers,
        userRegistrations,
        sessionAnalytics: {
          averageSessionDuration: sessionAnalytics._avg.timeSpent ? Math.round(sessionAnalytics._avg.timeSpent / 60) : 0, // in minutes
          maxSessionDuration: sessionAnalytics._max.timeSpent ? Math.round(sessionAnalytics._max.timeSpent / 60) : 0,
          minSessionDuration: sessionAnalytics._min.timeSpent ? Math.round(sessionAnalytics._min.timeSpent / 60) : 0
        },
        userRetention
      };
    }

    // Performance Analytics
    if (metric === 'performance' || metric === 'all') {
      // Score distribution
      const scoreDistribution = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN r.percentage >= 90 THEN 'Excellent (90-100%)'
            WHEN r.percentage >= 80 THEN 'Good (80-89%)'
            WHEN r.percentage >= 70 THEN 'Average (70-79%)'
            WHEN r.percentage >= 60 THEN 'Below Average (60-69%)'
            ELSE 'Poor (<60%)'
          END as performance_category,
          COUNT(*) as count,
          AVG(r.percentage) as avg_percentage
        FROM "Ranking" r
        WHERE r."createdAt" >= ${startDate}
        GROUP BY 
          CASE 
            WHEN r.percentage >= 90 THEN 'Excellent (90-100%)'
            WHEN r.percentage >= 80 THEN 'Good (80-89%)'
            WHEN r.percentage >= 70 THEN 'Average (70-79%)'
            WHEN r.percentage >= 60 THEN 'Below Average (60-69%)'
            ELSE 'Poor (<60%)'
          END
        ORDER BY avg_percentage DESC
      `;

      // Performance trends over time
      const performanceTrends = await prisma.$queryRaw`
        SELECT 
          DATE(r."completedAt") as date,
          AVG(r.percentage) as avg_percentage,
          AVG(r.score) as avg_score,
          COUNT(*) as submissions
        FROM "Ranking" r
        WHERE r."completedAt" >= ${startDate}
        GROUP BY DATE(r."completedAt")
        ORDER BY date ASC
      `;

      // Top performing subjects
      const subjectPerformance = await prisma.$queryRaw`
        SELECT 
          q.subject,
          COUNT(*) as question_count,
          AVG(
            CASE 
              WHEN s.answers::jsonb ? q.id::text 
              AND (s.answers::jsonb->q.id::text)::int = q."correctOption" 
              THEN 100 
              ELSE 0 
            END
          ) as accuracy_rate
        FROM "Question" q
        JOIN "ExamQuestion" eq ON q.id = eq."questionId"
        JOIN "Submission" s ON eq."examId" = s."examId"
        WHERE s."createdAt" >= ${startDate}
          AND s."isSubmitted" = true
        GROUP BY q.subject
        ORDER BY accuracy_rate DESC
      `;

      analytics.performance = {
        scoreDistribution,
        performanceTrends,
        subjectPerformance
      };
    }

    // Difficulty Analysis
    if (metric === 'difficulty' || metric === 'all') {
      // Question difficulty vs performance
      const difficultyAnalysis = await prisma.$queryRaw`
        SELECT 
          q.difficulty,
          COUNT(*) as question_count,
          AVG(
            CASE 
              WHEN s.answers::jsonb ? q.id::text 
              AND (s.answers::jsonb->q.id::text)::int = q."correctOption" 
              THEN 100 
              ELSE 0 
            END
          ) as accuracy_rate,
          AVG(qs."timeSpent") as avg_time_spent
        FROM "Question" q
        JOIN "QuestionStatus" qs ON q.id = qs."questionId"
        JOIN "Submission" s ON qs."submissionId" = s.id
        WHERE s."createdAt" >= ${startDate}
          AND s."isSubmitted" = true
        GROUP BY q.difficulty
        ORDER BY 
          CASE q.difficulty 
            WHEN 'EASY' THEN 1 
            WHEN 'MEDIUM' THEN 2 
            WHEN 'HARD' THEN 3 
          END
      `;

      // Questions needing review (low accuracy rate)
      const problemQuestions = await prisma.$queryRaw`
        SELECT 
          q.id,
          q.content,
          q.subject,
          q.difficulty,
          COUNT(*) as attempt_count,
          AVG(
            CASE 
              WHEN s.answers::jsonb ? q.id::text 
              AND (s.answers::jsonb->q.id::text)::int = q."correctOption" 
              THEN 100 
              ELSE 0 
            END
          ) as accuracy_rate
        FROM "Question" q
        JOIN "ExamQuestion" eq ON q.id = eq."questionId"
        JOIN "Submission" s ON eq."examId" = s."examId"
        WHERE s."createdAt" >= ${startDate}
          AND s."isSubmitted" = true
        GROUP BY q.id, q.content, q.subject, q.difficulty
        HAVING COUNT(*) >= 5  -- Only questions attempted at least 5 times
        ORDER BY accuracy_rate ASC
        LIMIT 10
      `;

      analytics.difficulty = {
        difficultyAnalysis,
        problemQuestions
      };
    }

    // Subject Analytics
    if (metric === 'subjects' || metric === 'all') {
      // Subject popularity and performance
      const subjectAnalytics = await prisma.$queryRaw`
        SELECT 
          q.subject,
          COUNT(DISTINCT q.id) as question_count,
          COUNT(DISTINCT eq."examId") as exam_count,
          COUNT(*) as total_attempts,
          AVG(
            CASE 
              WHEN s.answers::jsonb ? q.id::text 
              AND (s.answers::jsonb->q.id::text)::int = q."correctOption" 
              THEN 100 
              ELSE 0 
            END
          ) as accuracy_rate,
          AVG(qs."timeSpent") as avg_time_per_question
        FROM "Question" q
        JOIN "ExamQuestion" eq ON q.id = eq."questionId"
        JOIN "Submission" s ON eq."examId" = s."examId"
        JOIN "QuestionStatus" qs ON q.id = qs."questionId" AND s.id = qs."submissionId"
        WHERE s."createdAt" >= ${startDate}
          AND s."isSubmitted" = true
        GROUP BY q.subject
        ORDER BY total_attempts DESC
      `;

      // Subject difficulty distribution
      const subjectDifficulty = await prisma.question.groupBy({
        by: ['subject', 'difficulty'],
        _count: {
          id: true
        },
        orderBy: [
          { subject: 'asc' },
          { difficulty: 'asc' }
        ]
      });

      analytics.subjects = {
        subjectAnalytics,
        subjectDifficulty: subjectDifficulty.reduce((acc: Record<string, Record<string, number>>, curr) => {
          if (!acc[curr.subject]) {
            acc[curr.subject] = {};
          }
          acc[curr.subject][curr.difficulty] = curr._count.id;
          return acc;
        }, {})
      };
    }

    // Trend Analysis
    if (metric === 'trends' || metric === 'all') {
      // Exam creation trends
      const examCreationTrends = await prisma.$queryRaw`
        SELECT 
          DATE(e."createdAt") as date,
          COUNT(*) as exams_created,
          COUNT(CASE WHEN e."isPublished" = true THEN 1 END) as published_exams
        FROM "Exam" e
        WHERE e."createdAt" >= ${startDate}
        GROUP BY DATE(e."createdAt")
        ORDER BY date ASC
      `;

      // Submission trends
      const submissionTrends = await prisma.$queryRaw`
        SELECT 
          DATE(s."createdAt") as date,
          COUNT(*) as total_submissions,
          COUNT(CASE WHEN s."isSubmitted" = true THEN 1 END) as completed_submissions,
          AVG(s.score) as avg_score
        FROM "Submission" s
        WHERE s."createdAt" >= ${startDate}
        GROUP BY DATE(s."createdAt")
        ORDER BY date ASC
      `;

      analytics.trends = {
        examCreationTrends,
        submissionTrends
      };
    }

    // Comparison data if requested
    let comparisons = null;
    if (includeComparisons) {
      const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      
      const [currentPeriodStats, previousPeriodStats] = await Promise.all([
        prisma.submission.aggregate({
          where: {
            createdAt: { gte: startDate },
            isSubmitted: true
          },
          _count: { id: true },
          _avg: { score: true }
        }),
        prisma.submission.aggregate({
          where: {
            createdAt: { gte: previousPeriodStart, lt: startDate },
            isSubmitted: true
          },
          _count: { id: true },
          _avg: { score: true }
        })
      ]);

      comparisons = {
        submissions: {
          current: currentPeriodStats._count.id,
          previous: previousPeriodStats._count.id,
          percentageChange: previousPeriodStats._count.id > 0 
            ? Math.round(((currentPeriodStats._count.id - previousPeriodStats._count.id) / previousPeriodStats._count.id) * 100)
            : 100
        },
        averageScore: {
          current: currentPeriodStats._avg.score ? Math.round(currentPeriodStats._avg.score * 100) / 100 : 0,
          previous: previousPeriodStats._avg.score ? Math.round(previousPeriodStats._avg.score * 100) / 100 : 0,
          percentageChange: previousPeriodStats._avg.score 
            ? Math.round(((currentPeriodStats._avg.score! - previousPeriodStats._avg.score) / previousPeriodStats._avg.score) * 100)
            : 0
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        metric,
        groupBy,
        generatedAt: new Date().toISOString(),
        analytics,
        ...(comparisons && { comparisons })
      }
    });

  } catch (error) {
    console.error('Error fetching admin analytics:', error);
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
