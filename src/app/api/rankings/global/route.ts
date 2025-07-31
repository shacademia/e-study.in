import { prisma } from "@/lib/db";
import { unstable_cache } from 'next/cache';
import { NextRequest } from 'next/server';

// Cached function for better performance
const getCachedGlobalRankings = unstable_cache(
  async () => {
    return await prisma.ranking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  },
  ['global-rankings'],
  { 
    revalidate: 300, // 5 minutes cache
    tags: ['rankings'] 
  }
);

export async function GET(request: NextRequest) {
  try { 
    // Extract pagination parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Max 50, min 1
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit)) {
      return Response.json({
        success: false,
        message: 'Invalid pagination parameters. Page and limit must be numbers.'
      }, { status: 400 });
    }

    // Get cached rankings data
    const rankings = await getCachedGlobalRankings();

    // Handle empty rankings
    if (!rankings || rankings.length === 0) {
      return Response.json({
        success: true,
        data: [],
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: 0,
          totalPages: 0
        },
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }

    // Calculate global performance for each user
    const userPerformance: Record<string, {
      userId: string;
      userName: string;
      userEmail: string;
      totalExams: number;
      totalScore: number;
      totalMaxMarks: number;
      totalPercentage: number;
    }> = {};
    
    rankings.forEach(ranking => {
      const userId = ranking.userId;
      
      if (!userPerformance[userId]) {
        userPerformance[userId] = {
          userId: userId,
          userName: ranking.user.name,
          userEmail: ranking.user.email,
          totalExams: 0,
          totalScore: 0,
          totalMaxMarks: 0,
          totalPercentage: 0
        };
      }
      
      userPerformance[userId].totalExams += 1;
      userPerformance[userId].totalScore += ranking.score;
      userPerformance[userId].totalMaxMarks += ranking.totalQuestions;
      userPerformance[userId].totalPercentage += ranking.percentage;
    });

    // Create complete global rankings
    const allGlobalRankings = Object.values(userPerformance)
      .map(user => ({
        ...user,
        globalAverage: user.totalPercentage / user.totalExams,
        totalPercentage: (user.totalScore / user.totalMaxMarks) * 100
      }))
      .sort((a, b) => b.globalAverage - a.globalAverage)
      .map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        globalAverage: parseFloat(user.globalAverage.toFixed(2)),
        totalExamsCompleted: user.totalExams,
        totalScore: user.totalScore,
        totalMaxMarks: user.totalMaxMarks,
        averagePerExam: parseFloat((user.totalScore / user.totalExams).toFixed(2)),
        totalPercentage: parseFloat(user.totalPercentage.toFixed(2))
      }));

    // Apply pagination
    const totalItems = allGlobalRankings.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedRankings = allGlobalRankings.slice(offset, offset + limit);

    // Pagination validation
    if (page > totalPages && totalPages > 0) {
      return Response.json({
        success: false,
        message: `Page ${page} not found. Total pages: ${totalPages}`
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: paginatedRankings,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      metadata: {
        topPerformer: allGlobalRankings[0] || null,
        averageGlobalScore: allGlobalRankings.length > 0 
          ? parseFloat((allGlobalRankings.reduce((sum, user) => sum + user.globalAverage, 0) / allGlobalRankings.length).toFixed(2))
          : 0
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Global ranking error:', error);
    
    // Enhanced error handling
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        return Response.json({
          success: false,
          message: 'Database connection failed. Please try again later.',
          errorCode: 'DB_CONNECTION_ERROR'
        }, { status: 503 });
      }
      
      // Prisma specific errors
      if (error.message.includes('Prisma')) {
        return Response.json({
          success: false,
          message: 'Database query failed. Please try again.',
          errorCode: 'DB_QUERY_ERROR'
        }, { status: 500 });
      }
      
      // Validation errors
      if (error.message.includes('validation')) {
        return Response.json({
          success: false,
          message: 'Data validation failed.',
          errorCode: 'VALIDATION_ERROR'
        }, { status: 400 });
      }
    }
    
    // Generic server error
    return Response.json({
      success: false,
      message: 'Internal server error occurred while fetching global rankings.',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

// Optional: Add a function to invalidate cache when rankings are updated
export async function invalidateGlobalRankingsCache() {
  // This would be called when new rankings are created/updated
  // You can use this in your createOrUpdateRanking function
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag('rankings');
  } catch (error) {
    console.warn('Could not invalidate cache:', error);
  }
}
