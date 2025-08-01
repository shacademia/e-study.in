// POST /api/exams/[examId]/submissions - Submit exam answers
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for submission data
const submitExamSchema = z.object({
  answers: z.record(z.string(), z.number()),
  questionStatuses: z.record(z.string(), z.object({
    status: z.enum(['NOT_ANSWERED', 'ANSWERED', 'MARKED_FOR_REVIEW']),
    answer: z.number().optional(),
    timeSpent: z.number().min(0).default(0)
  })).optional().default({}),
  totalTimeSpent: z.number().min(0).default(0),
  isSubmitted: z.boolean().default(true),
  sectionTimes: z.record(z.string(), z.number()).optional().default({})
});

// POST /api/exams/[examId]/submissions - Submit exam answers
export async function POST(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
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

    const { examId } = params;
    const body = await request.json();
    
    const parsedData = submitExamSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: parsedData.error.issues
        },
        { status: 400 }
      );
    }

    const { answers, questionStatuses, totalTimeSpent, isSubmitted, sectionTimes } = parsedData.data;

    if (!examId) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam ID is required"
        },
        { status: 400 }
      );
    }

    // Verify exam exists and is published
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            question: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam not found"
        },
        { status: 404 }
      );
    }

    if (!exam.isPublished) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam is not available for submission"
        },
        { status: 403 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found"
        },
        { status: 404 }
      );
    }

    // Check if user has already submitted this exam
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        userId_examId: {
          userId,
          examId
        }
      }
    });

    if (existingSubmission && existingSubmission.isSubmitted) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already submitted this exam"
        },
        { status: 400 }
      );
    }

    // Validate answers format
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid answers format"
        },
        { status: 400 }
      );
    }

    // Calculate score and detailed analysis
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const totalQuestions = exam.questions.length;
    const questionAnalysis = [];

    // Process each question and calculate score
    for (const examQuestion of exam.questions) {
      const question = examQuestion.question;
      const userAnswer = answers[question.id];
      const questionStatus = questionStatuses?.[question.id];
      
      let isCorrect = false;
      let questionScore = 0;
      let negativeScore = 0;

      if (userAnswer !== undefined && userAnswer === question.correctOption) {
        isCorrect = true;
        questionScore = examQuestion.marks;
        score += questionScore;
        correctAnswers++;
      } else if (userAnswer !== undefined) {
        // Apply negative marking for wrong answers
        negativeScore = question.negativeMarks || 0;
        score -= negativeScore;
        questionScore = -negativeScore;
        wrongAnswers++;
      }

      questionAnalysis.push({
        questionId: question.id,
        userAnswer: userAnswer !== undefined ? userAnswer : null,
        correctAnswer: question.correctOption,
        isCorrect,
        score: questionScore,
        positiveMarks: examQuestion.marks,
        negativeMarks: question.negativeMarks || 0,
        timeSpent: questionStatus?.timeSpent || 0,
        status: questionStatus?.status || "NOT_ANSWERED",
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty
      });
    }

    const unanswered = totalQuestions - Object.keys(answers).length;
    const percentage = exam.totalMarks > 0 ? Math.round((score / exam.totalMarks) * 100) : 0;

    // Create or update the submission
    let submission;
    if (existingSubmission) {
      // Update existing draft to submitted
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          answers,
          score,
          totalQuestions,
          timeSpent: totalTimeSpent,
          isSubmitted,
          completedAt: isSubmitted ? new Date() : null,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          userId,
          examId,
          answers,
          score,
          totalQuestions,
          timeSpent: totalTimeSpent,
          isSubmitted,
          completedAt: isSubmitted ? new Date() : null
        }
      });
    }

    // Create/update question statuses
    for (const [questionId, status] of Object.entries(questionStatuses)) {
      await prisma.questionStatus.upsert({
        where: {
          questionId_submissionId: {
            questionId,
            submissionId: submission.id
          }
        },
        update: {
          status: status.status,
          answer: status.answer,
          timeSpent: status.timeSpent
        },
        create: {
          questionId,
          submissionId: submission.id,
          status: status.status,
          answer: status.answer,
          timeSpent: status.timeSpent
        }
      });
    }

    // Create or update ranking if submitted
    if (isSubmitted) {
      await prisma.ranking.upsert({
        where: {
          userId_examId: {
            userId,
            examId
          }
        },
        update: {
          score,
          totalQuestions,
          percentage,
          completedAt: submission.completedAt!,
          rank: 1 // Will need to recalculate ranks for all users
        },
        create: {
          userId,
          examId,
          userName: user.name,
          examName: exam.name,
          score,
          rank: 1,
          totalQuestions,
          percentage,
          completedAt: submission.completedAt!
        }
      });

      // Recalculate ranks for this exam
      const allRankings = await prisma.ranking.findMany({
        where: { examId },
        orderBy: { score: 'desc' }
      });

      for (let i = 0; i < allRankings.length; i++) {
        await prisma.ranking.update({
          where: { id: allRankings[i].id },
          data: { rank: i + 1 }
        });
      }
    }

    // Calculate subject-wise performance
    const subjectPerformance = exam.questions.reduce((acc: Record<string, { correct: number; total: number; percentage: number; totalMarks: number; earnedMarks: number }>, examQuestion) => {
      const question = examQuestion.question;
      const subject = question.subject;
      if (!acc[subject]) {
        acc[subject] = { correct: 0, total: 0, percentage: 0, totalMarks: 0, earnedMarks: 0 };
      }
      acc[subject].total++;
      acc[subject].totalMarks += examQuestion.marks;
      
      if (answers[question.id] === question.correctOption) {
        acc[subject].correct++;
        acc[subject].earnedMarks += examQuestion.marks;
      }
      acc[subject].percentage = Math.round((acc[subject].earnedMarks / acc[subject].totalMarks) * 100);
      return acc;
    }, {});

    // Get user's rank after submission
    let userRank = null;
    if (isSubmitted) {
      const ranking = await prisma.ranking.findUnique({
        where: {
          userId_examId: {
            userId,
            examId
          }
        }
      });
      userRank = ranking?.rank || null;
    }

    const totalParticipants = await prisma.ranking.count({
      where: { examId }
    });

    // Prepare detailed response
    const submissionResult = {
      submission: {
        id: submission.id,
        examId: submission.examId,
        userId: submission.userId,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        timeSpent: submission.timeSpent,
        completedAt: submission.completedAt,
        isSubmitted: submission.isSubmitted
      },
      results: {
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        percentage,
        grade: getGrade(percentage),
        passed: percentage >= 40, // Assuming 40% is passing
        rank: userRank,
        totalParticipants
      },
      analysis: {
        subjectPerformance,
        questionAnalysis,
        timeAnalysis: {
          totalTimeSpent,
          averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0,
          timeLimit: exam.timeLimit * 60,
          timeUtilization: exam.timeLimit > 0 ? Math.round((totalTimeSpent / (exam.timeLimit * 60)) * 100) : 0,
          sectionTimes
        }
      },
      exam: {
        id: exam.id,
        name: exam.name,
        description: exam.description,
        totalMarks: exam.totalMarks,
        timeLimit: exam.timeLimit
      },
      recommendations: generateRecommendations(subjectPerformance, percentage, questionAnalysis)
    };

    return NextResponse.json({
      success: true,
      data: submissionResult,
      message: "Exam submitted successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error submitting exam:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit exam"
      },
      { status: 500 }
    );
  }
}

