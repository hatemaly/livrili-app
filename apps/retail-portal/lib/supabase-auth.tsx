'use client'

import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface User {
  id: string
  username: string
  full_name?: string
  role: string
  retailer_id?: string
  email?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
  supabase: typeof supabase
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] Auth state changed:', { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        hasToken: !!session?.access_token
      })
      
      if (event === 'SIGNED_IN' && session) {
        console.log('[AUTH] User signed in, loading data...')
        await loadUserData(session.user.id)
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        console.log('[AUTH] User signed out, clearing state...')
        setUser(null)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_type')
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('[AUTH] Token refreshed, updating stored token...')
        localStorage.setItem('auth_token', session.access_token)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      console.log('[AUTH] Checking user session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('[AUTH] Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasToken: !!session?.access_token,
        error: error?.message
      })
      
      if (error) {
        console.error('[AUTH] Session error:', error.message)
        // Clear invalid session data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_type')
        setUser(null)
      } else if (session?.user) {
        await loadUserData(session.user.id)
      } else {
        // Clear any stale tokens
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_type')
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking user session:', error)
      // Clear tokens on any error
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_type')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      console.log('[AUTH] Loading user data for userId:', userId)
      
      // Get user details from user_profiles table (the correct table for Supabase Auth integration)
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[AUTH] Error fetching user profile:', error)
        setLoading(false)
        return
      }

      if (userData) {
        console.log('[AUTH] User profile loaded successfully:', {
          id: userData.id,
          username: userData.username,
          role: userData.role,
          hasRetailerId: !!userData.retailer_id
        })

        // Validate that user has retailer role
        if (userData.role !== 'retailer') {
          console.error('[AUTH] Access denied: User is not a retailer')
          throw new Error('Access denied. This portal is for retailers only.')
        }
        
        // Also get the user's email from Supabase Auth
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        const user: User = {
          id: userData.id,
          username: userData.username || '',
          full_name: userData.full_name,
          role: userData.role,
          retailer_id: userData.retailer_id,
          email: authUser?.email
        }
        setUser(user)
        
        // Store auth token for API calls - get fresh session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (!sessionError && session?.access_token) {
          console.log('[AUTH] Storing fresh auth token in localStorage')
          localStorage.setItem('auth_token', session.access_token)
          localStorage.setItem('auth_type', 'supabase-oauth')
        } else {
          console.error('[AUTH] Failed to get fresh session:', sessionError)
          // Clear invalid tokens
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_type')
          throw new Error('Failed to create valid session')
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('[AUTH] Error loading user data:', error)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('[AUTH] SignIn called with email:', email)
    setLoading(true)
    
    try {
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        console.error('[AUTH] Sign in error:', error)
        throw new Error('Invalid email or password')
      }

      if (data.session) {
        await loadUserData(data.user.id)
        // Check for redirect parameter
        const urlParams = new URLSearchParams(window.location.search)
        const redirect = urlParams.get('redirect')
        router.push(redirect && redirect !== '/' ? redirect : '/home')
      }
    } catch (error) {
      console.error('[AUTH] SignIn error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_type')
      router.push('/login')
    } catch (error) {
      console.error('[AUTH] Sign out error:', error)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        signIn, 
        signOut,
        supabase 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Export signOut for backward compatibility
export function signOut() {
  supabase.auth.signOut().then(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_type')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  })
}