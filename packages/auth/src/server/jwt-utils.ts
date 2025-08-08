import { createClient } from '@supabase/supabase-js'
import type { AuthTokenPayload, AuthUser } from './types'

/**
 * Create a Supabase client for server-side operations
 */
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Verify and decode a Supabase JWT token
 */
export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const supabase = createSupabaseClient()
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Get user data from our users table using id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, role, retailer_id, is_active')
      .eq('id', user.id)
      .eq('is_active', true)
      .single()
    
    if (userError || !userData) {
      return null
    }

    // Return in the expected format
    return {
      userId: userData.id,
      username: userData.username,
      role: userData.role,
      retailerId: userData.retailer_id,
    }
  } catch (error) {
    return null
  }
}

/**
 * Create a Supabase auth session for a user
 * Note: This is used primarily for testing or admin operations
 * Normal authentication should use Supabase's auth methods directly
 */
export async function createAuthToken(user: AuthUser): Promise<string | null> {
  try {
    const supabase = createSupabaseClient()
    
    // For Supabase, we don't create tokens directly
    // Instead, we should use Supabase's signInWithPassword or other auth methods
    
    return null
  } catch (error) {
    console.error('Error creating auth token:', error)
    return null
  }
}

/**
 * Decode a JWT token without verification (for debugging)
 * For Supabase tokens, we need to verify them to get user data
 */
export async function decodeAuthToken(token: string): Promise<AuthTokenPayload | null> {
  // For Supabase tokens, decoding without verification is not recommended
  // We'll use the verify function instead
  return verifyAuthToken(token)
}

/**
 * Generate a secure random token (utility function)
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Get token expiration date (Supabase handles this automatically)
 */
export function getTokenExpiration(): Date {
  // Supabase handles token expiration automatically
  // Default is 1 hour for access tokens
  return new Date(Date.now() + 60 * 60 * 1000)
}