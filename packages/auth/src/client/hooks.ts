'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@livrili/database'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { User, Retailer } from '../types'
import { 
  getAuthToken, 
  storeAuthToken, 
  removeAuthToken,
  getUserData,
  storeUserData,
  clearAuthData
} from './storage'

export interface AuthState {
  user: User | null
  retailer: Retailer | null
  session: Session | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isRetailer: boolean
  authMode: 'oauth' | 'jwt' | null
}

export interface UseAuthReturn extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  loginWithOAuth: (provider: 'google') => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

/**
 * Unified authentication hook that supports both OAuth and JWT
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    retailer: null,
    session: null,
    token: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    isRetailer: false,
    authMode: null,
  })

  // Initialize authentication state
  useEffect(() => {
    initializeAuth()
  }, [])

  // Initialize auth by checking both OAuth session and JWT token
  const initializeAuth = async () => {
    try {
      // Check for OAuth session first
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // OAuth authentication
        await handleOAuthSession(session)
      } else {
        // Check for JWT token
        const token = getAuthToken()
        if (token) {
          await handleJWTAuth(token)
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setState(prev => ({ ...prev, loading: false }))
    }

    // Listen for OAuth auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await handleOAuthSession(session)
        } else if (state.authMode === 'oauth') {
          // Only clear if we were using OAuth
          clearAuthState()
        }
      }
    )

    return () => subscription.unsubscribe()
  }

  // Handle OAuth session
  const handleOAuthSession = async (session: Session) => {
    try {
      const userId = session.user.id

      // Fetch user details from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        // Check if this is a new user that needs creation
        
        // For OAuth users, we typically want to create them automatically
        const newUser = {
          id: userId,
          email: session.user.email,
          username: session.user.email?.split('@')[0] || 'user',
          full_name: session.user.user_metadata?.full_name || '',
          role: 'admin', // Default role for OAuth users
          preferred_language: 'en',
          is_active: true,
        }

        console.log('Creating OAuth user with role:', newUser.role)

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single()

        if (!createError && createdUser) {
          updateAuthState(createdUser, null, session, null, 'oauth')
        }
      } else {
        // Fetch retailer if user is a retailer
        let retailerData = null
        if (userData.retailer_id) {
          const { data: retailer } = await supabase
            .from('retailers')
            .select('*')
            .eq('id', userData.retailer_id)
            .single()
          retailerData = retailer
        }

        updateAuthState(userData, retailerData, session, null, 'oauth')
      }
    } catch (error) {
      console.error('OAuth session handling error:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  // Handle JWT authentication
  const handleJWTAuth = async (token: string) => {
    try {
      // Validate token with backend
      // This would call your tRPC endpoint or API
      const user = getUserData()
      
      if (user) {
        // Fetch retailer if needed
        let retailerData = null
        if (user.retailer_id) {
          const { data: retailer } = await supabase
            .from('retailers')
            .select('*')
            .eq('id', user.retailer_id)
            .single()
          retailerData = retailer
        }

        console.log('JWT auth successful:', { email: user.email, role: user.role })
        updateAuthState(user, retailerData, null, token, 'jwt')
      } else {
        clearAuthState()
      }
    } catch (error) {
      console.error('JWT auth handling error:', error)
      clearAuthState()
    }
  }

  // Update authentication state
  const updateAuthState = (
    user: User | null,
    retailer: Retailer | null,
    session: Session | null,
    token: string | null,
    authMode: 'oauth' | 'jwt' | null
  ) => {
    console.log('Updating auth state:', { user, userRole: user?.role, isAdmin: user?.role === 'admin' })
    setState({
      user,
      retailer,
      session,
      token,
      loading: false,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isRetailer: user?.role === 'retailer',
      authMode,
    })
  }

  // Clear authentication state
  const clearAuthState = () => {
    clearAuthData()
    setState({
      user: null,
      retailer: null,
      session: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      isRetailer: false,
      authMode: null,
    })
  }

  // JWT login
  const login = useCallback(async (username: string, password: string) => {
    try {
      // This would call your tRPC endpoint
      // For now, returning a placeholder
      // In real implementation, this would call:
      // const result = await api.retailerAuth.login.mutate({ username, password })
      
      return { success: false, message: 'JWT login not yet implemented' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed' }
    }
  }, [])

  // OAuth login
  const loginWithOAuth = useCallback(async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('OAuth login error:', error)
      throw error
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      if (state.authMode === 'oauth') {
        await supabase.auth.signOut()
      } else if (state.authMode === 'jwt' && state.token) {
        // Call logout endpoint to invalidate token
        // await api.retailerAuth.logout.mutate({ token: state.token })
        clearAuthState()
      }
    } catch (error) {
      console.error('Logout error:', error)
      clearAuthState()
    }
  }, [state.authMode, state.token])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (state.authMode === 'oauth' && state.session) {
      await handleOAuthSession(state.session)
    } else if (state.authMode === 'jwt' && state.token) {
      await handleJWTAuth(state.token)
    }
  }, [state.authMode, state.session, state.token])

  return {
    ...state,
    login,
    loginWithOAuth,
    logout,
    refreshUser,
  }
}

/**
 * Alternative export name for Supabase auth hook
 */
export { useAuth as useSupabaseAuth }

/**
 * JWT-specific auth hook for retail portal compatibility
 */
export function useJWTAuth() {
  const auth = useAuth()
  
  // Filter to only JWT-related functionality
  return {
    user: auth.user,
    token: auth.token,
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated && auth.authMode === 'jwt',
    isRetailer: auth.isRetailer,
    login: auth.login,
    logout: auth.logout,
  }
}