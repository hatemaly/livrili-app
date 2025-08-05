import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { createClient, type Session } from '@supabase/supabase-js'

export interface Context {
  session: Session | null
  supabase: ReturnType<typeof createClient>
  headers?: Headers
  user?: Session['user']
}

// Context for App Router (using fetch adapter)
export const createAppContext = async (opts: FetchCreateContextFnOptions): Promise<Context> => {
  const { req } = opts

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )

  // Get auth token from header
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  
  let session: Session | null = null
  if (token) {
    // First try our custom auth token validation
    try {
      const { data: tokenValidation, error: tokenError } = await supabase.rpc('validate_auth_token', {
        p_token: token
      })
      
      if (!tokenError && tokenValidation?.valid) {
        // Create session with our custom user data
        const userData = tokenValidation.user
        session = {
          access_token: token,
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: '',
          user: {
            id: userData.id,
            email: userData.username + '@livrili.local', // Fake email for compatibility
            user_metadata: {
              username: userData.username,
              full_name: userData.full_name,
              role: userData.role,
              retailer_id: userData.retailer_id,
              preferred_language: userData.preferred_language,
            },
          },
        } as Session
      }
    } catch (customAuthError) {
      // If custom auth fails, fall back to Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (!error && user) {
        session = {
          access_token: token,
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: '',
          user,
        } as Session
      }
    }
  }

  return {
    session,
    supabase,
    headers: req.headers,
    user: session?.user,
  }
}

// Context for Pages Router (using Next.js adapter)
export const createContext = async (opts: CreateNextContextOptions): Promise<Context> => {
  const { req } = opts

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )

  // Get auth token from header
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  let session: Session | null = null
  if (token) {
    // First try our custom auth token validation
    try {
      const { data: tokenValidation, error: tokenError } = await supabase.rpc('validate_auth_token', {
        p_token: token
      })
      
      if (!tokenError && tokenValidation?.valid) {
        // Create session with our custom user data
        const userData = tokenValidation.user
        session = {
          access_token: token,
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: '',
          user: {
            id: userData.id,
            email: userData.username + '@livrili.local', // Fake email for compatibility
            user_metadata: {
              username: userData.username,
              full_name: userData.full_name,
              role: userData.role,
              retailer_id: userData.retailer_id,
              preferred_language: userData.preferred_language,
            },
          },
        } as Session
      }
    } catch (customAuthError) {
      // If custom auth fails, fall back to Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (!error && user) {
        session = {
          access_token: token,
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: '',
          user,
        } as Session
      }
    }
  }

  return {
    session,
    supabase,
    user: session?.user,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>