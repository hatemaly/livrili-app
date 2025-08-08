'use client'

import React, { createContext, useContext } from 'react'
import { useAuth, type UseAuthReturn } from './hooks'

const AuthContext = createContext<UseAuthReturn | null>(null)

export interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Unified auth provider that supports both OAuth and JWT authentication
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use auth context
 */
export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string
    allowedRoles?: string[]
  }
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, user, loading } = useAuthContext()
    
    // Show loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    }
    
    // Check authentication
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = options?.redirectTo || '/login'
      }
      return null
    }
    
    // Check role-based access
    if (options?.allowedRoles && user && !options.allowedRoles.includes(user.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}