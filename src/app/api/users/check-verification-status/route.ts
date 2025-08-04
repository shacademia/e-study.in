import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
// import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const verificationStatusSchema = z.object({
  email: z.email(),
});


export async function GET(req: Request){

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const parsedData = verificationStatusSchema.safeParse({ email });
    if (!parsedData.success) {
        return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { email: parsedData.data.email },
        select: { isEmailVerified: true }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ isEmailVerified: user.isEmailVerified });
}