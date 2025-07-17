// GET /api/exams/[examId]/sections/[sectionId] - Get specific section
// PUT /api/exams/[examId]/sections/[sectionId] - Update exam section
// DELETE /api/exams/[examId]/sections/[sectionId] - Delete exam section

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for updating a section
const updateSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required').optional(),
  description: z.string().optional(),
  timeLimit: z.number().min(0, 'Time limit cannot be negative').optional(),
  marks: z.number().min(0, 'Marks cannot be negative').optional(),
});

// GET - Get specific section
export async function GET(
  request: Request,
  { params }: { params: { examId: string; sectionId: string } }
) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { examId, sectionId } = params;

    // Check if exam exists and user has access
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { 
        id: true, 
        name: true, 
        isPublished: true, 
        createdById: true 
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      if (!exam.isPublished && exam.createdById !== userId) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }
    }

    // Get section with questions
    const section = await prisma.examSection.findUnique({
      where: { 
        id: sectionId,
        examId: examId,
      },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                options: true,
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
            order: 'asc',
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            isPublished: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Calculate section statistics
    const totalMarks = section.questions.reduce((sum, q) => sum + q.marks, 0);
    const difficultyStats = section.questions.reduce((acc, q) => {
      const difficulty = q.question.difficulty;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sectionWithStats = {
      ...section,
      questionsCount: section._count.questions,
      totalMarks,
      difficultyStats,
    };

    return NextResponse.json({
      success: true,
      data: sectionWithStats,
    });

  } catch (error) {
    console.error('Error fetching section:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update exam section
export async function PUT(
  request: Request,
  { params }: { params: { examId: string; sectionId: string } }
) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    // Check if user exists and has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Insufficient permissions to update exam sections' }, { status: 403 });
    }

    const { examId, sectionId } = params;

    // Check if exam exists and user has permission
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, createdById: true, isPublished: true }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check permissions - only exam creator or admin can update
    if (user.role !== 'ADMIN' && exam.createdById !== userId) {
      return NextResponse.json({ error: 'Insufficient permissions to modify this exam' }, { status: 403 });
    }

    // Check if section exists
    const existingSection = await prisma.examSection.findUnique({
      where: { 
        id: sectionId,
        examId: examId,
      },
    });

    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsedData = updateSectionSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const updateData = parsedData.data;

    // Check if new name conflicts with existing sections
    if (updateData.name && updateData.name !== existingSection.name) {
      const nameConflict = await prisma.examSection.findFirst({
        where: {
          examId: examId,
          name: { equals: updateData.name, mode: 'insensitive' },
          id: { not: sectionId },
        },
      });

      if (nameConflict) {
        return NextResponse.json({
          error: 'Section name already exists in this exam',
          details: 'Please choose a different name for the section.',
        }, { status: 409 });
      }
    }

    // Update the section
    const updatedSection = await prisma.examSection.update({
      where: { id: sectionId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                options: true,
                correctOption: true,
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
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSection,
      message: 'Section updated successfully',
    });

  } catch (error) {
    console.error('Error updating section:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete exam section
export async function DELETE(
  request: Request,
  { params }: { params: { examId: string; sectionId: string } }
) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userId = decoded.id;

    // Check if user exists and has permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Insufficient permissions to delete exam sections' }, { status: 403 });
    }

    const { examId, sectionId } = params;

    // Check if exam exists and user has permission
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, createdById: true, isPublished: true }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check permissions - only exam creator or admin can delete
    if (user.role !== 'ADMIN' && exam.createdById !== userId) {
      return NextResponse.json({ error: 'Insufficient permissions to modify this exam' }, { status: 403 });
    }

    // Check if section exists
    const section = await prisma.examSection.findUnique({
      where: { 
        id: sectionId,
        examId: examId,
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Delete the section (cascade will handle questions)
    await prisma.examSection.delete({
      where: { id: sectionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully',
      data: {
        deletedSectionId: sectionId,
        deletedSectionName: section.name,
        questionsRemoved: section._count.questions,
      },
    });

  } catch (error) {
    console.error('Error deleting section:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
