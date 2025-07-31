import { prisma } from "@/lib/db";
import { PrismaClient } from "@prisma/client";
import { revalidateTag } from 'next/cache';

// Type definitions for better TypeScript support
interface RankingResult {
  success: boolean;
  message: string;
  data?: {
    rankingId: string;
    userId: string;
    examId: string;
    rank: number;
    score: number;
    percentage: number;
  };
  error?: string;
}

interface SubmissionWithDetails {
  id: string;
  userId: string;
  examId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date | null;
  isSubmitted: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isEmailVerified: boolean;
  } | null;
  exam: {
    id: string;
    name: string;
    description: string;
    isPublished: boolean;
    isDraft: boolean;
    timeLimit: number;
  } | null;
}

export async function createOrUpdateRanking(submissionId: string): Promise<RankingResult> {
  // Input validation
  if (!submissionId || submissionId.trim() === '') {
    return {
      success: false,
      message: 'Valid submissionId is required',
      error: 'MISSING_SUBMISSION_ID'
    };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(submissionId)) {
    return {
      success: false,
      message: 'Invalid submissionId format',
      error: 'INVALID_SUBMISSION_ID'
    };
  }

  try {
    // Fetch submission with enhanced error handling
    const submission: SubmissionWithDetails | null = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            isEmailVerified: true,
          }
        },
        exam: {
          select: {
            id: true,
            name: true,
            description: true,
            isPublished: true,
            isDraft: true,
            timeLimit: true,
          }
        }
      }
    });

    // Enhanced validation checks
    if (!submission) {
      return {
        success: false,
        message: 'Submission not found',
        error: 'SUBMISSION_NOT_FOUND'
      };
    }

    if (!submission.isSubmitted) {
      return {
        success: false,
        message: 'Cannot create ranking for unsubmitted submission',
        error: 'SUBMISSION_NOT_SUBMITTED'
      };
    }

    if (!submission.user) {
      return {
        success: false,
        message: 'User associated with submission not found',
        error: 'USER_NOT_FOUND'
      };
    }

    if (!submission.exam) {
      return {
        success: false,
        message: 'Exam associated with submission not found',
        error: 'EXAM_NOT_FOUND'
      };
    }

    if (!submission.exam.isPublished) {
      return {
        success: false,
        message: 'Cannot create ranking for unpublished exam',
        error: 'EXAM_NOT_PUBLISHED'
      };
    }

    // Validate score data
    if (submission.totalQuestions <= 0) {
      return {
        success: false,
        message: 'Invalid total questions count',
        error: 'INVALID_TOTAL_QUESTIONS'
      };
    }

    if (submission.score < 0) {
      return {
        success: false,
        message: 'Invalid score (cannot be negative)',
        error: 'INVALID_SCORE'
      };
    }

    // Calculate percentage safely
    const percentage = submission.totalQuestions > 0 
      ? (submission.score / submission.totalQuestions) * 100 
      : 0;

    if (percentage > 100) {
      console.warn(`Warning: Percentage > 100% for submission ${submissionId}. Score: ${submission.score}, Total: ${submission.totalQuestions}`);
    }

    // Use database transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create or update ranking
      const ranking = await tx.ranking.upsert({
        where: {
          userId_examId: {
            userId: submission.userId,
            examId: submission.examId
          }
        },
        update: {
          score: submission.score,
          percentage: parseFloat(percentage.toFixed(2)),
          completedAt: submission.completedAt || new Date(),
        },
        create: {
          userId: submission.userId,
          userName: submission.user!.name,
          examId: submission.examId,
          examName: submission.exam!.name,
          score: submission.score,
          rank: 1, // Will be updated in recalculation
          totalQuestions: submission.totalQuestions,
          percentage: parseFloat(percentage.toFixed(2)),
          completedAt: submission.completedAt || new Date(),
          createdAt: new Date()
        }
      });

      // Recalculate ranks for this exam within the transaction
      await recalculateExamRanks(submission.examId, tx);

      // Get the updated ranking with correct rank
      const updatedRanking = await tx.ranking.findUnique({
        where: {
          userId_examId: {
            userId: submission.userId,
            examId: submission.examId
          }
        }
      });

      return { ranking, updatedRanking };
    });

    // Invalidate all relevant caches
    await invalidateRankingCaches();

    // Log successful ranking creation/update
    console.log(`Ranking ${result.ranking.id} created/updated successfully for user ${submission.userId} in exam ${submission.examId}`);

    return {
      success: true,
      message: 'Ranking created/updated successfully',
      data: {
        rankingId: result.ranking.id,
        userId: submission.userId,
        examId: submission.examId,
        rank: result.updatedRanking?.rank || 1,
        score: submission.score,
        percentage: parseFloat(percentage.toFixed(2))
      }
    };

  } catch (error) {
    console.error('Error creating/updating ranking:', error);
    
    // Enhanced error handling
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        return {
          success: false,
          message: 'Database connection failed. Please try again later.',
          error: 'DB_CONNECTION_ERROR'
        };
      }
      
      // Prisma specific errors
      if (error.message.includes('Prisma')) {
        return {
          success: false,
          message: 'Database operation failed. Please try again.',
          error: 'DB_OPERATION_ERROR'
        };
      }
      
      // Unique constraint violations
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          message: 'Ranking already exists for this user and exam.',
          error: 'RANKING_ALREADY_EXISTS'
        };
      }
      
      // Transaction errors
      if (error.message.includes('transaction')) {
        return {
          success: false,
          message: 'Transaction failed. Please try again.',
          error: 'TRANSACTION_ERROR'
        };
      }
    }
    
    // Generic error
    return {
      success: false,
      message: 'Failed to create/update ranking',
      error: 'UNKNOWN_ERROR'
    };
  }
}

