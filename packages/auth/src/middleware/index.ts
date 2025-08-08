import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export interface AuthMiddlewareOptions {
  publicPaths?: string[]
  authPath?: string
  protectedPaths?: string[]
  roleAccess?: Record<string, string[]>
}

/**
 * Create authentication middleware for Next.js using Supabase
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    publicPaths = ['/login', '/signup', '/auth', '/api'],
    authPath = '/login',
    protectedPaths = [],
    roleAccess = {},
  } = options

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    // Get token from cookie or header
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // No token, redirect to auth
      const url = request.nextUrl.clone()
      url.pathname = authPath
      url.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(url)
    }

    try {
      // Create Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        throw new Error('Invalid Supabase token')
      }

      // Get user data from our users table using id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, role, retailer_id, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        throw new Error('User not found or inactive')
      }

      // Check role-based access
      for (const [path, roles] of Object.entries(roleAccess)) {
        if (pathname.startsWith(path) && !roles.includes(userData.role)) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          )
        }
      }

      // Add user info to headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', userData.id)
      requestHeaders.set('x-user-role', userData.role)
      if (userData.retailer_id) {
        requestHeaders.set('x-retailer-id', userData.retailer_id)
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      // Invalid token, redirect to auth
      const url = request.nextUrl.clone()
      url.pathname = authPath
      url.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(url)
    }
  }
}

/**
 * Helper to check if a path requires authentication
 */
export function isProtectedPath(
  pathname: string,
  protectedPaths: string[]
): boolean {
  return protectedPaths.some(path => pathname.startsWith(path))
}

/**
 * Helper to extract user from request headers (set by middleware)
 */
export function getUserFromHeaders(headers: Headers) {
  const userId = headers.get('x-user-id')
  const role = headers.get('x-user-role')
  const retailerId = headers.get('x-retailer-id')

  if (!userId || !role) {
    return null
  }

  return {
    userId,
    role,
    retailerId,
  }
}