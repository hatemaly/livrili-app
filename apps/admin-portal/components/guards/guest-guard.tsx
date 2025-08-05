'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@livrili/auth'

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuthContext()

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Only redirect if user has completed their profile
      if (user.username) {
        router.push('/')
      }
    }
  }, [isAuthenticated, loading, user, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If authenticated with complete profile, don't show auth pages
  if (isAuthenticated && user?.username) {
    return null
  }

  // Show auth pages
  return <>{children}</>
}