// Enhanced rank recalculation with transaction support
async function recalculateExamRanks(examId: string, tx?: PrismaClient): Promise<void> {
  try {
    const prismaClient = tx || prisma;
    
    // Get all rankings for this exam, ordered by score (desc) and completion time (asc)
    const rankings = await prismaClient.ranking.findMany({
      where: { examId },
      orderBy: [
        { score: 'desc' },
        { percentage: 'desc' }, // Secondary sort by percentage
        { completedAt: 'asc' }  // Tertiary sort by completion time
      ]
    });

    if (rankings.length === 0) {
      console.warn(`No rankings found for exam ${examId}`);
      return;
    }

    // Batch update ranks for better performance
    const rankingUpdates = [];
    let currentRank = 1;
    let currentScore = rankings[0]?.score;
    let currentPercentage = rankings[0]?.percentage;

    for (let i = 0; i < rankings.length; i++) {
      const ranking = rankings[i];
      
      // Handle tied scores - users with same score and percentage get same rank
      if (i > 0 && (ranking.score !== currentScore || ranking.percentage !== currentPercentage)) {
        currentRank = i + 1;
        currentScore = ranking.score;
        currentPercentage = ranking.percentage;
      }

      if (ranking.rank !== currentRank) {
        rankingUpdates.push(
          prismaClient.ranking.update({
            where: { id: ranking.id },
            data: { rank: currentRank }
          })
        );
      }
    }

    // Execute all updates in parallel
    if (rankingUpdates.length > 0) {
      await Promise.all(rankingUpdates);
      console.log(`Updated ${rankingUpdates.length} ranking positions for exam ${examId}`);
    }

  } catch (error) {
    console.error(`Error recalculating exam ranks for exam ${examId}:`, error);
    throw new Error(`Failed to recalculate exam ranks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Cache invalidation function
async function invalidateRankingCaches(): Promise<void> {
  try {
    // Invalidate all ranking-related caches
    revalidateTag('rankings');
    revalidateTag('global-rankings');
    revalidateTag('exam-rankings');
    revalidateTag('subject-rankings');
    
    console.log('Successfully invalidated ranking caches');
  } catch (error) {
    console.warn('Could not invalidate ranking caches:', error);
    // Don't throw error - cache invalidation failure shouldn't break the main operation
  }
}

// Utility function to recalculate all exam ranks (for maintenance)
export async function recalculateAllExamRanks(): Promise<{ success: boolean; message: string; processedExams?: string[] }> {
  try {
    // Get all unique exam IDs that have rankings
    const examIds = await prisma.ranking.findMany({
      select: { examId: true },
      distinct: ['examId']
    });

    const processedExams: string[] = [];
    
    for (const { examId } of examIds) {
      await recalculateExamRanks(examId);
      processedExams.push(examId);
    }

    await invalidateRankingCaches();

    return {
      success: true,
      message: `Successfully recalculated ranks for ${processedExams.length} exams`,
      processedExams
    };

  } catch (error) {
    console.error('Error recalculating all exam ranks:', error);
    return {
      success: false,
      message: 'Failed to recalculate all exam ranks'
    };
  }
}

// Function to get ranking statistics (useful for debugging)
export async function getRankingStatistics(examId: string): Promise<{
  totalParticipants: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  scoreDistribution: Record<string, number>;
}> {
  const rankings = await prisma.ranking.findMany({
    where: { examId },
    select: {
      score: true,
      percentage: true
    }
  });

  if (rankings.length === 0) {
    return {
      totalParticipants: 0,
      averageScore: 0,
      averagePercentage: 0,
      highestScore: 0,
      lowestScore: 0,
      scoreDistribution: {}
    };
  }

  const scores = rankings.map(r => r.score);
  const percentages = rankings.map(r => r.percentage);

  // Create score distribution (grouped by 10% ranges)
  const scoreDistribution: Record<string, number> = {};
  percentages.forEach(percentage => {
    const range = `${Math.floor(percentage / 10) * 10}-${Math.floor(percentage / 10) * 10 + 9}%`;
    scoreDistribution[range] = (scoreDistribution[range] || 0) + 1;
  });

  return {
    totalParticipants: rankings.length,
    averageScore: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
    averagePercentage: parseFloat((percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2)),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    scoreDistribution
  };
}
