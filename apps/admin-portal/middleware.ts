import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // For now, we don't need any middleware redirects
  // The authentication flow is handled by client-side guards
  return NextResponse.next()
}

export const config = {
  // Match all paths except static assets and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}