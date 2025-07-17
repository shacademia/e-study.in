import { NextResponse } from "next/server";

export async function GET(){
    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
    });
    return response;
}