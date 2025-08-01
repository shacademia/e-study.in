// PUT /api/users/[id]/role - Update user role (Admin only)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Schema for role update request
const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'USER', 'MODERATOR', 'GUEST'])
});

// PUT /api/users/[id]/role - Update user role (Admin only)
export async function PUT(
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

    if (adminUser.role !== 'ADMIN' && adminUser.role !== 'MODERATOR') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Only ADMIN and MODERATOR users can update roles.' },
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
        createdAt: true 
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Target user not found' },
        { status: 404 }
      );
    }

    // Prevent admin from changing their own role (security measure)
    if (adminUserId === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own role. Contact another administrator.' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsedData = updateRoleSchema.safeParse(body);

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

    const { role } = parsedData.data;

    // Check if role is actually changing
    if (targetUser.role === role) {
      return NextResponse.json(
        {
          success: false,
          error: `User already has the role '${role}'`
        },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { 
        role,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Log the role change for audit purposes
    console.log(`Role updated: Admin ${adminUser.email} changed ${targetUser.email}'s role from ${targetUser.role} to ${role}`);

    return NextResponse.json({
      success: true,
      message: `User role successfully updated from '${targetUser.role}' to '${role}'`,
      data: {
        user: updatedUser,
        changes: {
          previousRole: targetUser.role,
          newRole: role,
          updatedBy: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email
          },
          updatedAt: updatedUser.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
