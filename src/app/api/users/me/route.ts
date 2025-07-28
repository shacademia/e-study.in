import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

export async function GET(req: Request) {
    // Get token from middleware header
    const token = req.headers.get('x-auth-token');
    console.log('Token received:', token);
    // This shouldn't happen if middleware is working, but just in case
    if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
        const userId = decoded.id;
        
        // Fetch user data from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                profileImage: true,
                bio: true,
                isEmailVerified: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('JWT verification failed:', error)
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}