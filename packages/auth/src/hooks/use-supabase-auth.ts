'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@livrili/database'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { User, Retailer } from '../types'

export interface UseSupabaseAuthReturn {
  user: User | null
  retailer: Retailer | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isRetailer: boolean
  needsPasswordChange: boolean
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: Error | null }>
  changePassword: (newPassword: string) => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>
  // Security features
  logSecurityEvent: (event: SecurityEvent) => Promise<void>
}

interface SecurityEvent {
  event_type: 'login_success' | 'login_failure' | 'password_change'
  details?: any
}

/**
 * Unified Supabase Auth hook for both admin and retail portals
 */
export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [state, setState] = useState({
    user: null as User | null,
    retailer: null as Retailer | null,
    session: null as Session | null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    isRetailer: false,
    needsPasswordChange: false,
  })

  useEffect(() => {
    initializeAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await handleAuthSession(session)
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuthState()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await handleAuthSession(session)
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleAuthSession = async (session: Session) => {
    try {
      // Get user details from our users table using id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData) {
        // User exists in Supabase Auth but not in our users table
        // This might be a new OAuth user - create a record
        if (session.user.email) {
          // Determine role based on portal context
          // For admin portal, default to admin role
          const isAdminPortal = window.location.port === '3001' || window.location.pathname.includes('admin')
          const defaultRole = isAdminPortal ? 'admin' : 'retailer'
          
          const newUser = {
            id: session.user.id,  // Use id field directly
            username: session.user.email.split('@')[0],
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || '',
            role: defaultRole,
            preferred_language: 'en',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          console.log('Creating OAuth user:', { email: newUser.email, role: newUser.role, isAdminPortal })

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single()

          if (!createError && createdUser) {
            console.log('OAuth user created successfully:', { id: createdUser.id, role: createdUser.role, isAdmin: createdUser.role === 'admin' })
            setState({
              user: createdUser,
              retailer: null,
              session,
              loading: false,
              isAuthenticated: true,
              isAdmin: createdUser.role === 'admin',
              isRetailer: createdUser.role === 'retailer',
              needsPasswordChange: false,
            })
          } else {
            console.error('Failed to create user record:', createError)
            await supabase.auth.signOut()
            clearAuthState()
          }
        } else {
          console.error('No email in session')
          await supabase.auth.signOut()
          clearAuthState()
        }
        return
      }

      // Check if user is active
      if (!userData.is_active) {
        await supabase.auth.signOut()
        clearAuthState()
        return
      }

      // Get retailer data if applicable
      let retailerData = null
      if (userData.retailer_id) {
        const { data: retailer } = await supabase
          .from('retailers')
          .select('*')
          .eq('id', userData.retailer_id)
          .single()
        retailerData = retailer
      }

      // Log successful authentication
      await logAuthEvent(session.user.id, true)

      console.log('Existing user authenticated:', { id: userData.id, role: userData.role, isAdmin: userData.role === 'admin' })
      setState({
        user: userData,
        retailer: retailerData,
        session,
        loading: false,
        isAuthenticated: true,
        isAdmin: userData.role === 'admin',
        isRetailer: userData.role === 'retailer',
        needsPasswordChange: userData.must_change_password || false,
      })

    } catch (error) {
      console.error('Auth session handling error:', error)
      clearAuthState()
    }
  }

  const clearAuthState = () => {
    setState({
      user: null,
      retailer: null,
      session: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      isRetailer: false,
      needsPasswordChange: false,
    })
  }

  // Email/password sign in
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // For failed attempts, we typically won't have user data
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }, [])

  // Username/password sign in (for retail portal)
  const signInWithUsername = useCallback(async (username: string, password: string) => {
    try {
      // First, get user's email and id from username
      const { data: userLookup, error: lookupError } = await supabase
        .rpc('get_user_for_login', { p_username: username })

      if (lookupError || !userLookup?.success) {
        return { 
          error: new Error(userLookup?.error || 'Invalid username or password') 
        }
      }

      const userData = userLookup.user

      // Check if user needs migration
      if (userLookup.needs_migration) {
        return { 
          error: new Error('Your account needs to be migrated. Please contact support.') 
        }
      }

      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      })

      if (error) {
        // Log failed attempt for auditing
        await logAuthEvent(userData.id, false)
        return { error }
      }

      // Log successful attempt
      await logAuthEvent(userData.id, true)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }, [])

  // Google OAuth sign in
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }, [])

  // Sign up
  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    clearAuthState()
  }, [])

  // Change password
  const changePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (!error && state.user) {
        // Update must_change_password flag
        await supabase
          .from('users')
          .update({
            must_change_password: false,
            password_changed_at: new Date().toISOString()
          })
          .eq('id', state.session?.user.id)

        // Log password change
        await logSecurityEvent({
          event_type: 'password_change',
          details: { changed_at: new Date().toISOString() }
        })

        // Update local state
        setState(prev => ({ ...prev, needsPasswordChange: false }))
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }, [state.user, state.session])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      if (!state.user) {
        return { error: new Error('No user logged in') }
      }

      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id)

      if (!error) {
        // Update local state
        setState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...updates } : null
        }))
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }, [state.user])

  // Security helper functions

  const logAuthEvent = async (userId: string, success: boolean) => {
    try {
      await supabase.rpc('handle_auth_attempt', {
        p_user_id: userId,
        p_success: success,
        p_ip_address: 'client_side', // Would need server-side for real IP
        p_user_agent: navigator.userAgent,
        p_auth_method: 'password'
      })
    } catch (error) {
      console.error('Error logging auth event:', error)
    }
  }

  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      if (!state.session?.user.id) return

      await supabase
        .from('login_attempts')
        .insert({
          user_id: state.session.user.id,
          username: state.user?.username,
          ip_address: 'client_side',
          auth_method: event.details?.auth_method || 'unknown',
          success: event.event_type === 'login_success',
          failure_reason: event.event_type === 'login_failure' ? event.details?.error : null,
          session_id: event.details?.session_id,
        })
    } catch (error) {
      console.error('Error logging security event:', error)
    }
  }

  return {
    ...state,
    signIn,
    signInWithGoogle,
    signInWithUsername,
    signOut,
    signUp,
    changePassword,
    resetPassword,
    updateProfile,
    logSecurityEvent,
  }
}