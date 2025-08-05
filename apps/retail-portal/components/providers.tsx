'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson'
import { api } from '@/lib/trpc'
import { AuthProvider } from '@livrili/auth'
import { supabase } from '@livrili/database'

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
  const [queryClient] = useState(() => new QueryClient())
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
            
            // Get the session token and add it to headers
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.access_token) {
              headers.set('authorization', `Bearer ${session.access_token}`)
            }
            
            if (cookies) {
              headers.set('cookie', cookies)
            }
            return Object.fromEntries(headers)
          },
          transformer: superjson,
        }),
      ],
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </api.Provider>
  )
}