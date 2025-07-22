// PUT /api/exams/[id]/save-with-sections - Save exam with sections and questions
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for saving exam with sections
const saveExamWithSectionsSchema = z.object({
  exam: z.object({
    name: z.string().min(1, 'Exam name is required'),
    description: z.string().optional().default(''),
    timeLimit: z.number().min(1, 'Time limit must be at least 1 minute'),
    isPasswordProtected: z.boolean().optional().default(false),
    password: z.string().optional(),
    instructions: z.string().optional().default(''),
    isPublished: z.boolean().optional().default(false),
    isDraft: z.boolean().optional().default(true),
  }),
  sections: z.array(z.object({
    id: z.string().optional(), // Optional for new sections
    name: z.string().min(1, 'Section name is required'),
    description: z.string().optional().default(''),
    timeLimit: z.number().optional(),
    questions: z.array(z.object({
      questionId: z.string(),
      order: z.number().default(0),
      marks: z.number().min(0).default(1),
    })).default([]),
  })).default([]),
});

export async function PUT(
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
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const examId = params.id;
    const body = await request.json();
    const parsedData = saveExamWithSectionsSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { exam: examData, sections: sectionsData } = parsedData.data;

    // Validate password if exam is password protected
    if (examData.isPasswordProtected && !examData.password) {
      return NextResponse.json(
        { error: 'Password is required when exam is password protected' },
        { status: 400 }
      );
    }

    // Calculate total marks from all sections
    const totalMarks = sectionsData.reduce((sum, section) => 
      sum + section.questions.reduce((sectionSum, q) => sectionSum + q.marks, 0), 0
    );

    // Save exam with sections in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update exam basic info
      const updatedExam = await tx.exam.upsert({
        where: { id: examId },
        create: {
          id: examId,
          ...examData,
          createdById: userId,
          totalMarks,
          password: examData.isPasswordProtected ? examData.password : null,
        },
        update: {
          ...examData,
          totalMarks,
          password: examData.isPasswordProtected ? examData.password : null,
        },
      });

      // 2. Get existing sections to track which ones to delete
      const existingSections = await tx.examSection.findMany({
        where: { examId: updatedExam.id },
        select: { id: true },
      });

      const existingSectionIds = existingSections.map(s => s.id);
      const incomingSectionIds = sectionsData.map(s => s.id).filter(Boolean) as string[];
      const sectionsToDelete = existingSectionIds.filter(id => !incomingSectionIds.includes(id));

      // 3. Delete sections that are no longer present
      if (sectionsToDelete.length > 0) {
        await tx.examSection.deleteMany({
          where: {
            id: { in: sectionsToDelete },
            examId: updatedExam.id,
          },
        });
      }

      // 4. Delete all existing direct exam-question relationships
      await tx.examQuestion.deleteMany({
        where: { examId: updatedExam.id },
      });

      // 5. Process each section
      const processedSections = [];
      let globalQuestionOrder = 0;
      
      for (let i = 0; i < sectionsData.length; i++) {
        const sectionData = sectionsData[i];
        
        // Calculate section marks
        const sectionMarks = sectionData.questions.reduce((sum, q) => sum + q.marks, 0);

        // Create or update section
        const section = await tx.examSection.upsert({
          where: { 
            id: sectionData.id || `new-section-${i}-${Date.now()}` 
          },
          create: {
            name: sectionData.name,
            description: sectionData.description,
            timeLimit: sectionData.timeLimit,
            marks: sectionMarks,
            examId: updatedExam.id,
          },
          update: {
            name: sectionData.name,
            description: sectionData.description,
            timeLimit: sectionData.timeLimit,
            marks: sectionMarks,
          },
        });

        // 6. Delete old question relationships for this section
        await tx.examSectionQuestion.deleteMany({
          where: { examSectionId: section.id },
        });

        // 7. Create new question relationships for both section and exam
        for (const questionData of sectionData.questions) {
          // Create section-question relationship
          await tx.examSectionQuestion.create({
            data: {
              examSectionId: section.id,
              questionId: questionData.questionId,
              order: questionData.order,
              marks: questionData.marks,
            },
          });

          // Create direct exam-question relationship
          await tx.examQuestion.create({
            data: {
              examId: updatedExam.id,
              questionId: questionData.questionId,
              order: globalQuestionOrder++,
              marks: questionData.marks,
            },
          });
        }

        processedSections.push(section);
      }

      return { exam: updatedExam, sections: processedSections };
    });

    // 8. Fetch the complete exam with sections for response
    const completeExam = await prisma.exam.findUnique({
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
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
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
      data: completeExam,
      message: 'Exam saved with sections successfully',
    });

  } catch (error) {
    console.error('Error saving exam with sections:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
