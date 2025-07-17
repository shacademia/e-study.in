import { prisma } from "@/lib/db"
import { NextResponse } from "next/server";

export async function GET(){
    const users = await prisma.user.findMany({
        where: {
            role: 'ADMIN'
        },
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
}
