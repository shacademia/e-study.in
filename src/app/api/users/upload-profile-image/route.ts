import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { imagekit } from "@/config/imagekit";

export async function POST(request: NextRequest) {
  try {
    // Get the token from the x-auth-token header
    const token = request.headers.get("x-auth-token");
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.id;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;

    try {
      // Upload to ImageKit
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: fileName,
        folder: '/profiles',
        tags: ['profile', 'user'],
        useUniqueFileName: true,
        responseFields: ['fileId', 'name', 'size', 'filePath', 'url', 'fileType'],
      });

      // Save upload record to database
      const uploadRecord = await prisma.upload.create({
        data: {
          fileName: uploadResponse.name,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          imagekitFileId: uploadResponse.fileId,
          imagekitUrl: uploadResponse.url,
          imagekitFilePath: uploadResponse.filePath,
          uploadedById: userId,
          tags: ['profile', 'user'],
          folder: 'profiles',
          isPublic: true,
        },
      });

      // Update user's profile image
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profileImage: uploadResponse.url,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          bio: true,
          profileImage: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          lastLogin: true,
          isEmailVerified: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Profile image uploaded successfully",
        data: {
          user: updatedUser,
          upload: {
            id: uploadRecord.id,
            url: uploadResponse.url,
            fileName: uploadResponse.name,
            fileSize: file.size,
          },
        },
      });

    } catch (uploadError) {
      console.error("ImageKit upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload image to ImageKit" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}