// GET /api/exams/[examId]/submissions - Get submissions for an exam (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
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

    // Check if user is admin or moderator
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MODERATOR')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { examId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!examId) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam ID is required"
        },
        { status: 400 }
      );
    }

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          select: { id: true, marks: true }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam not found"
        },
        { status: 404 }
      );
    }

    // Get all submissions for the exam (only submitted ones)
    const submissions = await prisma.submission.findMany({
      where: { 
        examId,
        isSubmitted: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        score: 'desc' // Sort by score (highest first)
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalSubmissions = await prisma.submission.count({
      where: { 
        examId,
        isSubmitted: true
      }
    });

    // Enrich submissions with additional data
    const enrichedSubmissions = submissions.map((submission, index) => {
      const percentage = exam.totalMarks > 0 
        ? Math.round((submission.score / exam.totalMarks) * 100) 
        : 0;
      
      return {
        id: submission.id,
        userId: submission.userId,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        timeSpent: submission.timeSpent,
        completedAt: submission.completedAt,
        rank: ((page - 1) * limit) + index + 1,
        user: submission.user,
        percentage,
        grade: getGrade(percentage)
      };
    });

    // Calculate exam statistics
    const allSubmissions = await prisma.submission.findMany({
      where: { 
        examId,
        isSubmitted: true
      },
      select: { score: true }
    });

    const stats = {
      totalSubmissions: allSubmissions.length,
      averageScore: allSubmissions.length > 0 
        ? Math.round(allSubmissions.reduce((sum, sub) => sum + sub.score, 0) / allSubmissions.length) 
        : 0,
      highestScore: allSubmissions.length > 0 ? Math.max(...allSubmissions.map(sub => sub.score)) : 0,
      lowestScore: allSubmissions.length > 0 ? Math.min(...allSubmissions.map(sub => sub.score)) : 0,
      passRate: allSubmissions.length > 0 
        ? Math.round((allSubmissions.filter(sub => (sub.score / exam.totalMarks) >= 0.4).length / allSubmissions.length) * 100) 
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        exam: {
          id: exam.id,
          name: exam.name,
          description: exam.description,
          totalMarks: exam.totalMarks,
          totalQuestions: exam.questions.length
        },
        submissions: enrichedSubmissions,
        statistics: stats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalSubmissions / limit),
          totalItems: totalSubmissions,
          hasNext: (page * limit) < totalSubmissions,
          hasPrev: page > 1
        }
      },
      message: "Exam submissions retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching exam submissions:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch exam submissions"
      },
      { status: 500 }
    );
  }
}

