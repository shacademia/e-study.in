// POST /api/exams/[id]/publish - Publish/unpublish exam

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for publish request
const publishSchema = z.object({
  isPublished: z.boolean(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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
      return NextResponse.json({ error: 'Insufficient permissions to publish exams' }, { status: 403 });
    }

    const examId = params.id;

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        _count: {
          select: {
            questions: true,
            sections: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Additional permission check - only creator or admin can publish

    // EDITED
    //&& exam.createdById !== userId

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions to publish this exam' }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = publishSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { isPublished } = parsedData.data;

    // Validation before publishing
    if (isPublished) {
      // Check if exam has questions (either direct questions or section questions)
      const totalQuestions = exam._count.questions;
      const sectionsWithQuestions = await prisma.examSection.findMany({
        where: { examId: examId },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
      });

      const totalSectionQuestions = sectionsWithQuestions.reduce(
        (sum, section) => sum + section._count.questions,
        0
      );

      if (totalQuestions === 0 && totalSectionQuestions === 0) {
        return NextResponse.json({
          error: 'Cannot publish exam without questions',
          details: 'Please add questions to the exam or exam sections before publishing.',
        }, { status: 400 });
      }

      // Calculate total marks
      const directQuestions = await prisma.examQuestion.findMany({
        where: { examId: examId },
        select: { marks: true },
      });

      const sectionQuestions = await prisma.examSectionQuestion.findMany({
        where: { 
          examSection: {
            examId: examId,
          },
        },
        select: { marks: true },
      });

      const totalMarks = [
        ...directQuestions.map(q => q.marks),
        ...sectionQuestions.map(q => q.marks),
      ].reduce((sum, marks) => sum + marks, 0);

      // Update exam with calculated total marks
      const updatedExam = await prisma.exam.update({
        where: { id: examId },
        data: {
          isPublished,
          isDraft: !isPublished,
          totalMarks,
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
        message: `Exam ${isPublished ? 'published' : 'unpublished'} successfully`,
        summary: {
          totalQuestions: totalQuestions + totalSectionQuestions,
          totalMarks,
          sectionsCount: exam._count.sections,
        },
      });
    } else {
      // Unpublishing exam
      const updatedExam = await prisma.exam.update({
        where: { id: examId },
        data: {
          isPublished,
          isDraft: !isPublished,
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
        message: 'Exam unpublished successfully',
      });
    }

  } catch (error) {
    console.error('Error publishing/unpublishing exam:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
