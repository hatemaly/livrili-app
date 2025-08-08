'use client'

import { UserProfile, UserAvatar } from '@livrili/ui'
import { useState } from 'react'

import { useAuth } from '@/lib/supabase-auth'

export default function ProfilePage() {
  const { user } = useAuth()
  // TODO: Add update profile mutation when needed
  // const updateProfileMutation = api.retailerAuth.updateProfile.useMutation()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleUpdateProfile = async (data: any) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // TODO: Implement profile update when API endpoint is ready
      // For now, just show a message
      console.log('Profile update data:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({ type: 'success', text: 'Profile update feature coming soon!' })
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
          user={{
            ...user,
            email: user.email || null,
            retailerId: user.retailerId || null,
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
            createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
          }} 
          onUpdate={handleUpdateProfile}
          editable={!isLoading}
        />

        {/* Retailer Information */}
        {user.retailerId && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            <p className="text-sm text-gray-600">
              Business details and credit information will be displayed here once your account is approved.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}