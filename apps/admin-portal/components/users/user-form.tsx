'use client'

import { useState, useEffect } from 'react'
import { Button } from '@livrili/ui'
import type { User, CreateUserData, UpdateUserData, UserRole } from '@/types/user'

interface UserFormProps {
  user?: User
  onSubmit: (data: CreateUserData | UpdateUserData) => void
  onCancel: () => void
  isLoading?: boolean
  retailers: Array<{ id: string; business_name: string; status: string }>
}

export function UserForm({ user, onSubmit, onCancel, isLoading, retailers }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    password: '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    role: user?.role || 'retailer' as UserRole,
    retailer_id: user?.retailer_id || '',
    is_active: user?.is_active ?? true,
    preferred_language: user?.preferred_language || 'en',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!user && !formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!user && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required'
    } else if (!user && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if ((formData.role === 'retailer' || formData.role === 'driver') && !formData.retailer_id) {
      newErrors.retailer_id = 'Retailer is required for this role'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    if (user) {
      // Update mode - exclude username and password
      const updateData: UpdateUserData = {
        full_name: formData.full_name || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        retailer_id: formData.retailer_id || undefined,
        is_active: formData.is_active,
        preferred_language: formData.preferred_language,
      }
      onSubmit(updateData)
    } else {
      // Create mode
      const createData: CreateUserData = {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        retailer_id: formData.retailer_id || undefined,
        is_active: formData.is_active,
        preferred_language: formData.preferred_language,
      }
      onSubmit(createData)
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      retailer_id: role === 'admin' ? '' : prev.retailer_id,
    }))
  }

  // Filter active retailers for dropdown
  const activeRetailers = retailers.filter(r => r.status === 'active')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username (only for new users) */}
        {!user && (
          <div className="md:col-span-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`w-full rounded-md border shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>
        )}

        {/* Password (only for new users) */}
        {!user && (
          <div className="md:col-span-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full rounded-md border shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter password (min 8 characters)"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
            placeholder="Enter full name"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
            placeholder="Enter phone number"
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
          >
            <option value="admin">Admin</option>
            <option value="retailer">Retailer</option>
            <option value="driver">Driver</option>
          </select>
        </div>

        {/* Retailer Association */}
        <div>
          <label htmlFor="retailer_id" className="block text-sm font-medium text-gray-700 mb-1">
            Retailer Association {(formData.role === 'retailer' || formData.role === 'driver') && <span className="text-red-500">*</span>}
          </label>
          <select
            id="retailer_id"
            value={formData.retailer_id}
            onChange={(e) => setFormData({ ...formData, retailer_id: e.target.value })}
            disabled={formData.role === 'admin'}
            className={`w-full rounded-md border shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent ${
              formData.role === 'admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            } ${errors.retailer_id ? 'border-red-300' : 'border-gray-300'}`}
          >
            <option value="">
              {formData.role === 'admin' ? 'Not applicable for admin role' : 'Select a retailer'}
            </option>
            {activeRetailers.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>
                {retailer.business_name}
              </option>
            ))}
          </select>
          {errors.retailer_id && (
            <p className="mt-1 text-sm text-red-600">{errors.retailer_id}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="is_active"
            value={formData.is_active ? 'active' : 'inactive'}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Preferred Language */}
        <div>
          <label htmlFor="preferred_language" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Language
          </label>
          <select
            id="preferred_language"
            value={formData.preferred_language}
            onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-livrili-prussian hover:bg-livrili-prussian/90"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {user ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            user ? 'Update User' : 'Create User'
          )}
        </Button>
      </div>
    </form>
  )
}