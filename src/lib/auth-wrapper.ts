import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
  }
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async function(req: Request): Promise<NextResponse> {
    try {
      // Get token from cookies
      const cookieHeader = req.headers.get('cookie')
      const tokenMatch = cookieHeader?.match(/token=([^;]+)/)
      const token = tokenMatch?.[1]

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
      
      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        id: decoded.id,
        email: decoded.email
      }

      return await handler(authenticatedReq)
    } catch (error) {
      console.error('Authentication failed:', error)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }
}
