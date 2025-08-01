// PUT /api/exams/[id]/save-with-sections - Save exam with sections and questions
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Production-specific configurations
const isProduction = process.env.NODE_ENV === 'production';
const MAX_SECTIONS_PER_REQUEST = isProduction ? 10 : 50; // Limit sections in production
const MAX_QUESTIONS_PER_SECTION = isProduction ? 50 : 200; // Limit questions per section in production

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
  const startTime = Date.now();
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Log request details for debugging
    const contentLength = request.headers.get('content-length');
    console.log(`🔍 Save exam request - Content-Length: ${contentLength} bytes, Exam ID: ${params.id}`);
    
    // Check if we're in production environment
    const environment = process.env.NODE_ENV;
    const platform = process.env.VERCEL ? 'Vercel' : 
                    process.env.NETLIFY ? 'Netlify' : 
                    process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 
                    'Unknown';
    
    console.log(`🌍 Environment: ${environment}, Platform: ${platform}`);
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
    
    // Log payload size for debugging
    const payloadSize = JSON.stringify(body).length;
    const sectionsCount = body.sections?.length || 0;
    const totalQuestions = body.sections?.reduce((sum: number, section: unknown) => 
      sum + (section.questions?.length || 0), 0) || 0;
    
    console.log(`📊 Payload analysis:`, {
      payloadSizeKB: Math.round(payloadSize / 1024),
      sectionsCount,
      totalQuestions,
      avgQuestionsPerSection: sectionsCount > 0 ? Math.round(totalQuestions / sectionsCount) : 0
    });
    
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

    // Production-specific validations
    if (isProduction) {
      if (sectionsData.length > MAX_SECTIONS_PER_REQUEST) {
        return NextResponse.json(
          { 
            error: `Too many sections. Maximum ${MAX_SECTIONS_PER_REQUEST} sections allowed per request in production.`,
            details: `You are trying to save ${sectionsData.length} sections. Please reduce the number of sections.`
          },
          { status: 400 }
        );
      }

      for (const section of sectionsData) {
        if (section.questions.length > MAX_QUESTIONS_PER_SECTION) {
          return NextResponse.json(
            { 
              error: `Too many questions in section "${section.name}". Maximum ${MAX_QUESTIONS_PER_SECTION} questions allowed per section in production.`,
              details: `Section "${section.name}" has ${section.questions.length} questions. Please reduce the number of questions.`
            },
            { status: 400 }
          );
        }
      }

      const totalQuestions = sectionsData.reduce((sum, section) => sum + section.questions.length, 0);
      if (totalQuestions > 100) { // Total limit for production
        return NextResponse.json(
          { 
            error: `Too many total questions. Maximum 100 questions allowed per exam in production.`,
            details: `You are trying to save ${totalQuestions} questions total. Please reduce the number of questions.`
          },
          { status: 400 }
        );
      }
    }

    // Calculate total marks from all sections
    const totalMarks = sectionsData.reduce((sum, section) => 
      sum + section.questions.reduce((sectionSum, q) => sectionSum + q.marks, 0), 0
    );

    // Save exam with sections in a transaction with timeout and batch processing
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

      // 5. Process each section with batch operations
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

        // 7. Batch create question relationships to reduce database calls
        if (sectionData.questions.length > 0) {
          // Prepare batch data for section questions
          const sectionQuestionData = sectionData.questions.map((questionData) => ({
            examSectionId: section.id,
            questionId: questionData.questionId,
            order: questionData.order,
            marks: questionData.marks,
          }));

          // Prepare batch data for exam questions
          const examQuestionData = sectionData.questions.map((questionData) => ({
            examId: updatedExam.id,
            questionId: questionData.questionId,
            order: globalQuestionOrder++,
            marks: questionData.marks,
          }));

          // Batch create section-question relationships
          await tx.examSectionQuestion.createMany({
            data: sectionQuestionData,
            skipDuplicates: true,
          });

          // Batch create exam-question relationships
          await tx.examQuestion.createMany({
            data: examQuestionData,
            skipDuplicates: true,
          });
        }

        processedSections.push(section);
      }

      return { exam: updatedExam, sections: processedSections };
    }, {
      timeout: 30000, // 30 second timeout for production
      maxWait: 5000,  // Maximum time to wait for a connection
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

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Exam saved successfully in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      data: completeExam,
      message: 'Exam saved with sections successfully',
      meta: {
        processingTimeMs: duration,
        environment,
        platform
      }
    });

  } catch (error) {
    console.error('Error saving exam with sections:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Handle specific database errors
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message: string };
      
      // Connection timeout or pool exhausted
      if (dbError.code === 'P2024' || dbError.code === 'P1001') {
        return NextResponse.json({ 
          error: 'Database connection timeout. Please try again with fewer questions or sections.',
          details: 'The operation took too long to complete. This often happens with large amounts of data in production.'
        }, { status: 408 });
      }
      
      // Transaction timeout
      if (dbError.code === 'P2034') {
        return NextResponse.json({ 
          error: 'Transaction timeout. Please try saving fewer questions at once.',
          details: 'The database transaction took too long. Try reducing the number of questions per section.'
        }, { status: 408 });
      }
    }

    // Log detailed error for debugging
    console.error('Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      examId,
      sectionsCount: parsedData.success ? parsedData.data.sections.length : 'unknown',
      totalQuestions: parsedData.success ? 
        parsedData.data.sections.reduce((sum, s) => sum + s.questions.length, 0) : 'unknown'
    });

    return NextResponse.json({ 
      error: 'Internal server error',
      details: isProduction ? 
        'Please try again with fewer questions or contact support if the issue persists.' :
        error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
