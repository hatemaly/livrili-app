import { useEffect, useState } from 'react'
import { supabase } from '@livrili/database'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { User, Retailer } from './types'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [retailer, setRetailer] = useState<Retailer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserDetails(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserDetails(session.user.id)
      } else {
        setUser(null)
        setRetailer(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserDetails = async (userId: string) => {
    try {
      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        // If user doesn't exist in public.users table yet (OAuth signup)
        if (userError.code === 'PGRST116') {
          // Get email from auth.users
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (authUser) {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              username: '',
              fullName: '',
              phone: '',
              role: 'retailer', // Default role
              retailerId: null,
              isActive: true,
              preferredLanguage: 'en',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            return
          }
        }
        throw userError
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        fullName: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        retailerId: userData.retailer_id,
        isActive: userData.is_active,
        preferredLanguage: userData.preferred_language,
        lastLoginAt: userData.last_login_at ? new Date(userData.last_login_at) : undefined,
        loginCount: userData.login_count,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      }

      setUser(user)

      // Fetch retailer details if user is a retailer
      if (user.retailerId) {
        const { data: retailerData, error: retailerError } = await supabase
          .from('retailers')
          .select('*')
          .eq('id', user.retailerId)
          .single()

        if (!retailerError && retailerData) {
          setRetailer({
            id: retailerData.id,
            businessName: retailerData.business_name,
            businessType: retailerData.business_type,
            registrationNumber: retailerData.registration_number,
            taxNumber: retailerData.tax_number,
            phone: retailerData.phone,
            email: retailerData.email,
            address: retailerData.address,
            city: retailerData.city,
            state: retailerData.state,
            postalCode: retailerData.postal_code,
            creditLimit: retailerData.credit_limit,
            currentBalance: retailerData.current_balance,
            status: retailerData.status,
            approvalDate: retailerData.approval_date ? new Date(retailerData.approval_date) : undefined,
            approvedBy: retailerData.approved_by,
            rejectionReason: retailerData.rejection_reason,
            documents: retailerData.documents,
            metadata: retailerData.metadata,
            createdAt: new Date(retailerData.created_at),
            updatedAt: new Date(retailerData.updated_at),
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (username: string, password: string) => {
    try {
      // First, find the user by username to get their email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('username', username)
        .single()

      if (userError || !userData || !userData.email) {
        throw new Error('Invalid username or password')
      }

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      })

      if (error) throw error

      // Update last login
      await supabase
        .from('users')
        .update({ 
          last_login_at: new Date().toISOString(),
          login_count: supabase.sql`COALESCE(login_count, 0) + 1`
        })
        .eq('id', data.user.id)

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    username: string,
    businessName: string,
    phone?: string
  ) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Create retailer
      const { data: retailerData, error: retailerError } = await supabase
        .from('retailers')
        .insert({
          business_name: businessName,
          email,
          phone,
          status: 'pending',
        })
        .select()
        .single()

      if (retailerError) throw retailerError

      // Create user profile
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          phone,
          role: 'retailer',
          retailer_id: retailerData.id,
          is_active: true,
          preferred_language: 'en',
        })

      if (userError) throw userError

      return { data: authData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Get the current origin
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) {
        console.error('OAuth error:', error)
        throw error
      }
      
      // The OAuth flow will redirect the browser, so we don't need to do anything else
      return { data, error: null }
    } catch (error) {
      console.error('Sign in with Google error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { data: null, error: new Error('No user logged in') }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: updates.fullName,
          phone: updates.phone,
          preferred_language: updates.preferredLanguage,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null)

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const completeOAuthProfile = async (
    username: string,
    businessName?: string,
    phone?: string
  ) => {
    if (!session?.user) return { data: null, error: new Error('No user logged in') }
    
    try {
      const { error } = await supabase.rpc('complete_oauth_profile', {
        user_id: session.user.id,
        username_input: username,
        business_name_input: businessName || null,
        phone_input: phone || null,
      })
      
      if (error) throw error
      
      // Refresh user data
      await fetchUserDetails(session.user.id)
      
      return { data: { success: true }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    session,
    user,
    retailer,
    loading,
    isAuthenticated: !!session,
    isAdmin: user?.role === 'admin',
    isRetailer: user?.role === 'retailer',
    needsProfileCompletion: !!user && !user.username,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    completeOAuthProfile,
  }
}