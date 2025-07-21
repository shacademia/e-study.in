import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export async function GET(request: NextRequest) {
  try {
    // Get token from middleware-provided header
    const token = request.headers.get('x-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Decode token to get user info (middleware already validated it)
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || decoded.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's submissions for ranking calculation
    const userSubmissions = await prisma.submission.findMany({
      where: {
        userId: userId,
        isSubmitted: true
      },
      include: {
        exam: {
          select: {
            name: true,
            totalMarks: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    // Calculate user statistics
    const totalExams = userSubmissions.length;
    const totalScore = userSubmissions.reduce((sum: number, sub) => sum + (sub.score || 0), 0);
    const averageScore = totalExams > 0 ? Math.round(totalScore / totalExams) : 0;

    // Get total number of students (for ranking context)
    const totalStudents = await prisma.user.count({
      where: { role: 'USER' }
    });

    // Calculate rank based on average score
    const usersWithBetterAverage = await prisma.submission.groupBy({
      by: ['userId'],
      _avg: {
        score: true
      },
      having: {
        score: {
          _avg: {
            gt: averageScore
          }
        }
      },
      where: {
        isSubmitted: true,
        user: {
          role: 'USER'
        }
      }
    });

    const rank = usersWithBetterAverage.length + 1;

    const ranking = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      globalRank: rank,
      totalStudents: totalStudents,
      averageScore: averageScore,
      totalExams: totalExams,
      totalScore: totalScore,
      recentPerformance: userSubmissions.slice(0, 5).map((sub) => ({
        examName: sub.exam.name,
        score: sub.score,
        totalMarks: sub.exam.totalMarks,
        completedAt: sub.completedAt
      }))
    };

    return NextResponse.json({
      success: true,
      data: ranking
    });

  } catch (error) {
    console.error('Ranking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}