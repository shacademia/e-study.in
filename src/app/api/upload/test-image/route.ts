import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // For testing purposes, we'll just return file information
    // In a real scenario, you would upload to your storage service
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };

    // Convert file to base64 for preview (not recommended for production)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Simulate successful upload response
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully (test mode)',
      data: {
        fileInfo,
        imageUrl: dataUrl, // In production, this would be the actual storage URL
        uploadedAt: new Date().toISOString(),
        testMode: true,
        urlSize: `${(dataUrl.length / 1024).toFixed(2)} KB`
      }
    });

  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
