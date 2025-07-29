import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔥 Middleware called for:', pathname)

  // Define routes that DON'T require authentication (public API routes)
  const publicApiRoutes = [
    '/api/users/login',
    '/api/users/signup',
    '/api/users/logout',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/example',
    '/api/test-db',
    '/api/upload/imagekit/test'
  ]

  // Define public pages (no auth required)
  const publicPages = [
    '/',
    '/login',
    '/signup',
    '/about',
    '/contact'
  ]

  // Check if this is a forgot password page (dynamic route)
  const isForgotPasswordPage = pathname.startsWith('/forgot-password/')

  // Define static assets and Next.js internal routes that should be ignored
  const staticRoutes = [
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ]

  // Check if this is a static route (should be ignored)
  const isStaticRoute = staticRoutes.some(route => pathname.startsWith(route))
  if (isStaticRoute) {
    return NextResponse.next()
  }

  // Check if this is a public API route
  const isPublicApiRoute = publicApiRoutes.some(route => pathname === route)
  if (isPublicApiRoute) {
    console.log('🌐 Public API route, no auth required:', pathname)
    return NextResponse.next()
  }

  // Check if this is a public page
  const isPublicPage = publicPages.some(page => pathname === page)
  if (isPublicPage) {
    console.log('🌐 Public page, no auth required:', pathname)
    return NextResponse.next()
  }

  // Check if this is a forgot password page
  if (isForgotPasswordPage) {
    console.log('🌐 Forgot password page, no auth required:', pathname)
    return NextResponse.next()
  }

  // Get token from cookies or Authorization header
  const cookieToken = request.cookies.get('token')?.value
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  const token = bearerToken || cookieToken

  // Handle API routes protection
  if (pathname.startsWith('/api/')) {
    console.log('🔒 Protected API route, checking auth:', pathname)
    
    if (!token) {
      console.log('❌ No token found for API route')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('✅ Token found for API route, proceeding')
    
    // Forward the token in headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-auth-token', token)
    
    if (bearerToken && !requestHeaders.has('authorization')) {
      requestHeaders.set('authorization', `Bearer ${token}`)
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Handle ALL OTHER PAGES protection (this is the key change)
  console.log('🔒 Protected page, checking auth:', pathname)
  
  if (!token) {
    console.log('❌ No token found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  console.log('✅ Token found for protected page, proceeding')
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}