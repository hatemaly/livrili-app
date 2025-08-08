import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/auth/complete-profile',
    '/signup/success'
  ]
  
  // Static files and API routes
  const isStaticFile = pathname.startsWith('/_next/') || 
    pathname.startsWith('/api/') || 
    pathname.includes('.') ||
    pathname.startsWith('/public/')
  
  // Skip middleware for static files
  if (isStaticFile) {
    return NextResponse.next()
  }
  
  // Handle root path redirect to login
  if (pathname === '/') {
    console.log('[MIDDLEWARE] Root path accessed, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Allow access to public auth routes without authentication check
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('[MIDDLEWARE] Public route accessed:', pathname)
    return NextResponse.next()
  }
  
  // For all other routes, check authentication
  console.log('[MIDDLEWARE] Protected route accessed, checking auth:', pathname)
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value })
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )
  
  // Get the current session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  console.log('[MIDDLEWARE] Auth check result:', {
    pathname,
    hasUser: !!user,
    userId: user?.id,
    error: error?.message
  })
  
  // If no user found, redirect to login
  if (!user) {
    console.log('[MIDDLEWARE] No authenticated user, redirecting to login')
    const redirectUrl = new URL('/login', request.url)
    // Add the attempted URL as a search parameter to redirect after login
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check if user has retailer role using user_profiles
  try {
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('role, is_active, retailer_id')
      .eq('id', user.id)
      .single()

    console.log('[MIDDLEWARE] User profile role check:', {
      pathname,
      userId: user.id,
      userData,
      error: userError?.message
    })

    if (userError || !userData) {
      console.log('[MIDDLEWARE] User profile not found, redirecting to login')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'account_not_found')
      return NextResponse.redirect(redirectUrl)
    }

    if (!userData.is_active) {
      console.log('[MIDDLEWARE] User profile is inactive')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'account_inactive')
      return NextResponse.redirect(redirectUrl)
    }

    if (userData.role !== 'retailer') {
      console.log('[MIDDLEWARE] User is not a retailer, access denied')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'retailer_access_required')
      return NextResponse.redirect(redirectUrl)
    }

    console.log('[MIDDLEWARE] Retailer access granted:', {
      userId: user.id,
      role: userData.role,
      retailerId: userData.retailer_id
    })

  } catch (dbError) {
    console.error('[MIDDLEWARE] Database error during role check:', dbError)
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('error', 'system_error')
    return NextResponse.redirect(redirectUrl)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - files with extensions (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|manifest.json|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}