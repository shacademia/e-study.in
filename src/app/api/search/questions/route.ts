import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Validation schema for search parameters
const searchParamsSchema = z.object({
  q: z.string().optional(),
  subject: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  topic: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  authorId: z.string().uuid().optional(),
  page: z.string().optional().default('1').transform(val => parseInt(val)),
  limit: z.string().optional().default('20').transform(val => parseInt(val)),
  sortBy: z.enum(['createdAt', 'updatedAt', 'difficulty', 'subject']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    try {
      jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    let validatedParams;
    try {
      validatedParams = searchParamsSchema.parse(params);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid search parameters', errors: error },
        { status: 400 }
      );
    }

    const {
      q,
      subject,
      difficulty,
      topic,
      tags,
      authorId,
      page,
      limit,
      sortBy,
      sortOrder
    } = validatedParams;

    // Build where clause for filtering
    const whereClause: {
      OR?: Array<{
        content?: { contains: string; mode: 'insensitive' };
        subject?: { contains: string; mode: 'insensitive' };
        topic?: { contains: string; mode: 'insensitive' };
      }>;
      subject?: { equals: string; mode: 'insensitive' };
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      topic?: { contains: string; mode: 'insensitive' };
      tags?: { hasSome: string[] };
      authorId?: string;
    } = {};

    // Text search across content, subject, and topic
    if (q) {
      whereClause.OR = [
        { content: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { topic: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Filter by specific fields
    if (subject) {
      whereClause.subject = { equals: subject, mode: 'insensitive' };
    }

    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    if (topic) {
      whereClause.topic = { contains: topic, mode: 'insensitive' };
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      whereClause.tags = {
        hasSome: tagArray
      };
    }

    if (authorId) {
      whereClause.authorId = authorId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search query with pagination
    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              exams: true,
              examSections: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.question.count({
        where: whereClause
      })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Get aggregated statistics for the search results
    const statistics = await prisma.question.groupBy({
      by: ['difficulty', 'subject'],
      where: whereClause,
      _count: true
    });

    // Format statistics for easier consumption
    const difficultyStats = statistics.reduce((acc, stat) => {
      acc[stat.difficulty] = (acc[stat.difficulty] || 0) + stat._count;
      return acc;
    }, {} as Record<string, number>);

    const subjectStats = statistics.reduce((acc, stat) => {
      acc[stat.subject] = (acc[stat.subject] || 0) + stat._count;
      return acc;
    }, {} as Record<string, number>);

    // Get unique subjects and topics for filter suggestions
    const [subjectSuggestions, topicSuggestions] = await Promise.all([
      prisma.question.findMany({
        where: q ? {
          OR: [
            { content: { contains: q, mode: 'insensitive' } },
            { subject: { contains: q, mode: 'insensitive' } },
            { topic: { contains: q, mode: 'insensitive' } }
          ]
        } : {},
        select: { subject: true },
        distinct: ['subject'],
        take: 10
      }),
      prisma.question.findMany({
        where: q ? {
          OR: [
            { content: { contains: q, mode: 'insensitive' } },
            { subject: { contains: q, mode: 'insensitive' } },
            { topic: { contains: q, mode: 'insensitive' } }
          ]
        } : {},
        select: { topic: true },
        distinct: ['topic'],
        take: 10
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPreviousPage
        },
        statistics: {
          difficulty: difficultyStats,
          subject: subjectStats
        },
        suggestions: {
          subjects: subjectSuggestions.map(s => s.subject),
          topics: topicSuggestions.map(t => t.topic)
        },
        filters: {
          query: q,
          subject,
          difficulty,
          topic,
          tags,
          authorId,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Question search error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
