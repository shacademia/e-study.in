import { NextRequest, NextResponse } from 'next/server';
import { imagekit } from '@/config/imagekit';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export async function POST(req: NextRequest) {
  try {
    // Check authentication (make it optional for testing)
    const token = req.headers.get('x-auth-token');
    let userId: string | null = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        userId = decoded.id;
      } catch (jwtError) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    // For development/testing, allow uploads without authentication
    if (!userId) {
      // You can remove this in production
      console.warn('Upload proceeding without authentication - development mode');
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'questions';
    const tags = formData.get('tags') as string || 'question';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: `/${folder}`,
      tags: tags.split(',').map(tag => tag.trim()),
      useUniqueFileName: true,
      responseFields: ['fileId', 'name', 'size', 'filePath', 'url', 'fileType', 'tags']
    });

    // Save upload record to database (only if user is authenticated)
    let uploadRecord = null;
    if (userId) {
      uploadRecord = await prisma.upload.create({
        data: {
          fileName: uploadResponse.name,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          imagekitFileId: uploadResponse.fileId,
          imagekitUrl: uploadResponse.url,
          imagekitFilePath: uploadResponse.filePath,
          uploadedById: userId,
          tags: tags.split(',').map(tag => tag.trim()),
          folder: folder,
          isPublic: true,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: uploadRecord?.id || 'temp-id',
        imageUrl: uploadResponse.url,
        fileId: uploadResponse.fileId,
        fileName: uploadResponse.name,
        filePath: uploadResponse.filePath,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: uploadRecord?.createdAt.toISOString() || new Date().toISOString(),
        authenticated: !!userId,
      }
    });

  } catch (error) {
    console.error('ImageKit upload error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Upload failed', 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
