import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔥 Middleware called for:', pathname)

  // Define routes that DON'T require authentication (public routes)
  const publicRoutes = [
    '/api/users/login',
    '/api/users/signup',
    '/api/users/logout',
    '/api/example',
    '/api/test-db',
    '/api/upload/imagekit/test'
  ]

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route)
  
  if (isPublicRoute) {
    console.log('🌐 Public route, no auth required:', pathname)
    return NextResponse.next()
  }

  // All other /api routes require authentication
  if (pathname.startsWith('/api/')) {
    console.log('🔒 Protected API route, checking auth:', pathname)
  } else {
    // Not an API route, let it pass
    return NextResponse.next()
  }

  // Get token from cookies or Authorization header
  const cookieToken = request.cookies.get('token')?.value
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  
  const token = bearerToken || cookieToken

  if (!token) {
    console.log('❌ No token found')
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  console.log('✅ Token found, proceeding')
  
  // Forward the token in both x-auth-token header (for legacy routes) and keep Authorization header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-auth-token', token)
  
  // Ensure Authorization header is preserved for Bearer token routes
  if (bearerToken && !requestHeaders.has('authorization')) {
    requestHeaders.set('authorization', `Bearer ${token}`)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    // Match ALL API routes except public ones
    '/api/((?!users/login|users/signup|users/logout|example|test-db).*)',
  ]
}
