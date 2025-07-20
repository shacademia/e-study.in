import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Validation schema for search parameters
const searchParamsSchema = z.object({
  q: z.string().optional(),
  isPublished: z.string().transform(val => val === 'true').optional(),
  creatorId: z.string().uuid().optional(),
  hasPassword: z.string().transform(val => val === 'true').optional(),
  minTimeLimit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxTimeLimit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  page: z.string().optional().default('1').transform(val => parseInt(val)),
  limit: z.string().optional().default('20').transform(val => parseInt(val)),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'timeLimit']).optional().default('createdAt'),
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
    let userInfo;
    try {
      userInfo = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
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
      isPublished,
      creatorId,
      hasPassword,
      minTimeLimit,
      maxTimeLimit,
      page,
      limit,
      sortBy,
      sortOrder
    } = validatedParams;

    // Build where clause for filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: Record<string, any> = {};

    // For non-admin users, only show published exams or their own exams
    if (userInfo.role !== 'ADMIN') {
      whereClause.OR = [
        { isPublished: true },
        { createdById: userInfo.userId }
      ];
    }

    // Text search across name and description
    if (q) {
      const searchConditions = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];

      if (whereClause.OR) {
        // Combine with existing OR conditions (published/own exams)
        whereClause.AND = [
          { OR: whereClause.OR },
          { OR: searchConditions }
        ];
        delete whereClause.OR;
      } else {
        whereClause.OR = searchConditions;
      }
    }

    // Filter by specific fields
    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished;
    }

    if (creatorId) {
      whereClause.createdById = creatorId;
    }

    if (hasPassword !== undefined) {
      whereClause.password = hasPassword ? { not: null } : null;
    }

    if (minTimeLimit !== undefined || maxTimeLimit !== undefined) {
      whereClause.timeLimit = {};
      if (minTimeLimit !== undefined) {
        whereClause.timeLimit.gte = minTimeLimit;
      }
      if (maxTimeLimit !== undefined) {
        whereClause.timeLimit.lte = maxTimeLimit;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search query with pagination
    const [exams, totalCount] = await Promise.all([
      prisma.exam.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          sections: {
            select: {
              id: true,
              name: true,
              timeLimit: true,
              marks: true,
              _count: {
                select: {
                  questions: true
                }
              }
            }
          },
          _count: {
            select: {
              submissions: true,
              questions: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.exam.count({
        where: whereClause
      })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Get aggregated statistics for the search results
    const [publishedCount, draftCount] = await Promise.all([
      prisma.exam.count({
        where: { ...whereClause, isPublished: true }
      }),
      prisma.exam.count({
        where: { ...whereClause, isPublished: false }
      })
    ]);

    const avgTimeLimit = await prisma.exam.aggregate({
      where: whereClause,
      _avg: {
        timeLimit: true
      }
    });

    // Get unique names for suggestions (instead of subjects)
    const nameSuggestions = await prisma.exam.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      } : {},
      select: { name: true },
      distinct: ['name'],
      take: 10
    });

    // Get creators for filter suggestions (for admins)
    let creatorSuggestions: Array<{
      id: string;
      name: string;
      email: string;
    }> = [];
    if (userInfo.role === 'ADMIN') {
      creatorSuggestions = await prisma.user.findMany({
        where: {
          createdExams: {
            some: {}
          }
        },
        select: {
          id: true,
          name: true,
          email: true
        },
        take: 10
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        exams,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPreviousPage
        },
        statistics: {
          published: {
            published: publishedCount,
            draft: draftCount
          },
          averageTimeLimit: Math.round(avgTimeLimit._avg.timeLimit || 0)
        },
        suggestions: {
          names: nameSuggestions.map(s => s.name),
          creators: creatorSuggestions
        },
        filters: {
          query: q,
          isPublished,
          creatorId,
          hasPassword,
          minTimeLimit,
          maxTimeLimit,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Exam search error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
