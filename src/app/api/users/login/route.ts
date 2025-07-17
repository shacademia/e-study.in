import { prisma } from "@/lib/db"; 
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define the schema for the request body
const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
})

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const parsedData = loginSchema.safeParse(body);
        
        // Validation failure
        if (!parsedData.success) {
            return NextResponse.json(
                { error: z.treeifyError(parsedData.error) },
                { status: 400 }
            );
        }
        const { email, password } = parsedData.data;
        
        // Find user 
        const user = await prisma.user.findUnique({
            where: { email },
        })
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '7d', // Token expiration time
        });

        const response =  NextResponse.json(
            { user: { id: user.id, email: user.email }}
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // secure cookies in production
            path: '/',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days

        });

        return response;
    } catch (error) {
        console.error("Error processing login request:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

