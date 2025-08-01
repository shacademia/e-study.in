// PUT /api/exams/[id]/save-sections-chunked - Save exam sections in chunks for production
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for chunked section saving
const saveChunkedSectionsSchema = z.object({
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
    id: z.string().optional(),
    name: z.string().min(1, 'Section name is required'),
    description: z.string().optional().default(''),
    timeLimit: z.number().optional(),
    questions: z.array(z.object({
      questionId: z.string(),
      order: z.number().default(0),
      marks: z.number().min(0).default(1),
    })).default([]),
  })).default([]),
  chunkIndex: z.number().min(0).default(0),
  totalChunks: z.number().min(1).default(1),
  isLastChunk: z.boolean().default(true),
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
    const parsedData = saveChunkedSectionsSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { exam: examData, sections: sectionsData, chunkIndex, totalChunks, isLastChunk } = parsedData.data;

    // Process in smaller transactions
    const result = await prisma.$transaction(async (tx) => {
      let updatedExam;

      // Update exam info only on first chunk
      if (chunkIndex === 0) {
        const totalMarks = sectionsData.reduce((sum, section) => 
          sum + section.questions.reduce((sectionSum, q) => sectionSum + q.marks, 0), 0
        );

        updatedExam = await tx.exam.upsert({
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

        // Clear existing relationships only on first chunk
        await tx.examQuestion.deleteMany({
          where: { examId: updatedExam.id },
        });
      } else {
        updatedExam = await tx.exam.findUnique({
          where: { id: examId }
        });
      }

      // Process sections in this chunk
      const processedSections = [];
      
      for (const sectionData of sectionsData) {
        const sectionMarks = sectionData.questions.reduce((sum, q) => sum + q.marks, 0);

        const section = await tx.examSection.upsert({
          where: { 
            id: sectionData.id || `chunk-${chunkIndex}-section-${Date.now()}` 
          },
          create: {
            name: sectionData.name,
            description: sectionData.description,
            timeLimit: sectionData.timeLimit,
            marks: sectionMarks,
            examId: examId,
          },
          update: {
            name: sectionData.name,
            description: sectionData.description,
            timeLimit: sectionData.timeLimit,
            marks: sectionMarks,
          },
        });

        // Clear existing questions for this section
        await tx.examSectionQuestion.deleteMany({
          where: { examSectionId: section.id },
        });

        // Add questions in smaller batches
        if (sectionData.questions.length > 0) {
          const BATCH_SIZE = 10; // Process 10 questions at a time
          
          for (let i = 0; i < sectionData.questions.length; i += BATCH_SIZE) {
            const batch = sectionData.questions.slice(i, i + BATCH_SIZE);
            
            const sectionQuestionData = batch.map((questionData) => ({
              examSectionId: section.id,
              questionId: questionData.questionId,
              order: questionData.order,
              marks: questionData.marks,
            }));

            const examQuestionData = batch.map((questionData) => ({
              examId: examId,
              questionId: questionData.questionId,
              order: i + questionData.order,
              marks: questionData.marks,
            }));

            await tx.examSectionQuestion.createMany({
              data: sectionQuestionData,
              skipDuplicates: true,
            });

            await tx.examQuestion.createMany({
              data: examQuestionData,
              skipDuplicates: true,
            });
          }
        }

        processedSections.push(section);
      }

      return { exam: updatedExam, sections: processedSections };
    }, {
      timeout: 15000, // Shorter timeout for chunks
      maxWait: 3000,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} processed successfully`,
      isComplete: isLastChunk,
    });

  } catch (error) {
    console.error(`Error processing chunk ${body?.chunkIndex || 0}:`, error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Chunk processing failed',
      chunkIndex: body?.chunkIndex || 0,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}