import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔥 Middleware called for:', pathname)

  // Define protected routes directly here
  const protectedRoutes = [
    // User Management Routes
    '/api/users/all',
    '/api/users/admins',
    '/api/users/updateuserprofile',
    '/api/users/me',
    { path: '/api/users/', dynamic: true },
    
    // Question Management Routes
    '/api/questions',
    '/api/questions/create',
    '/api/questions/subjects',
    '/api/questions/topics',
    { path: '/api/questions/', dynamic: true },
    
    // Exam Management Routes
    '/api/exams',
    { path: '/api/exams/', dynamic: true },
    
    // Submission Routes
    '/api/submissions',
    { path: '/api/submissions/', dynamic: true },
    
    // Ranking Routes
    '/api/rankings',
    '/api/rankings/global',
    { path: '/api/rankings/', dynamic: true },
    
    // Admin Routes (Require Admin Role)
    { path: '/api/admin/', dynamic: true },
    
    // Search Routes
    { path: '/api/search/', dynamic: true },
    
    // Upload Routes
    { path: '/api/upload/', dynamic: true },
    
    // Student Routes
    { path: '/api/student/', dynamic: true }
  ]

  // Check if this is a protected route
  const isProtected = protectedRoutes.some(route => {
    if (typeof route === 'string') {
      return pathname === route
    } else if (route.dynamic) {
      // For dynamic routes, check if it starts with the path and has additional segments
      return pathname.startsWith(route.path) && 
             pathname !== route.path && // Not just the base path
             !pathname.includes('/login') && 
             !pathname.includes('/logout') && 
             !pathname.includes('/signup') &&
             !pathname.includes('/register')
    }
    return false
  })
  
  // Also check for exact matches with protected base routes
  const exactProtectedRoutes = [
    '/api/questions',
    '/api/exams', 
    '/api/submissions',
    '/api/rankings'
  ]
  
  const isExactProtected = exactProtectedRoutes.includes(pathname)
  
  if (!isProtected && !isExactProtected) {
    console.log('❌ Route not protected, skipping auth:', pathname)
    return NextResponse.next()
  }

  console.log('✅ Route is protected, checking auth:', pathname)

  // Get token from cookies
  const token = request.cookies.get('token')?.value

  if (!token) {
    console.log('❌ No token found')
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  console.log('✅ Token found, proceeding')
  
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-auth-token', token)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    // User Management
    '/api/users/all',
    '/api/users/admins', 
    '/api/users/updateuserprofile',
    '/api/users/me',
    '/api/users/:path*',
    
    // Questions API
    '/api/questions',
    '/api/questions/:path*',
    
    // Exams API
    '/api/exams',
    '/api/exams/:path*',
    
    // Submissions API
    '/api/submissions',
    '/api/submissions/:path*',
    
    // Rankings API
    '/api/rankings',
    '/api/rankings/:path*',
    
    // Admin API
    '/api/admin/:path*',
    
    // Search API
    '/api/search/:path*',
    
    // Upload API
    '/api/upload/:path*',
    
    // Student API
    '/api/student/:path*',
    
    // Legacy routes
    '/api/QuestionBank/:path*'
  ]
}