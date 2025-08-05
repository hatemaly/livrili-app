'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label } from '@livrili/ui'
import { useAuthContext } from '@livrili/auth'
import { AuthGuard } from '@livrili/auth'

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user, completeOAuthProfile } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    businessName: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!completeOAuthProfile) {
      setError('Profile completion not available')
      setLoading(false)
      return
    }

    const { error } = await completeOAuthProfile(
      formData.username,
      formData.businessName,
      formData.phone
    )

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If business name was provided, show success page
    if (formData.businessName) {
      router.push('/signup/success')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <AuthGuard requireAuth>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Complete Your Profile
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome, {user?.fullName || user?.email}! Please complete your profile to continue.
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Choose a unique username"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be used for signing in
                </p>
              </div>

              <div>
                <Label htmlFor="businessName">Business Name (Optional)</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Your business name"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty if you're joining an existing business
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+213 XX XXX XX XX"
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !formData.username}
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}