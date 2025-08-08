import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { createClient, type Session } from '@supabase/supabase-js'
import { createAdminSupabaseClient } from './lib/supabase-admin'
export interface Context {
  session: Session | null
  supabase: ReturnType<typeof createClient>
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>
  headers?: Headers
  user?: Session['user']
  retailerId?: string
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

  // Get auth token from headers
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  let session: Session | null = null
  let retailerId: string | undefined
  
  if (token) {
    // Handle mock authentication for development
    if (token === 'mock-token' && process.env.NODE_ENV === 'development') {
      console.log('[AUTH-DEBUG] Using mock authentication token')
      session = {
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: '',
        user: {
          id: 'mock-user-id',
          email: 'mock@example.com',
          user_metadata: {
            full_name: 'Mock User',
            role: 'retailer',
            retailer_id: 'mock-retailer-id',
            preferred_language: 'en',
            username: 'mockuser',
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      } as Session
      retailerId = 'mock-retailer-id'
    } else {
      try {
        // Verify Supabase token and get user
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (!error && user) {
          // Use user metadata directly from Supabase auth
          // The retailer_id should be in user_metadata when retailer logs in
          const userRole = user.user_metadata?.role || user.role
          const userRetailerId = user.user_metadata?.retailer_id
          
          // For retailers, get the retailer_id from the users table
          if (userRole === 'retailer') {
            // Look up the user's retailer_id from the users table
            const { data: userData } = await supabase
              .from('users')
              .select('retailer_id')
              .eq('id', user.id)
              .single()
            
            if (userData?.retailer_id) {
              // Verify the retailer exists and is active
              const { data: retailerData } = await supabase
                .from('retailers')
                .select('id, status')
                .eq('id', userData.retailer_id)
                .single()
              
              if (retailerData && retailerData.status === 'active') {
                retailerId = retailerData.id
              }
            }
          }
          
          // Create session with user data
          session = {
            access_token: token,
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: '',
            user: {
              id: user.id,
              email: user.email || '',
              user_metadata: {
                ...user.user_metadata,
                role: userRole,
                retailer_id: retailerId,
              },
              app_metadata: user.app_metadata || {},
              aud: 'authenticated',
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at,
            },
          } as Session
        }
      } catch (authError) {
        console.error('[AUTH-ERROR] Token verification failed:', authError)
        // Session remains null
      }
    }
  }

  return {
    session,
    supabase,
    adminSupabase: createAdminSupabaseClient(),
    headers: req.headers,
    user: session?.user,
    retailerId,
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
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')
  
  let session: Session | null = null
  let retailerId: string | undefined
  
  if (token) {
    // Handle mock authentication for development
    if (token === 'mock-token' && process.env.NODE_ENV === 'development') {
      console.log('[AUTH-DEBUG] Using mock authentication token (Pages Router)')
      session = {
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: '',
        user: {
          id: 'mock-user-id',
          email: 'mock@example.com',
          user_metadata: {
            full_name: 'Mock User',
            role: 'retailer',
            retailer_id: 'mock-retailer-id',
            preferred_language: 'en',
            username: 'mockuser',
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      } as Session
      retailerId = 'mock-retailer-id'
    } else {
      try {
        // Verify Supabase token and get user
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (!error && user) {
          // Use user metadata directly from Supabase auth
          // The retailer_id should be in user_metadata when retailer logs in
          const userRole = user.user_metadata?.role || user.role
          const userRetailerId = user.user_metadata?.retailer_id
          
          // For retailers, get the retailer_id from the users table
          if (userRole === 'retailer') {
            // Look up the user's retailer_id from the users table
            const { data: userData } = await supabase
              .from('users')
              .select('retailer_id')
              .eq('id', user.id)
              .single()
            
            if (userData?.retailer_id) {
              // Verify the retailer exists and is active
              const { data: retailerData } = await supabase
                .from('retailers')
                .select('id, status')
                .eq('id', userData.retailer_id)
                .single()
              
              if (retailerData && retailerData.status === 'active') {
                retailerId = retailerData.id
              }
            }
          }
          
          // Create session with user data
          session = {
            access_token: token,
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: '',
            user: {
              id: user.id,
              email: user.email || '',
              user_metadata: {
                ...user.user_metadata,
                role: userRole,
                retailer_id: retailerId,
              },
              app_metadata: user.app_metadata || {},
              aud: 'authenticated',
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at,
            },
          } as Session
        }
      } catch (authError) {
        console.error('[AUTH-ERROR] Token verification failed (Pages Router):', authError)
        // Session remains null
      }
    }
  }

  return {
    session,
    supabase,
    adminSupabase: createAdminSupabaseClient(),
    user: session?.user,
    retailerId,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>