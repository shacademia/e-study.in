// POST /api/upload/question-image - Upload image for question content

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // TODO: Implement question image upload
    // Handle FormData with image file
    // Upload to storage service
    // Return image URL for use in question content
    return NextResponse.json({ message: 'Question image upload endpoint - TODO' });
  } catch (error) {
    console.error('Error uploading question image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
