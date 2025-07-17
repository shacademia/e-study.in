import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-middleware-token');
  console.log('Middleware token:', request.headers);


  return NextResponse.json({
    success: true,
    message: 'Middleware is working 🔥',
    token: token || 'Token not found in header',
  });
}
