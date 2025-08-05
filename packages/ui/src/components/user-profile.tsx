'use client'

import { useState } from 'react'
import { Button } from './button'

interface UserProfileProps {
  user: {
    id: string
    username?: string | null
    fullName?: string | null
    email?: string | null
    phone?: string | null
    role: string
    retailerId?: string | null
    preferredLanguage?: string
    lastLoginAt?: string | null
    loginCount?: number
    createdAt?: string
  }
  onUpdate?: (data: any) => Promise<void>
  editable?: boolean
}

export function UserProfile({ user, onUpdate, editable = true }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    preferredLanguage: user.preferredLanguage || 'en',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onUpdate) {
      await onUpdate(formData)
      setIsEditing(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          {editable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Username</label>
              <p className="mt-1 text-sm text-gray-900">{user.username || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{user.fullName || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Language</label>
              <p className="mt-1 text-sm text-gray-900">
                {user.preferredLanguage === 'en' ? 'English' : 
                 user.preferredLanguage === 'ar' ? 'Arabic' : 
                 user.preferredLanguage === 'fr' ? 'French' : 
                 user.preferredLanguage}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Account Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Last Login:</span>
                <span className="ml-2 text-gray-900">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Login Count:</span>
                <span className="ml-2 text-gray-900">{user.loginCount || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Member Since:</span>
                <span className="ml-2 text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700">
            Preferred Language
          </label>
          <select
            id="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit">Save Changes</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditing(false)
              setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                preferredLanguage: user.preferredLanguage || 'en',
              })
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}