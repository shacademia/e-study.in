import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';

// GET /api/submissions/[id] - Get submission details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('x-auth-token');

  try {
    // Get the token from the Authorization header
 
   if (!token) {
     return NextResponse.json(
       { success: false, error: 'Authentication required' },
       { status: 401 }
     );
   }
 
    
    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, email: string };
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission ID is required"
        },
        { status: 400 }
      );
    }

    // Find submission by ID with all related data
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        exam: {
          include: {
            questions: {
              include: {
                question: {
                  select: {
                    id: true,
                    content: true,
                    questionImage: true,
                    // 3-Layer Question System
                    layer1Type: true,
                    layer1Text: true,
                    layer1Image: true,
                    layer2Type: true,
                    layer2Text: true,
                    layer2Image: true,
                    layer3Type: true,
                    layer3Text: true,
                    layer3Image: true,
                    // Enhanced Options System
                    options: true,
                    optionImages: true,
                    optionTypes: true,
                    correctOption: true,
                    // Marking System
                    positiveMarks: true,
                    negativeMarks: true,
                    // Explanation System
                    explanationType: true,
                    explanationText: true,
                    explanationImage: true,
                    // Classification
                    difficulty: true,
                    subject: true,
                    topic: true,
                    tags: true
                  }
                },
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        questionStatuses: true
      }
    });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found"
        },
        { status: 404 }
      );
    }

    // Check authorization - users can only see their own submissions unless they're admin
    if (submission.userId !== decodedToken.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const answers = submission.answers as Record<string, number>;
    
    // Calculate statistics
    let correctAnswers = 0;
    
    const questionAnalysis = submission.exam.questions.map(examQuestion => {
      const question = examQuestion.question;
      const userAnswer = answers[question.id];
      const questionStatus = submission.questionStatuses.find(qs => qs.questionId === question.id);
      const isCorrect = userAnswer === question.correctOption;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      return {
        questionId: question.id,
        
        // Legacy content
        question: question.content || "",
        questionImage: question.questionImage,
        
        // 3-Layer Question System
        layer1Type: question.layer1Type,
        layer1Text: question.layer1Text,
        layer1Image: question.layer1Image,
        layer2Type: question.layer2Type,
        layer2Text: question.layer2Text,
        layer2Image: question.layer2Image,
        layer3Type: question.layer3Type,
        layer3Text: question.layer3Text,
        layer3Image: question.layer3Image,
        
        // Enhanced Options System
        options: question.options,
        optionImages: question.optionImages || [],
        optionTypes: question.optionTypes,
        correctOption: question.correctOption,
        userAnswer: userAnswer !== undefined ? userAnswer : null,
        isCorrect,
        
        // Marking System
        positiveMarks: question.positiveMarks || examQuestion.marks || 0,
        negativeMarks: question.negativeMarks || 0,
        marks: examQuestion.marks,
        earnedMarks: isCorrect ? (question.positiveMarks || examQuestion.marks || 0) : 
                   (userAnswer !== undefined ? -(question.negativeMarks || 0) : 0),
        
        // Question Status
        timeSpent: questionStatus?.timeSpent || 0,
        status: questionStatus?.status || "NOT_ANSWERED",
        
        // Classification
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        
        // Explanation System (only shown after submission)
        explanationType: question.explanationType,
        explanationText: isCorrect || submission.isSubmitted ? question.explanationText : undefined,
        explanationImage: isCorrect || submission.isSubmitted ? question.explanationImage : undefined
      };
    });

    const totalAnswered = Object.keys(answers).length;
    const wrongAnswers = totalAnswered - correctAnswers;
    const unanswered = submission.totalQuestions - totalAnswered;
    const percentage = submission.totalQuestions > 0 
      ? Math.round((submission.score / submission.exam.totalMarks) * 100) 
      : 0;

    // Subject-wise analysis
    const subjectAnalysis = questionAnalysis.reduce((acc, qa) => {
      if (!acc[qa.subject]) {
        acc[qa.subject] = {
          total: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          totalMarks: 0,
          earnedMarks: 0
        };
      }
      
      acc[qa.subject].total++;
      acc[qa.subject].totalMarks += qa.marks;
      acc[qa.subject].earnedMarks += qa.earnedMarks;
      
      if (qa.userAnswer === null) {
        acc[qa.subject].unanswered++;
      } else if (qa.isCorrect) {
        acc[qa.subject].correct++;
      } else {
        acc[qa.subject].wrong++;
      }
      
      return acc;
    }, {} as Record<string, {
      total: number;
      correct: number;
      wrong: number;
      unanswered: number;
      totalMarks: number;
      earnedMarks: number;
    }>);

    const enrichedSubmission = {
      id: submission.id,
      userId: submission.userId,
      examId: submission.examId,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      timeSpent: submission.timeSpent,
      isSubmitted: submission.isSubmitted,
      completedAt: submission.completedAt,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      user: submission.user,
      exam: {
        id: submission.exam.id,
        name: submission.exam.name,
        description: submission.exam.description,
        totalMarks: submission.exam.totalMarks,
        timeLimit: submission.exam.timeLimit
      },
      statistics: {
        correctAnswers,
        wrongAnswers,
        unanswered,
        percentage,
        totalQuestions: submission.totalQuestions,
        totalMarks: submission.exam.totalMarks,
        earnedMarks: questionAnalysis.reduce((sum, qa) => sum + qa.earnedMarks, 0),
        accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
        timeUtilization: submission.exam.timeLimit > 0 
          ? Math.round((submission.timeSpent / (submission.exam.timeLimit * 60)) * 100) 
          : 0
      },
      questionAnalysis,
      subjectAnalysis,
      performance: {
        grade: percentage >= 90 ? 'A+' : 
               percentage >= 80 ? 'A' : 
               percentage >= 70 ? 'B+' : 
               percentage >= 60 ? 'B' : 
               percentage >= 50 ? 'C' : 'F',
        remarks: percentage >= 90 ? 'Excellent' : 
                percentage >= 80 ? 'Very Good' : 
                percentage >= 70 ? 'Good' : 
                percentage >= 60 ? 'Satisfactory' : 
                percentage >= 50 ? 'Needs Improvement' : 'Poor'
      }
    };

    return NextResponse.json({
      success: true,
      data: enrichedSubmission,
      message: "Submission details retrieved successfully"
    });

  } catch (error) {
    console.error("Error retrieving submission:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve submission details"
      },
      { status: 500 }
    );
  }
}

