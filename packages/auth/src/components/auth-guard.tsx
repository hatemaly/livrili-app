'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '../client/context'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requireRetailer?: boolean
  redirectTo?: string
  allowedRoles?: string[]
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireRetailer = false,
  redirectTo = '/login',
  allowedRoles,
}: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isRetailer, user, loading } = useAuthContext()

  useEffect(() => {
    if (!loading) {
      console.log('AuthGuard check:', { 
        requireAuth, 
        requireAdmin, 
        isAuthenticated, 
        isAdmin, 
        userRole: user?.role,
        user: user?.email 
      })
      
      // Check authentication
      if (requireAuth && !isAuthenticated) {
        console.log('AuthGuard: Authentication required but user not authenticated')
        router.push(redirectTo)
        return
      }

      // Check admin requirement
      if (requireAdmin && !isAdmin) {
        console.log('AuthGuard: Admin access required but user is not admin:', { userRole: user?.role, isAdmin })
        router.push('/unauthorized')
        return
      }

      // Check retailer requirement
      if (requireRetailer && !isRetailer) {
        console.log('AuthGuard: Retailer access required but user is not retailer')
        router.push('/unauthorized')
        return
      }

      // Check allowed roles
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.log('AuthGuard: User role not in allowed roles:', { userRole: user.role, allowedRoles })
        router.push('/unauthorized')
        return
      }
      
      console.log('AuthGuard: Access granted')
    }
  }, [
    isAuthenticated,
    isAdmin,
    isRetailer,
    loading,
    user,
    requireAuth,
    requireAdmin,
    requireRetailer,
    allowedRoles,
    redirectTo,
    router,
  ])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-blue-600 font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return null // Will redirect
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    console.log('AuthGuard render: Showing access denied - admin required')
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">Admin access required</p>
            <p className="mt-2 text-xs text-gray-500">User role: {user?.role || 'none'} | Required: admin</p>
          </div>
        </div>
      </div>
    )
  }

  // Check retailer requirement
  if (requireRetailer && !isRetailer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">Retailer access required</p>
          </div>
        </div>
      </div>
    )
  }

  // Check allowed roles
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}