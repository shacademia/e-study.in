import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from 'next/cache';
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";




// Cached function for subject rankings
const getCachedSubjectRankings = unstable_cache(
  async (subject: string) => {
    return await prisma.ranking.findMany({
      where: {
        exam: {
          questions: {
            some: {
              question: {
                subject: subject
              }
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        exam: {
          select: {
            id: true,
            name: true,
            questions: {
              include: {
                question: {
                  select: {
                    subject: true
                  }
                }
              }
            }
          }
        }
      }
    });
  },
  ['subject-rankings'],
  { 
    revalidate: 240, // 4 minutes cache
    tags: ['rankings', 'subject-rankings'] 
  }
);

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-auth-token");

  if (!token) {
    return Response.json({
      success: false,
      message: 'Authentication required',
      errorCode: 'AUTH_REQUIRED'
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    const userId = decoded.id;
    // const userId = searchParams.get('userId');
    const minSubjectRatio = parseFloat(searchParams.get('minSubjectRatio') || '0.5');

    // Enhanced input validation
    if (!subject || subject.trim() === '') {
      return Response.json({
        success: false,
        message: 'Valid subject is required',
        errorCode: 'MISSING_SUBJECT'
      }, { status: 400 });
    }

    // Validate subject name (basic sanitization)
    const sanitizedSubject = subject.trim();
    if (sanitizedSubject.length > 100) {
      return Response.json({
        success: false,
        message: 'Subject name too long (max 100 characters)',
        errorCode: 'SUBJECT_TOO_LONG'
      }, { status: 400 });
    }

    // Validate userId format if provided
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (userId && !uuidRegex.test(userId)) {
      return Response.json({
        success: false,
        message: 'Invalid userId format',
        errorCode: 'INVALID_USER_ID'
      }, { status: 400 });
    }

    // Validate minSubjectRatio
    if (minSubjectRatio < 0 || minSubjectRatio > 1 || isNaN(minSubjectRatio)) {
      return Response.json({
        success: false,
        message: 'minSubjectRatio must be between 0 and 1',
        errorCode: 'INVALID_SUBJECT_RATIO'
      }, { status: 400 });
    }

    // Check if subject exists in the database
    const subjectExists = await prisma.question.findFirst({
      where: { subject: sanitizedSubject },
      select: { id: true }
    });

    if (!subjectExists) {
      return Response.json({
        success: false,
        message: `Subject '${sanitizedSubject}' not found`,
        errorCode: 'SUBJECT_NOT_FOUND'
      }, { status: 404 });
    }

    // Get cached rankings for specified subject
    const rankings = await getCachedSubjectRankings(sanitizedSubject);

    if (rankings.length === 0) {
      return Response.json({
        success: true,
        data: {
          subject: sanitizedSubject,
          top5: [],
          personalRank: null,
          totalParticipants: 0,
          statistics: {
            averageSubjectScore: 0,
            averageSubjectPercentage: 0,
            totalExamsAnalyzed: 0,
            subjectRatioThreshold: minSubjectRatio
          },
          availableExams: []
        },
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }

    // Group by user and calculate subject performance
    const userSubjectPerformance: Record<string, {
      userId: string;
      userName: string;
      userEmail: string;
      totalScore: number;
      totalMaxMarks: number;
      examCount: number;
      totalPercentage: number;
      examsDetails: Array<{
        examId: string;
        examName: string;
        score: number;
        percentage: number;
        subjectRatio: number;
      }>;
    }> = {};
    
    const validExams: Set<string> = new Set();
    
    rankings.forEach(ranking => {
      const rankingUserId = ranking.userId;
      
      // Check if this exam is primarily about the requested subject
      const subjectQuestions = ranking.exam.questions.filter(
        eq => eq.question.subject === sanitizedSubject
      ).length;
      const totalQuestions = ranking.exam.questions.length;
      const subjectRatio = totalQuestions > 0 ? subjectQuestions / totalQuestions : 0;
      
      // Only include if exam has significant portion of the subject
      if (subjectRatio >= minSubjectRatio) {
        validExams.add(ranking.examId);
        
        if (!userSubjectPerformance[rankingUserId]) {
          userSubjectPerformance[rankingUserId] = {
            userId: rankingUserId,
            userName: ranking.user.name,
            userEmail: ranking.user.email,
            totalScore: 0,
            totalMaxMarks: 0,
            examCount: 0,
            totalPercentage: 0,
            examsDetails: []
          };
        }
        
        userSubjectPerformance[rankingUserId].totalScore += ranking.score;
        userSubjectPerformance[rankingUserId].totalMaxMarks += ranking.totalQuestions;
        userSubjectPerformance[rankingUserId].examCount += 1;
        userSubjectPerformance[rankingUserId].totalPercentage += ranking.percentage;
        userSubjectPerformance[rankingUserId].examsDetails.push({
          examId: ranking.examId,
          examName: ranking.examName,
          score: ranking.score,
          percentage: parseFloat(ranking.percentage.toFixed(2)),
          subjectRatio: parseFloat(subjectRatio.toFixed(2))
        });
      }
    });

    // Calculate statistics
    const allSubjectScores = Object.values(userSubjectPerformance).map(user => user.totalScore / user.examCount);
    const allSubjectPercentages = Object.values(userSubjectPerformance).map(user => user.totalPercentage / user.examCount);
    
    const statistics = {
      averageSubjectScore: allSubjectScores.length > 0 ? 
        parseFloat((allSubjectScores.reduce((a, b) => a + b, 0) / allSubjectScores.length).toFixed(2)) : 0,
      averageSubjectPercentage: allSubjectPercentages.length > 0 ? 
        parseFloat((allSubjectPercentages.reduce((a, b) => a + b, 0) / allSubjectPercentages.length).toFixed(2)) : 0,
      totalExamsAnalyzed: validExams.size,
      subjectRatioThreshold: minSubjectRatio,
      totalParticipants: Object.keys(userSubjectPerformance).length
    };

    // Create subject rankings
    const subjectRankings = Object.values(userSubjectPerformance)
      .map(user => ({
        ...user,
        subjectAverage: user.totalPercentage / user.examCount,
        averageScorePerExam: user.totalScore / user.examCount
      }))
      .sort((a, b) => b.subjectAverage - a.subjectAverage)
      .map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        subjectAverage: parseFloat(user.subjectAverage.toFixed(2)),
        averageScorePerExam: parseFloat(user.averageScorePerExam.toFixed(2)),
        totalExams: user.examCount,
        totalScore: user.totalScore,
        totalMaxMarks: user.totalMaxMarks,
        overallAccuracy: parseFloat(((user.totalScore / user.totalMaxMarks) * 100).toFixed(2)),
        examsDetails: user.examsDetails
      }));

    // Get top 5
    const top5 = subjectRankings.slice(0, 5).map(user => ({
      rank: user.rank,
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      subjectAverage: user.subjectAverage,
      averageScorePerExam: user.averageScorePerExam,
      totalExams: user.totalExams,
      overallAccuracy: user.overallAccuracy,
      performance: {
        aboveAveragePercentage: user.subjectAverage > statistics.averageSubjectPercentage,
        consistencyScore: user.examsDetails.length > 1 ? 
          parseFloat((100 - (Math.max(...user.examsDetails.map(e => e.percentage)) - Math.min(...user.examsDetails.map(e => e.percentage)))).toFixed(1)) : 100
      }
    }));
    
    // Find personal rank
    let personalRank = null;
    if (userId) {
      const userIndex = subjectRankings.findIndex(r => r.userId === userId);
      if (userIndex !== -1) {
        const userRanking = subjectRankings[userIndex];
        const betterThanCount = subjectRankings.filter(r => r.rank > userRanking.rank).length;
        const percentile = betterThanCount > 0 ? 
          parseFloat(((betterThanCount / subjectRankings.length) * 100).toFixed(1)) : 0;

        personalRank = {
          ...userRanking,
          totalParticipants: subjectRankings.length,
          percentile: percentile,
          performance: {
            aboveAveragePercentage: userRanking.subjectAverage > statistics.averageSubjectPercentage,
            rankCategory: userRanking.rank <= 5 ? 'top5' : 
                        userRanking.rank <= Math.ceil(subjectRankings.length * 0.1) ? 'top10%' :
                        userRanking.rank <= Math.ceil(subjectRankings.length * 0.25) ? 'top25%' : 'other',
            consistencyScore: userRanking.examsDetails.length > 1 ? 
              parseFloat((100 - (Math.max(...userRanking.examsDetails.map(e => e.percentage)) - Math.min(...userRanking.examsDetails.map(e => e.percentage)))).toFixed(1)) : 100,
            improvementTrend: userRanking.examsDetails.length > 1 ? 
              userRanking.examsDetails[userRanking.examsDetails.length - 1].percentage > userRanking.examsDetails[0].percentage ? 'improving' : 'declining' : 'insufficient_data'
          }
        };
      } else {
        // Check if user exists but hasn't taken subject exams
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true }
        });

        if (userExists) {
          personalRank = {
            rank: null,
            userId: userId,
            userName: userExists.name,
            userEmail: userExists.email,
            subjectAverage: null,
            totalExams: 0,
            hasNotTakenSubjectExams: true,
            totalParticipants: subjectRankings.length
          };
        }
      }
    }

    // Get available exams info
    const availableExams = Array.from(validExams).map(examId => {
      const examRanking = rankings.find(r => r.examId === examId);
      return {
        examId: examId,
        examName: examRanking?.examName || '',
        participantCount: rankings.filter(r => r.examId === examId).length
      };
    });

    return Response.json({
      success: true,
      data: {
        subject: sanitizedSubject,
        top5: top5,
        personalRank: personalRank,
        totalParticipants: subjectRankings.length,
        statistics: statistics,
        availableExams: availableExams,
        metadata: {
          subjectRatioUsed: minSubjectRatio,
          rankingMethod: 'subject_average_desc',
          lastUpdated: rankings[0]?.createdAt
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Subject ranking error:', error);
    
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
      if (error.message.includes('validation') || error.message.includes('Invalid')) {
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
      message: 'Internal server error occurred while fetching subject rankings.',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

// Cache invalidation function
export async function invalidateSubjectRankingsCache() {
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag('subject-rankings');
  } catch (error) {
    console.warn('Could not invalidate subject rankings cache:', error);
  }
}
