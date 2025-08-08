'use client'

import { Button } from '@livrili/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useAuth } from '@/lib/supabase-auth'

export default function SignUpPage() {
  const router = useRouter()
  const { supabase } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate required fields
    if (!formData.email || !formData.password || !formData.username || !formData.businessName) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // 1. Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'retailer',
            username: formData.username,
            full_name: formData.businessName,
          }
        }
      })
      
      if (authError) {
        setError(authError.message)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        return
      }

      // 2. Update or create the user profile record (triggered automatically by auth.users trigger)
      // We'll wait a moment for the trigger to complete then update with additional info
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { error: userError } = await supabase
        .from('user_profiles')
        .update({
          username: formData.username,
          full_name: formData.businessName,
          role: 'retailer',
          is_active: true,
        })
        .eq('id', authData.user.id)

      if (userError) {
        console.error('Error updating user profile:', userError)
        // Note: Auth user is already created, so we'll let them proceed
        // The trigger should have created a basic profile
      }

      // 3. Create the retailer record
      const { data: retailerData, error: retailerError } = await supabase
        .from('retailers')
        .insert({
          owner_id: authData.user.id, // Link to auth.users.id
          business_name: formData.businessName,
          email: formData.email,
          status: 'pending', // Retailers start as pending approval
        })
        .select('id')
        .single()

      if (retailerError) {
        console.error('Error creating retailer record:', retailerError)
        setError('Account created but retailer profile setup failed. Please contact support.')
        return
      }

      // 4. Update the user profile with the retailer_id
      if (retailerData?.id) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            retailer_id: retailerData.id,
          })
          .eq('id', authData.user.id)

        if (updateError) {
          console.error('Error linking retailer to user profile:', updateError)
        }
      }

      // Redirect to success page
      router.push('/signup/success')
      
    } catch (err: any) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Register your business
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <div className="mt-1">
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/login">
              <Button variant="outline" className="w-full" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}