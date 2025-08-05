'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { useAuthContext } from '@livrili/auth'
import { UserProfile, UserAvatar } from '@livrili/ui'
import { createClient } from '@supabase/supabase-js'

export default function ProfilePage() {
  usePageTitle('Profile - Livrili Admin Portal')
  const { user, refreshUser } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleUpdateProfile = async (data: any) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          preferred_language: data.preferredLanguage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)

      if (error) throw error

      await refreshUser()
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.fullName || user.username || 'User'}
              </h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 capitalize">
                {user.role} • Account ID: {user.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <UserProfile 
          user={user} 
          onUpdate={handleUpdateProfile}
          editable={!isLoading}
        />
      </div>
    </div>
  )
}