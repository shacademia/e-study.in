// app/api/subjects/route.ts
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
  const token = request.headers.get("x-auth-token");

  if (!token) {
    return Response.json({
      success: false,
      message: 'Authentication required',
      errorCode: 'AUTH_REQUIRED'
    }, { status: 401 });
  }

  try {
    // Get unique subjects from questions table
    const subjects = await prisma.question.findMany({
      select: {
        subject: true
      },
      distinct: ['subject'],
      orderBy: {
        subject: 'asc'
      }
    });

    // Filter out empty subjects and format the data
    const formattedSubjects = subjects
      .filter(s => s.subject && s.subject.trim() !== '')
      .map(s => ({
        value: s.subject,
        label: s.subject
      }));

    return Response.json({
      success: true,
      data: formattedSubjects,
      count: formattedSubjects.length,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Subjects fetch error:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch subjects',
      errorCode: 'SUBJECTS_FETCH_ERROR'
    }, { status: 500 });
  }
}
