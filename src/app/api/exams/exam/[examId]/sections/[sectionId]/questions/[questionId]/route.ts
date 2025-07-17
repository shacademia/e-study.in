// DELETE /api/exams/[examId]/sections/[sectionId]/questions/[questionId] - Remove question from section

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export async function DELETE(
  request: Request,
  { params }: { params: { examId: string; sectionId: string; questionId: string } }
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
      return NextResponse.json({ error: 'Insufficient permissions to remove questions from exam sections' }, { status: 403 });
    }

    const { examId, sectionId, questionId } = params;

    // Verify exam exists and user has permission
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, createdById: true, isPublished: true, name: true }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && exam.createdById !== userId) {
      return NextResponse.json({ error: 'Insufficient permissions to modify this exam' }, { status: 403 });
    }

    // Verify section exists and belongs to the exam
    const section = await prisma.examSection.findUnique({
      where: { 
        id: sectionId,
        examId: examId,
      },
      select: { id: true, name: true },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Check if question is in this section
    const sectionQuestion = await prisma.examSectionQuestion.findUnique({
      where: {
        examSectionId_questionId: {
          examSectionId: sectionId,
          questionId: questionId,
        },
      },
      include: {
        question: {
          select: {
            id: true,
            content: true,
            subject: true,
            topic: true,
            difficulty: true,
          },
        },
      },
    });

    if (!sectionQuestion) {
      return NextResponse.json({ 
        error: 'Question not found in this section',
        details: 'The question may have already been removed or never existed in this section.',
      }, { status: 404 });
    }

    // Remove the question from section
    await prisma.examSectionQuestion.delete({
      where: {
        examSectionId_questionId: {
          examSectionId: sectionId,
          questionId: questionId,
        },
      },
    });

    // Update section marks
    const remainingMarks = await prisma.examSectionQuestion.aggregate({
      where: { examSectionId: sectionId },
      _sum: { marks: true },
    });

    await prisma.examSection.update({
      where: { id: sectionId },
      data: { marks: remainingMarks._sum.marks || 0 },
    });

    // Reorder remaining questions
    const remainingQuestions = await prisma.examSectionQuestion.findMany({
      where: { examSectionId: sectionId },
      orderBy: { order: 'asc' },
    });

    // Update order for remaining questions
    await Promise.all(
      remainingQuestions.map((sq, index) =>
        prisma.examSectionQuestion.update({
          where: { id: sq.id },
          data: { order: index + 1 },
        })
      )
    );

    // Get updated section stats
    const updatedStats = await prisma.examSectionQuestion.aggregate({
      where: { examSectionId: sectionId },
      _count: { id: true },
      _sum: { marks: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Question removed from section successfully',
      data: {
        removedQuestion: {
          id: sectionQuestion.question.id,
          content: sectionQuestion.question.content,
          subject: sectionQuestion.question.subject,
          topic: sectionQuestion.question.topic,
          difficulty: sectionQuestion.question.difficulty,
        },
        section: {
          id: section.id,
          name: section.name,
        },
        updatedStats: {
          remainingQuestions: updatedStats._count.id,
          totalMarks: updatedStats._sum.marks || 0,
        },
      },
    });

  } catch (error) {
    console.error('Error removing question from section:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
