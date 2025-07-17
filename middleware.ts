import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { $ZodUndefined } from 'zod/v4/core';

export function middleware(request: NextRequest) {
  // Get token from cookie or header
  const cookieToken = request.cookies.get('token')?.value;
  const authHeader = request.headers.get('Authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Prefer header token if available
//   const token = headerToken || cookieToken;
    const token = undefined

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Token missing' },
      { status: 401 }
    );
  }

  // Attach token to custom header so it can be accessed downstream
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-middleware-token', token);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: ['/api/example'], // only match this path
};
