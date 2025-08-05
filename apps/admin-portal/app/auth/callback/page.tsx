'use client'

import { useEffect } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { useRouter } from 'next/navigation'
import { supabase } from '@livrili/database'

export default function AuthCallbackPage() {
  usePageTitle('Authenticating - Livrili Admin Portal')
  const router = useRouter()

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = new URL(window.location.href).searchParams.get('error')

        console.log('Auth callback:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error,
          fullUrl: window.location.href
        })

        if (error) {
          console.error('Auth error:', error)
          router.push(`/login?error=${error}`)
          return
        }

        if (!accessToken) {
          console.error('No access token in callback')
          router.push('/login?error=no_token')
          return
        }

        // Set the session using the tokens
        const { data: { user }, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (sessionError) {
          console.error('Error setting session:', sessionError)
          router.push('/login?error=session_error')
          return
        }

        if (!user) {
          console.error('No user after setting session')
          router.push('/login?error=no_user')
          return
        }

        console.log('User authenticated:', user.id, user.email)

        // Check if user exists in the database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user data:', userError)
        }

        if (!userData) {
          // New OAuth user, needs to complete profile
          console.log('New OAuth user, redirecting to profile completion')
          router.push('/complete-profile')
        } else if (userData.role !== 'admin') {
          // Not an admin
          console.log('User is not admin')
          await supabase.auth.signOut()
          router.push('/login?error=not_admin')
        } else {
          // Admin user, redirect to dashboard
          console.log('Admin user authenticated')
          router.push('/')
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        router.push('/login?error=unexpected')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we complete your sign in.</p>
      </div>
    </div>
  )
}