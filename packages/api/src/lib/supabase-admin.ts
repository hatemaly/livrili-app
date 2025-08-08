import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the service role key
// This bypasses RLS and should only be used in server-side code
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('[SUPABASE-DEBUG] Creating admin client...')
  console.log('[SUPABASE-DEBUG] URL exists:', !!supabaseUrl)
  console.log('[SUPABASE-DEBUG] Service key exists:', !!supabaseServiceKey)
  console.log('[SUPABASE-DEBUG] URL value:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING')
  console.log('[SUPABASE-DEBUG] Service key value:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'MISSING')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[SUPABASE-DEBUG] Missing environment variables!')
    throw new Error('Missing Supabase environment variables')
  }

  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  
  console.log('[SUPABASE-DEBUG] Admin client created successfully')
  return client
}