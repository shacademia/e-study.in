import { prisma } from "@/lib/db"
import { NextResponse } from "next/server";


export async function GET(){
    const user = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        }
    }) 
    return NextResponse.json(user, {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}