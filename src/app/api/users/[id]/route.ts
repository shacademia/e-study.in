// DELETE /api/users/[id] - Delete user account (Admin only)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for deletion confirmation
const deleteUserSchema = z.object({
  confirmDelete: z.boolean().refine(val => val === true, {
    message: 'Must confirm deletion by setting confirmDelete to true'
  }),
  reason: z.string().min(1, 'Deletion reason is required').optional()
});

// DELETE /api/users/[id] - Delete user account (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('x-auth-token');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const adminUserId = decoded.id;

    // Verify admin exists and has proper permissions
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { id: true, role: true, name: true, email: true }
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    if (adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Only ADMIN users can delete accounts.' },
        { status: 403 }
      );
    }

    const targetUserId = params.id;

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        createdAt: true,
        // Note: Can't include _count in this query due to transaction limitations
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Target user not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting their own account
    if (adminUserId === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account. Contact another administrator.' },
        { status: 400 }
      );
    }

    // Parse and validate request body (for confirmation)
    const body = await request.json();
    const parsedData = deleteUserSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsedData.error.issues
        },
        { status: 400 }
      );
    }

    const { confirmDelete, reason } = parsedData.data;

    // Double-check confirmation
    if (!confirmDelete) {
      return NextResponse.json(
        { success: false, error: 'Deletion not confirmed' },
        { status: 400 }
      );
    }

    // Get user statistics before deletion
    const userStats = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        _count: {
          select: {
            submissions: true,
            rankings: true,
            createdExams: true
          }
        }
      }
    });

    // Create deletion summary before deletion
    const deletionSummary = {
      deletedUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        createdAt: targetUser.createdAt
      },
      relatedDataCounts: userStats?._count || { submissions: 0, rankings: 0, createdExams: 0 },
      deletedBy: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email
      },
      deletedAt: new Date(),
      reason: reason || 'No reason provided'
    };

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete related data in proper order to handle foreign key constraints
      
      // 1. Delete question statuses (references submissions and questions)
      await tx.questionStatus.deleteMany({
        where: {
          submission: {
            userId: targetUserId
          }
        }
      });

      // 2. Delete rankings
      await tx.ranking.deleteMany({
        where: { userId: targetUserId }
      });

      // 3. Delete submissions
      await tx.submission.deleteMany({
        where: { userId: targetUserId }
      });

      // 4. Update questions they created (set author to admin or keep as is)
      // Note: We don't set to null as it's required field
      await tx.question.updateMany({
        where: { authorId: targetUserId },
        data: { authorId: adminUserId } // Assign to current admin
      });

      // 5. Update exams they created (set creator to admin or keep as is)
      // Note: We don't set to null as it's required field
      await tx.exam.updateMany({
        where: { createdById: targetUserId },
        data: { createdById: adminUserId } // Assign to current admin
      });

      // 6. Finally, delete the user
      await tx.user.delete({
        where: { id: targetUserId }
      });
    });

    // Log the deletion for audit purposes
    console.log(`User deleted: Admin ${adminUser.email} deleted user ${targetUser.email} (${targetUser.id}). Reason: ${reason || 'No reason provided'}`);

    return NextResponse.json({
      success: true,
      message: `User account successfully deleted`,
      data: {
        deletionSummary,
        warning: 'This action cannot be undone. All user data has been permanently removed.'
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error. User deletion failed.' },
      { status: 500 }
    );
  }
}
