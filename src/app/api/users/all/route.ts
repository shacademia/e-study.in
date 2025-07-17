import { prisma } from "@/lib/db"
import { NextResponse } from "next/server";
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
        const userEmail = decoded.email;
        
        console.log('Authenticated user:', { userId, userEmail });
    
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        }) 
        
        return NextResponse.json(users, {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        })
    } catch (error) {
        console.error('JWT verification failed:', error)
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}