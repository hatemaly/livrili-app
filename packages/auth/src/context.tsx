'use client'

import React, { createContext, useContext } from 'react'
import { useAuth } from './hooks'
import type { User, Retailer } from './types'
import type { Session } from '@supabase/supabase-js'

interface AuthContextValue {
  session: Session | null
  user: User | null
  retailer: Retailer | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isRetailer: boolean
  needsProfileCompletion?: boolean
  signIn: (username: string, password: string) => Promise<{ data: any; error: any }>
  signUp: (
    email: string,
    password: string,
    username: string,
    businessName: string,
    phone?: string
  ) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  updateProfile: (updates: Partial<User>) => Promise<{ data: any; error: any }>
  completeOAuthProfile?: (
    username: string,
    businessName?: string,
    phone?: string
  ) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}