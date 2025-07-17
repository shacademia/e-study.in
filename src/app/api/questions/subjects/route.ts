// GET /api/questions/subjects - Get all unique subjects

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export async function GET(request: Request) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    // Get all unique subjects from questions
    const subjects = await prisma.question.findMany({
      select: {
        subject: true,
      },
      distinct: ['subject'],
      orderBy: {
        subject: 'asc',
      },
    });

    // Extract just the subject names and filter out any null/empty values
    const subjectNames = subjects
      .map(q => q.subject)
      .filter(subject => subject && subject.trim() !== '')
      .sort();

    // Get subject statistics
    const subjectStats = await Promise.all(
      subjectNames.map(async (subject) => {
        const count = await prisma.question.count({
          where: { subject },
        });
        
        const difficultyBreakdown = await prisma.question.groupBy({
          by: ['difficulty'],
          where: { subject },
          _count: {
            difficulty: true,
          },
        });

        return {
          name: subject,
          questionCount: count,
          difficultyBreakdown: difficultyBreakdown.reduce((acc, curr) => {
            acc[curr.difficulty] = curr._count.difficulty;
            return acc;
          }, {} as Record<string, number>),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        subjects: subjectNames,
        subjectStats,
        totalSubjects: subjectNames.length,
      },
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
