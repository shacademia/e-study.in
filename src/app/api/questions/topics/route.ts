// GET /api/questions/topics - Get topics by subject

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters validation
const querySchema = z.object({
  subject: z.string().min(1, 'Subject parameter is required'),
  includeStats: z.string().optional().transform((val) => val === 'true'),
});

export async function GET(request: Request) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsedQuery = querySchema.safeParse(queryParams);
    
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsedQuery.error.issues },
        { status: 400 }
      );
    }

    const { subject, includeStats } = parsedQuery.data;

    // Check if the subject exists
    const subjectExists = await prisma.question.findFirst({
      where: { subject: { equals: subject, mode: 'insensitive' } },
      select: { id: true },
    });

    if (!subjectExists) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Get all unique topics for the specified subject
    const topics = await prisma.question.findMany({
      where: {
        subject: { equals: subject, mode: 'insensitive' },
      },
      select: {
        topic: true,
      },
      distinct: ['topic'],
      orderBy: {
        topic: 'asc',
      },
    });

    // Extract topic names and filter out any null/empty values
    const topicNames = topics
      .map(q => q.topic)
      .filter(topic => topic && topic.trim() !== '')
      .sort();

    const baseResponse = {
      success: true,
      data: {
        subject,
        topics: topicNames,
        totalTopics: topicNames.length,
      },
    };

    // Include statistics if requested
    if (includeStats) {
      const topicStats = await Promise.all(
        topicNames.map(async (topic) => {
          const count = await prisma.question.count({
            where: { 
              subject: { equals: subject, mode: 'insensitive' },
              topic: { equals: topic, mode: 'insensitive' },
            },
          });
          
          const difficultyBreakdown = await prisma.question.groupBy({
            by: ['difficulty'],
            where: { 
              subject: { equals: subject, mode: 'insensitive' },
              topic: { equals: topic, mode: 'insensitive' },
            },
            _count: {
              difficulty: true,
            },
          });

          // Get most common tags for this topic
          const tagsData = await prisma.question.findMany({
            where: { 
              subject: { equals: subject, mode: 'insensitive' },
              topic: { equals: topic, mode: 'insensitive' },
            },
            select: { tags: true },
          });

          const allTags = tagsData.flatMap(q => q.tags);
          const tagCounts = allTags.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const topTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count }));

          return {
            name: topic,
            questionCount: count,
            difficultyBreakdown: difficultyBreakdown.reduce((acc, curr) => {
              acc[curr.difficulty] = curr._count.difficulty;
              return acc;
            }, {} as Record<string, number>),
            topTags,
          };
        })
      );

      return NextResponse.json({
        ...baseResponse,
        data: {
          ...baseResponse.data,
          topicStats,
        },
      });
    }

    return NextResponse.json(baseResponse);
  } catch (error) {
    console.error('Error fetching topics:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
