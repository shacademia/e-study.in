// GET /api/exams/[id] - Get exam details
// PUT /api/exams/[id] - Update exam details
// DELETE /api/exams/[id] - Delete exam

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// Schema for updating an exam
const updateExamSchema = z
  .object({
    name: z.string().min(1, "Exam name is required").optional(),
    description: z.string().optional(),
    timeLimit: z
      .number()
      .min(1, "Time limit must be at least 1 minute")
      .optional(),
    isPasswordProtected: z.boolean().optional(),
    password: z.string().optional(),
    instructions: z.string().optional(),
    isPublished: z.boolean().optional(),
    isDraft: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If isPasswordProtected is true, password must be provided
      if (data.isPasswordProtected === true && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: "Password is required when exam is password protected",
      path: ["password"],
    }
  );

// GET - Get exam details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("x-auth-token");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Await params in Next.js 15+
    const { id: examId } = await params;

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    const userId = decoded.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get exam with all related data
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            questions: {
              include: {
                question: {
                  select: {
                    id: true,
                    content: true,
                    questionImage: true,

                    layer1Type: true,
                    layer1Text: true,
                    layer1Image: true,
                    layer2Type: true,
                    layer2Text: true,
                    layer2Image: true,
                    layer3Type: true,
                    layer3Text: true,
                    layer3Image: true,

                    options: true,
                    optionImages: true,
                    optionTypes: true,
                    correctOption: true,

                    positiveMarks: true,
                    negativeMarks: true,

                    explanationType: true,
                    explanationText: true,
                    explanationImage: true,

                    difficulty: true,
                    subject: true,
                    topic: true,
                    tags: true,
                    author: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                questionImage: true,
                options: true,
                optionImages: true,
                correctOption: true,
                difficulty: true,
                subject: true,
                topic: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            questions: true,
            sections: true,
            submissions: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check permissions - non-admin users can only see published exams or their own drafts
    if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
      if (!exam.isPublished && exam.createdById !== userId) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }
    }

    // Remove password from response for security (except for creators/admins)
    const responseExam = {
      ...exam,
      password:
        exam.isPasswordProtected &&
        (user.role === "ADMIN" ||
          user.role === "MODERATOR" ||
          exam.createdById === userId)
          ? exam.password
          : exam.isPasswordProtected
            ? "[PROTECTED]"
            : undefined,
      questionsCount: exam._count.questions,
      sectionsCount: exam._count.sections,
      submissionsCount: exam._count.submissions,
    };

    return NextResponse.json({
      success: true,
      data: responseExam,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update exam details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("x-auth-token");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Await params in Next.js 15+
    const { id: examId } = await params;

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    const userId = decoded.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if exam exists and user has permission
    const existingExam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, createdById: true, isPublished: true },
    });

    if (!existingExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check permissions - only exam creator or admin can update
    if (
      user.role !== "ADMIN" &&
      user.role !== "MODERATOR" &&
      existingExam.createdById !== userId
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions to update this exam" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsedData = updateExamSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const updateData = parsedData.data;

    // If removing password protection, clear the password
    const finalUpdateData = {
      ...updateData,
      ...(updateData.isPasswordProtected === false && { password: null }),
    };

    // Update the exam
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        ...finalUpdateData,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            questions: {
              include: {
                question: true,
              },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            sections: true,
            submissions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedExam,
      message: "Exam updated successfully",
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete exam
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("x-auth-token");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Await params in Next.js 15+
    const { id: examId } = await params;

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    const userId = decoded.id;

    // Check if user exists and has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return NextResponse.json(
        { error: "Insufficient permissions to delete exams" },
        { status: 403 }
      );
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        name: true,
        createdById: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Additional permission check - only creator or admin can delete
    if (user.role !== "ADMIN" && exam.createdById !== userId) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete this exam" },
        { status: 403 }
      );
    }

    // Warn if exam has submissions
    if (exam._count.submissions > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete exam with existing submissions",
          details: `This exam has ${exam._count.submissions} submission(s). Delete submissions first or contact administrator.`,
        },
        { status: 400 }
      );
    }

    // Delete the exam (cascade will handle related records)
    await prisma.exam.delete({
      where: { id: examId },
    });

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
      data: { deletedExamId: examId, examName: exam.name },
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
