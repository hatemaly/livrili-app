'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson'
import type { AppRouter } from './root'

export const api = createTRPCReact<AppRouter>()
export const trpc = api // For backward compatibility

export function TRPCProvider({
  children,
  apiUrl,
}: {
  children: React.ReactNode
  apiUrl: string
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: apiUrl,
          headers() {
            const token = typeof window !== 'undefined' 
              ? localStorage.getItem('supabase.auth.token')
              : null
            
            return token ? { authorization: `Bearer ${token}` } : {}
          },
        }),
      ],
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  )
}