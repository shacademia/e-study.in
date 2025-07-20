// GET /api/admin/users - Get all users with detailed info (Admin only)
// POST /api/admin/users - Create new user (Admin only)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for query parameters
const getUsersSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  role: z.enum(['ADMIN', 'USER', 'MODERATOR', 'GUEST', 'all']).optional().default('all'),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'email', 'role']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeStats: z.string().optional().transform(val => val === 'true'),
  active: z.enum(['true', 'false', 'all']).optional().default('all')
});

// Schema for creating a new user
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['ADMIN', 'USER', 'MODERATOR', 'GUEST']).default('USER')
});

// GET /api/admin/users - Get all users with detailed info (Admin only)
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

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const parsedQuery = getUsersSchema.safeParse(queryParams);
    
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

    const { page, limit, role, search, sortBy, sortOrder, includeStats, active } = parsedQuery.data;

    // Build where clause
    const where: any = {};

    // Filter by role
    if (role !== 'all') {
      where.role = role;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by activity (users with recent submissions)
    if (active !== 'all') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (active === 'true') {
        where.submissions = {
          some: {
            createdAt: { gte: thirtyDaysAgo }
          }
        };
      } else {
        where.submissions = {
          none: {
            createdAt: { gte: thirtyDaysAgo }
          }
        };
      }
    }

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ...(includeStats && {
          _count: {
            select: {
              submissions: true,
              rankings: true,
              createdExams: true
            }
          },
          submissions: {
            where: { isSubmitted: true },
            select: {
              score: true,
              completedAt: true
            },
            orderBy: { completedAt: 'desc' },
            take: 1
          }
        })
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.user.count({ where });

    // Format users with additional statistics if requested
    const formattedUsers = users.map(user => {
      const baseUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      if (includeStats && '_count' in user && 'submissions' in user) {
        const stats = user._count as { submissions: number; rankings: number; createdExams: number };
        const lastSubmission = (user.submissions as Array<{ score: number; completedAt: Date | null }>)?.[0];
        
        return {
          ...baseUser,
          statistics: {
            totalSubmissions: stats.submissions,
            totalRankings: stats.rankings,
            totalExamsCreated: stats.createdExams,
            lastActivity: lastSubmission?.completedAt || null,
            lastScore: lastSubmission?.score || null
          }
        };
      }

      return baseUser;
    });

    // Get role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    // Get activity statistics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [activeUsersCount, newUsersCount] = await Promise.all([
      prisma.user.count({
        where: {
          submissions: {
            some: {
              createdAt: { gte: thirtyDaysAgo }
            }
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        statistics: {
          totalUsers: total,
          roleDistribution: roleDistribution.reduce((acc, curr) => {
            acc[curr.role] = curr._count.role;
            return acc;
          }, {} as Record<string, number>),
          activeUsers: activeUsersCount,
          newUsers: newUsersCount
        },
        filters: {
          role,
          search,
          active
        },
        sorting: {
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
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

// POST /api/admin/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
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
      select: { id: true, role: true, name: true, email: true }
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    if (adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Only ADMIN users can create accounts.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsedData = createUserSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsedData.error.issues
        },
        { status: 400 }
      );
    }

    const { email, password, name, role } = parsedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Log the user creation for audit purposes
    console.log(`User created: Admin ${adminUser.email} created user ${newUser.email} with role ${newUser.role}`);

    return NextResponse.json({
      success: true,
      message: 'User account successfully created',
      data: {
        user: newUser,
        createdBy: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email
        }
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
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
