'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState, useEffect, useMemo, useRef } from 'react'
import superjson from 'superjson'
import { api } from '@/lib/trpc'
import { AuthProvider, useAuthContext } from '@livrili/auth'
import { supabase } from '@livrili/database'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '' // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3001}` // dev SSR should use localhost
}

function TRPCClient({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthContext()
  const [queryClient] = useState(() => new QueryClient())
  const sessionRef = useRef(session)
  
  // Update ref when session changes
  useEffect(() => {
    sessionRef.current = session
  }, [session])
  
  const trpcClient = useMemo(() => {
    console.log('[ADMIN-PROVIDER-DEBUG] Creating tRPC client, auth loading:', loading, 'session exists:', !!session)
    
    return api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers: async () => {
            console.log('[ADMIN-PROVIDER-DEBUG] ====== HEADERS FUNCTION CALLED ======')
            console.log('[ADMIN-PROVIDER-DEBUG] Time:', new Date().toISOString())
            console.log('[ADMIN-PROVIDER-DEBUG] Window location:', typeof window !== 'undefined' ? window.location.pathname : 'SSR')
            
            const headers = new Map<string, string>()
            headers.set('x-trpc-source', 'nextjs-react')
            
            console.log('[ADMIN-PROVIDER-DEBUG] Getting session for headers...')
            console.log('[ADMIN-PROVIDER-DEBUG] Supabase client exists:', !!supabase)
            
            try {
              // Always get the most current session from Supabase
              const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
              
              console.log('[ADMIN-PROVIDER-DEBUG] getSession result:', {
                hasSession: !!currentSession,
                hasError: !!sessionError,
                hasToken: !!currentSession?.access_token,
                userId: currentSession?.user?.id,
                email: currentSession?.user?.email,
              })
              
              if (sessionError) {
                console.error('[ADMIN-PROVIDER-DEBUG] Error getting session:', sessionError)
              } else if (currentSession?.access_token) {
                console.log('[ADMIN-PROVIDER-DEBUG] ✅ Found Supabase OAuth session')
                console.log('[ADMIN-PROVIDER-DEBUG] User ID:', currentSession.user?.id)
                console.log('[ADMIN-PROVIDER-DEBUG] Email:', currentSession.user?.email)
                console.log('[ADMIN-PROVIDER-DEBUG] Token preview:', currentSession.access_token.substring(0, 30) + '...')
                
                // Send the Supabase OAuth token with a special header to distinguish it
                headers.set('authorization', `Bearer ${currentSession.access_token}`)
                headers.set('x-auth-type', 'supabase-oauth')
                headers.set('x-user-id', currentSession.user.id)
                
                console.log('[ADMIN-PROVIDER-DEBUG] ✅ Authorization header SET')
              } else {
                console.log('[ADMIN-PROVIDER-DEBUG] ❌ No session found - user not authenticated')
              }
            } catch (error) {
              console.error('[ADMIN-PROVIDER-DEBUG] ❌ Exception getting session:', error)
            }
            
            const headersObj = Object.fromEntries(headers)
            console.log('[ADMIN-PROVIDER-DEBUG] Final headers object:', headersObj)
            console.log('[ADMIN-PROVIDER-DEBUG] Final headers keys:', Object.keys(headersObj))
            console.log('[ADMIN-PROVIDER-DEBUG] Authorization header present:', 'authorization' in headersObj)
            console.log('[ADMIN-PROVIDER-DEBUG] Authorization value:', headersObj.authorization ? 'Bearer ...' : 'MISSING')
            console.log('[ADMIN-PROVIDER-DEBUG] ====== END HEADERS FUNCTION ======')
            return headersObj
          },
          transformer: superjson,
        }),
      ],
    })
  }, []) // Create client once and let the headers function get fresh session each time

  // Don't render tRPC provider until auth is fully loaded
  if (loading) {
    console.log('[ADMIN-PROVIDER-DEBUG] Auth still loading, showing loading state...')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </api.Provider>
  )
}

export function TRPCProvider({
  children,
  cookies,
}: {
  children: React.ReactNode
  cookies?: string
}) {
  console.log('[ADMIN-PROVIDER-DEBUG] TRPCProvider rendering with cookies:', !!cookies)
  
  return (
    <AuthProvider>
      <TRPCClient>{children}</TRPCClient>
    </AuthProvider>
  )
}