import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
  }
}

// Type for Next.js API route handlers
type NextApiHandler = (req: Request, context?: { params: Record<string, string> }) => Promise<NextResponse>
type AuthenticatedApiHandler = (req: AuthenticatedRequest, context?: { params: Record<string, string> }) => Promise<NextResponse>

/**
 * Higher-order function that wraps API routes with authentication
 * Similar to how you wrap components with auth checks
 * 
 * Usage:
 * export const GET = withAuth(async (req: AuthenticatedRequest) => {
 *   // req.user is now available and guaranteed to exist
 *   const userId = req.user.id
 *   // Your API logic here
 * })
 */
export function withAuth(handler: AuthenticatedApiHandler): NextApiHandler {
  return async function(req: Request, context?: { params: Record<string, string> }): Promise<NextResponse> {
    try {
      // Get token from cookies or Authorization header
      const cookieHeader = req.headers.get('cookie')
      const tokenMatch = cookieHeader?.match(/token=([^;]+)/)
      let token = tokenMatch?.[1]

      // If no cookie token, check Authorization header
      if (!token) {
        const authHeader = req.headers.get('Authorization')
        token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined
      }

      // Check if token exists
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
      
      // Add user info to request object
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        id: decoded.id,
        email: decoded.email
      }

      // Call the original handler with authenticated request
      return await handler(authenticatedReq, context)
    } catch (error) {
      console.error('Authentication failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }
}

/**
 * Middleware-based auth - for use with Next.js middleware
 * This extracts user info from middleware headers
 */
export function withMiddlewareAuth(handler: AuthenticatedApiHandler): NextApiHandler {
  return async function(req: Request, context?: { params: Record<string, string> }): Promise<NextResponse> {
    try {
      // Get user info from middleware headers
      const userId = req.headers.get('x-user-id')
      const userEmail = req.headers.get('x-user-email')

      if (!userId || !userEmail) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Add user info to request object
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        id: userId,
        email: userEmail
      }

      // Call the original handler with authenticated request
      return await handler(authenticatedReq, context)
    } catch (error) {
      console.error('Authentication failed:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}
