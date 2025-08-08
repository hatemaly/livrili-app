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

  // Create Supabase client with proper session handling
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )

  // Get auth token from headers or cookies
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  // Also check for session in cookies as fallback
  const cookieHeader = req.headers.get('cookie')
  let sessionFromCookie = null
  if (cookieHeader && !token) {
    console.log('[AUTH-DEBUG] No auth header, checking cookies')
    // Parse cookies to find Supabase session
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [key, ...valueParts] = cookie.split('=')
        return [key, valueParts.join('=')]
      })
    )
    
    // Look for Supabase session cookies
    const accessTokenCookie = cookies['sb-yklrjzlidixjlbhppltf-auth-token']
    if (accessTokenCookie) {
      try {
        sessionFromCookie = JSON.parse(decodeURIComponent(accessTokenCookie))
        console.log('[AUTH-DEBUG] Found session in cookie')
      } catch (e) {
        console.log('[AUTH-DEBUG] Failed to parse session from cookie:', e)
      }
    }
  }
  
  console.log('[AUTH-DEBUG] Context creation:', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    hasCookies: !!cookieHeader,
    hasSessionFromCookie: !!sessionFromCookie,
    url: req.url
  })
  
  let session: Session | null = null
  let retailerId: string | undefined
  
  if (token || sessionFromCookie) {
    const authToken = token || sessionFromCookie?.access_token
    
    // Handle mock authentication for development
    if (authToken === 'mock-token' && process.env.NODE_ENV === 'development') {
      console.log('[AUTH-DEBUG] Using mock authentication token')
      session = {
        access_token: authToken,
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
    } else if (authToken) {
      try {
        // Verify Supabase token and get user
        console.log('[AUTH-DEBUG] Verifying token:', authToken ? `${authToken.substring(0, 20)}...` : 'null')
        const { data: { user }, error } = await supabase.auth.getUser(authToken)
        
        if (!error && user) {
          console.log('[AUTH-DEBUG] User verified successfully:', { 
            id: user.id, 
            email: user.email, 
            hasMetadata: !!user.user_metadata,
            role: user.user_metadata?.role 
          })
          
          // Use user metadata directly from Supabase auth
          const userRole = user.user_metadata?.role || user.role
          const userRetailerId = user.user_metadata?.retailer_id
          
          // For retailers, get the retailer_id from the user_profiles table
          if (userRole === 'retailer') {
            try {
              // Look up the user's retailer_id and ensure they are active
              const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('retailer_id, is_active')
                .eq('id', user.id)
                .single()
              
              if (userError) {
                console.error('[AUTH-ERROR] Failed to fetch user profile data:', userError)
              } else if (!userData?.is_active) {
                console.log('[AUTH-DEBUG] User profile is inactive')
              } else if (userData?.retailer_id) {
                // Verify the retailer exists and is active
                const { data: retailerData, error: retailerError } = await supabase
                  .from('retailers')
                  .select('id, status')
                  .eq('id', userData.retailer_id)
                  .single()
                
                if (!retailerError && retailerData && retailerData.status === 'active') {
                  retailerId = retailerData.id
                  console.log('[AUTH-DEBUG] Found active retailer:', retailerId)
                } else if (retailerData && retailerData.status !== 'active') {
                  console.log('[AUTH-DEBUG] Retailer account is not active:', retailerData.status)
                } else {
                  console.error('[AUTH-ERROR] Retailer not found:', retailerError)
                }
              } else {
                console.log('[AUTH-DEBUG] No retailer_id found in user_profiles table for user:', user.id)
              }
            } catch (dbError) {
              console.error('[AUTH-ERROR] Database lookup failed:', dbError)
            }
          }
          
          // Create session with user data
          session = {
            access_token: authToken,
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
          
          console.log('[AUTH-DEBUG] Session created successfully')
        } else {
          console.log('[AUTH-DEBUG] User verification failed:', { 
            hasError: !!error, 
            errorMessage: error?.message,
            hasUser: !!user 
          })
          
          // Provide specific error context for debugging
          if (error?.message?.includes('JWT')) {
            console.error('[AUTH-ERROR] Invalid JWT token - user needs to re-authenticate')
          } else if (error?.message?.includes('expired')) {
            console.error('[AUTH-ERROR] Expired token - user needs to refresh session')
          }
        }
      } catch (authError) {
        console.error('[AUTH-ERROR] Token verification failed:', authError)
        // Session remains null
      }
    }
  } else {
    console.log('[AUTH-DEBUG] No authentication token found in request')
  }

  console.log('[AUTH-DEBUG] Final context result:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    userRole: session?.user?.user_metadata?.role,
    retailerId,
    requestUrl: req.url
  })

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
          
          // For retailers, get the retailer_id from the user_profiles table
          if (userRole === 'retailer') {
            // Look up the user's retailer_id from the user_profiles table
            const { data: userData } = await supabase
              .from('user_profiles')
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