// Helper function to determine grade
function getGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C+";
  if (percentage >= 40) return "C";
  return "F";
}

// Helper function to generate recommendations
function generateRecommendations(
  subjectPerformance: Record<string, { correct: number; total: number; percentage: number; totalMarks: number; earnedMarks: number }>,
  overallPercentage: number,
  questionAnalysis: Array<{
    questionId: string;
    userAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    score: number;
    timeSpent: number;
    status: string;
    subject: string;
    topic: string;
    difficulty: string;
  }>
): string[] {
  const recommendations: string[] = [];

  // Overall performance recommendations
  if (overallPercentage >= 90) {
    recommendations.push("Excellent performance! You have mastered the concepts.");
  } else if (overallPercentage >= 70) {
    recommendations.push("Good job! Focus on reviewing incorrect answers to achieve excellence.");
  } else if (overallPercentage >= 50) {
    recommendations.push("Decent performance. Strengthen weak areas identified below.");
  } else {
    recommendations.push("More practice needed. Focus on fundamental concepts.");
  }

  // Subject-wise recommendations
  Object.entries(subjectPerformance).forEach(([subject, performance]) => {
    if (performance.percentage < 60) {
      recommendations.push(`Improve your ${subject} skills - scored ${performance.percentage}%`);
    }
  });

  // Difficulty-based recommendations
  const difficultyAnalysis = questionAnalysis.reduce((acc: Record<string, { correct: number; total: number }>, analysis) => {
    const difficulty = analysis.difficulty;
    if (!acc[difficulty]) {
      acc[difficulty] = { correct: 0, total: 0 };
    }
    acc[difficulty].total++;
    if (analysis.isCorrect) {
      acc[difficulty].correct++;
    }
    return acc;
  }, {});

  Object.entries(difficultyAnalysis).forEach(([difficulty, stats]) => {
    const percentage = Math.round((stats.correct / stats.total) * 100);
    if (percentage < 50) {
      recommendations.push(`Practice more ${difficulty.toLowerCase()} level questions`);
    }
  });

  return recommendations.slice(0, 6); // Limit to 6 recommendations
}
