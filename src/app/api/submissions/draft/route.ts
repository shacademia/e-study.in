import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for draft submission
const draftSubmissionSchema = z.object({
  examId: z.string().uuid('Invalid exam ID format'),
  answers: z.record(z.string(), z.number()).optional().default({}),
  questionStatuses: z.record(z.string(), z.object({
    status: z.enum(['NOT_ANSWERED', 'ANSWERED', 'MARKED_FOR_REVIEW']),
    answer: z.number().optional(),
    timeSpent: z.number().min(0).default(0)
  })).optional().default({}),
  timeSpent: z.number().min(0).default(0),
  currentQuestionId: z.string().optional(),
  sectionId: z.string().optional(),
});

// Schema for getting draft
const getDraftSchema = z.object({
  examId: z.string().uuid('Invalid exam ID format'),
});

// POST /api/submissions/draft - Save draft submission (auto-save)
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
    const userId = decoded.id;

    const body = await request.json();
    const parsedData = draftSubmissionSchema.safeParse(body);

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

    const { examId, answers, questionStatuses, timeSpent, currentQuestionId, sectionId } = parsedData.data;

    // Verify exam exists and is accessible
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        name: true,
        isPublished: true,
        questions: {
          select: { id: true, questionId: true }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      );
    }

    if (!exam.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Exam is not published' },
        { status: 403 }
      );
    }

    // Check if draft already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        userId_examId: {
          userId,
          examId
        }
      },
      include: {
        questionStatuses: true
      }
    });

    const totalQuestions = exam.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (existingSubmission) {
      // Update existing draft
      const updatedSubmission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          answers: answers,
          timeSpent: timeSpent,
          totalQuestions: totalQuestions,
          updatedAt: new Date()
        }
      });

      // Update question statuses
      for (const [questionId, status] of Object.entries(questionStatuses)) {
        await prisma.questionStatus.upsert({
          where: {
            questionId_submissionId: {
              questionId,
              submissionId: updatedSubmission.id
            }
          },
          update: {
            status: status.status as any,
            answer: status.answer,
            timeSpent: status.timeSpent
          },
          create: {
            questionId,
            submissionId: updatedSubmission.id,
            status: status.status as any,
            answer: status.answer,
            timeSpent: status.timeSpent
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          submissionId: updatedSubmission.id,
          lastSaved: updatedSubmission.updatedAt,
          progress: {
            answered: answeredCount,
            total: totalQuestions,
            percentage: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0
          }
        },
        message: 'Draft saved successfully'
      });
    } else {
      // Create new draft submission
      const newSubmission = await prisma.submission.create({
        data: {
          userId,
          examId,
          answers: answers,
          timeSpent: timeSpent,
          totalQuestions: totalQuestions,
          isSubmitted: false
        }
      });

      // Create question statuses
      for (const [questionId, status] of Object.entries(questionStatuses)) {
        await prisma.questionStatus.create({
          data: {
            questionId,
            submissionId: newSubmission.id,
            status: status.status as any,
            answer: status.answer,
            timeSpent: status.timeSpent
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          submissionId: newSubmission.id,
          lastSaved: newSubmission.createdAt,
          progress: {
            answered: answeredCount,
            total: totalQuestions,
            percentage: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0
          }
        },
        message: 'Draft created successfully'
      });
    }

  } catch (error) {
    console.error("Error saving draft:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save draft"
      },
      { status: 500 }
    );
  }
}

// GET /api/submissions/draft - Get draft submission
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
    const userId = decoded.id;

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json(
        { success: false, error: 'Exam ID is required' },
        { status: 400 }
      );
    }

    const parsedData = getDraftSchema.safeParse({ examId });
    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid exam ID format',
          details: parsedData.error.message
        },
        { status: 400 }
      );
    }

    // Find draft submission
    const draftSubmission = await prisma.submission.findUnique({
      where: {
        userId_examId: {
          userId,
          examId
        }
      },
      include: {
        questionStatuses: true,
        exam: {
          select: {
            id: true,
            name: true,
            timeLimit: true,
            questions: {
              select: { id: true, questionId: true }
            }
          }
        }
      }
    });

    if (!draftSubmission) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    // Format question statuses
    const formattedQuestionStatuses: Record<string, any> = {};
    draftSubmission.questionStatuses.forEach(qs => {
      formattedQuestionStatuses[qs.questionId] = {
        status: qs.status,
        answer: qs.answer,
        timeSpent: qs.timeSpent
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        submissionId: draftSubmission.id,
        examId: draftSubmission.examId,
        answers: draftSubmission.answers,
        questionStatuses: formattedQuestionStatuses,
        timeSpent: draftSubmission.timeSpent,
        totalQuestions: draftSubmission.totalQuestions,
        lastSaved: draftSubmission.updatedAt,
        progress: {
          answered: Object.keys(draftSubmission.answers as any).length,
          total: draftSubmission.totalQuestions,
          percentage: draftSubmission.totalQuestions > 0 
            ? Math.round((Object.keys(draftSubmission.answers as any).length / draftSubmission.totalQuestions) * 100) 
            : 0
        }
      },
      message: 'Draft retrieved successfully'
    });

  } catch (error) {
    console.error("Error retrieving draft:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve draft"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions/draft - Delete draft submission
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json(
        { success: false, error: 'Exam ID is required' },
        { status: 400 }
      );
    }

    const parsedData = getDraftSchema.safeParse({ examId });
    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid exam ID format',
          details: parsedData.error.message
        },
        { status: 400 }
      );
    }

    // Find and delete draft submission
    const draftSubmission = await prisma.submission.findUnique({
      where: {
        userId_examId: {
          userId,
          examId
        }
      }
    });

    if (!draftSubmission) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (draftSubmission.isSubmitted) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete submitted exam' },
        { status: 403 }
      );
    }

    // Delete the draft submission (question statuses will be deleted due to cascade)
    await prisma.submission.delete({
      where: { id: draftSubmission.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting draft:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete draft"
      },
      { status: 500 }
    );
  }
}