// PUT /api/submissions/[id] - Update submission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission ID is required"
        },
        { status: 400 }
      );
    }

    // Find existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        exam: true
      }
    });

    if (!existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found"
        },
        { status: 404 }
      );
    }

    // Check authorization - users can only update their own submissions unless they're admin
    if (decodedToken.role !== 'ADMIN' && decodedToken.role !== 'MODERATOR' && existingSubmission.userId !== decodedToken.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Prevent updates to already submitted submissions unless admin
    if (existingSubmission.isSubmitted && decodedToken.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Cannot update already submitted submission' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: {
      answers?: Record<string, number>;
      score?: number;
      timeSpent?: number;
      isSubmitted?: boolean;
      completedAt?: Date;
      updatedAt: Date;
    } = {
      updatedAt: new Date()
    };

    // Only allow certain fields to be updated
    if (body.answers !== undefined) {
      updateData.answers = body.answers;
    }

    if (body.score !== undefined && decodedToken.role === 'ADMIN') {
      updateData.score = body.score;
    }

    if (body.timeSpent !== undefined) {
      updateData.timeSpent = body.timeSpent;
    }

    if (body.isSubmitted !== undefined) {
      updateData.isSubmitted = body.isSubmitted;
      if (body.isSubmitted) {
        updateData.completedAt = new Date();
      }
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: updateData,
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
            description: true,
            totalMarks: true,
            timeLimit: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSubmission,
      message: "Submission updated successfully"
    });

  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update submission",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions/[id] - Delete submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission ID is required"
        },
        { status: 400 }
      );
    }

    // Find submission to verify existence and authorization
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        exam: true
      }
    });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found"
        },
        { status: 404 }
      );
    }

    // Check authorization - only admins can delete submissions
    if (decodedToken.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only administrators can delete submissions' },
        { status: 403 }
      );
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete related question statuses first
      await tx.questionStatus.deleteMany({
        where: { submissionId: id }
      });

      // Delete related rankings
      await tx.ranking.deleteMany({
        where: {
          userId: submission.userId,
          examId: submission.examId
        }
      });

      // Delete the submission
      await tx.submission.delete({
        where: { id }
      });
    });

    // Recalculate rankings for the exam
    const remainingSubmissions = await prisma.submission.findMany({
      where: {
        examId: submission.examId,
        isSubmitted: true
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
            totalMarks: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { timeSpent: 'asc' },
        { completedAt: 'asc' }
      ]
    });

    // Recreate rankings
    for (let i = 0; i < remainingSubmissions.length; i++) {
      const sub = remainingSubmissions[i];
      const percentage = sub.exam.totalMarks > 0 ? (sub.score / sub.exam.totalMarks) * 100 : 0;
      
      await prisma.ranking.create({
        data: {
          userId: sub.userId,
          userName: sub.user.name,
          examId: submission.examId,
          examName: sub.exam.name,
          rank: i + 1,
          score: sub.score,
          totalQuestions: sub.totalQuestions,
          percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
          completedAt: sub.completedAt!
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: { 
        id: submission.id,
        userId: submission.userId,
        examId: submission.examId
      },
      message: "Submission deleted successfully and rankings updated"
    });

  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete submission",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
