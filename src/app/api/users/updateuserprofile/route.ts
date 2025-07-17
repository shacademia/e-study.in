import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

export async function PUT(req: Request) {
    // Get token from middleware header
    const token = req.headers.get('x-auth-token');


    try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
        const userId = decoded.id;
        
        const body = await req.json();
        const { name, email } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }
}