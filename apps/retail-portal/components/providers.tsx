'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson'

import { api } from '@/lib/trpc'
import { ToastProvider } from '@/components/common/toast-system'
// Remove unused imports since we're using custom auth
// import { AuthProvider } from '@livrili/auth'
// import { supabase } from '@livrili/database'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '' // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3002}` // dev SSR should use localhost
}

export function TRPCProvider({
  children,
  cookies,
}: {
  children: React.ReactNode
  cookies?: string
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors, but provide helpful logging
          if (error?.data?.code === 'UNAUTHORIZED') {
            console.warn('[TRPC-AUTH] Authentication failed - user may need to log out and log back in')
            console.warn('[TRPC-AUTH] Error details:', error?.message)
            // Clear potentially invalid tokens
            if (typeof window !== 'undefined') {
              const currentToken = localStorage.getItem('auth_token')
              if (currentToken && currentToken !== 'mock-token') {
                console.warn('[TRPC-AUTH] Clearing potentially invalid auth token')
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_type')
              }
            }
            return false
          }
          return failureCount < 3
        },
      },
    },
  }))
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers: async () => {
            const headers = new Map<string, string>()
            headers.set('x-trpc-source', 'nextjs-react')
            
            // Get the auth token and add it to headers
            // Only access localStorage if we're in the browser
            if (typeof window !== 'undefined') {
              const authToken = localStorage.getItem('auth_token')
              const authType = localStorage.getItem('auth_type')
              
              console.log('[TRPC-DEBUG] Getting headers:', {
                hasToken: !!authToken,
                tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : null,
                authType
              })
              
              if (authToken) {
                // Validate token format before using it
                if (authToken === 'mock-token' || authToken.includes('.')) {
                  headers.set('authorization', `Bearer ${authToken}`)
                  if (authType) {
                    headers.set('x-auth-type', authType)
                  }
                } else {
                  console.warn('[TRPC-WARN] Invalid token format detected, clearing and fetching fresh session')
                  localStorage.removeItem('auth_token')
                  localStorage.removeItem('auth_type')
                  // Fall through to fetch fresh session
                }
              }
              
              // Try to get fresh session from Supabase if no valid token
              if (!authToken || !headers.has('authorization')) {
                try {
                  const { createClient } = await import('@supabase/supabase-js')
                  const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                  )
                  
                  const { data: { session }, error } = await supabase.auth.getSession()
                  if (!error && session?.access_token) {
                    console.log('[TRPC-DEBUG] Found fresh session from Supabase, using that token')
                    headers.set('authorization', `Bearer ${session.access_token}`)
                    // Store it for future use
                    localStorage.setItem('auth_token', session.access_token)
                    localStorage.setItem('auth_type', 'supabase-oauth')
                  } else if (error) {
                    console.error('[TRPC-ERROR] Session error:', error.message)
                    // Clear any invalid stored tokens
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('auth_type')
                  }
                } catch (sessionError) {
                  console.error('[TRPC-ERROR] Failed to get Supabase session:', sessionError)
                }
              }
            }
            
            if (cookies) {
              headers.set('cookie', cookies)
            }
            
            const headerEntries = Object.fromEntries(headers)
            console.log('[TRPC-DEBUG] Final headers:', {
              hasAuth: !!headerEntries.authorization,
              hasCookie: !!headerEntries.cookie,
              authPreview: headerEntries.authorization ? `Bearer ${headerEntries.authorization.substring(7, 27)}...` : null
            })
            
            return headerEntries
          },
          transformer: superjson,
        }),
      ],
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </api.Provider>
  )
}