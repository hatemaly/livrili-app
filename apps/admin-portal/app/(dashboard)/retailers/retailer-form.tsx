'use client'

import { useState } from 'react'
import { Button } from '@livrili/ui'
import { api } from '@/lib/trpc'
import type { Retailer, Document, RetailerFormData, BusinessType, DocumentType } from './types'

interface RetailerFormProps {
  retailer?: Retailer
  onSuccess: () => void
  onCancel: () => void
}

export function RetailerForm({ retailer, onSuccess, onCancel }: RetailerFormProps) {
  const [formData, setFormData] = useState({
    // Business Information
    business_name: retailer?.business_name || '',
    business_type: retailer?.business_type || '',
    registration_number: retailer?.registration_number || '',
    tax_number: retailer?.tax_number || '',
    
    // Contact Information
    phone: retailer?.phone || '',
    email: retailer?.email || '',
    address: retailer?.address || '',
    city: retailer?.city || '',
    state: retailer?.state || '',
    postal_code: retailer?.postal_code || '',
    
    // Financial Settings
    credit_limit: retailer?.credit_limit || 0,
    
    // Status
    status: retailer?.status || 'pending',
  })

  const [documents, setDocuments] = useState<Document[]>(
    retailer?.documents || []
  )

  const [newDocument, setNewDocument] = useState({
    name: '',
    url: '',
    type: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = api.retailers.create.useMutation({
    onSuccess,
    onError: (error) => {
      console.error('Create error:', error.message)
      setErrors({ submit: error.message })
    },
  })

  const updateMutation = api.retailers.update.useMutation({
    onSuccess,
    onError: (error) => {
      console.error('Update error:', error.message)
      setErrors({ submit: error.message })
    },
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (formData.credit_limit < 0) {
      newErrors.credit_limit = 'Credit limit cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      ...formData,
      credit_limit: parseFloat(formData.credit_limit.toString()),
      documents,
    }

    try {
      if (retailer) {
        await updateMutation.mutateAsync({
          id: retailer.id,
          data: submitData,
        })
      } else {
        await createMutation.mutateAsync(submitData)
      }
    } catch (error) {
      // Error is handled in mutation onError
    }
  }

  const addDocument = () => {
    if (!newDocument.name || !newDocument.url || !newDocument.type) {
      return
    }

    const document: Document = {
      ...newDocument,
      uploaded_at: new Date().toISOString(),
    }

    setDocuments([...documents, document])
    setNewDocument({ name: '', url: '', type: '' })
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[80vh] overflow-y-auto">
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Business Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                errors.business_name ? 'border-red-300' : ''
              }`}
              required
            />
            {errors.business_name && (
              <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
              Business Type
            </label>
            <select
              id="business_type"
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">Select business type</option>
              <option value="grocery">Grocery Store</option>
              <option value="supermarket">Supermarket</option>
              <option value="convenience">Convenience Store</option>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              type="text"
              id="registration_number"
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="tax_number" className="block text-sm font-medium text-gray-700">
              Tax ID Number
            </label>
            <input
              type="text"
              id="tax_number"
              value={formData.tax_number}
              onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                errors.phone ? 'border-red-300' : ''
              }`}
              placeholder="+213 123 456 789"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                errors.email ? 'border-red-300' : ''
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="credit_limit" className="block text-sm font-medium text-gray-700">
              Credit Limit (DZD)
            </label>
            <input
              type="number"
              id="credit_limit"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                errors.credit_limit ? 'border-red-300' : ''
              }`}
              min="0"
              step="1000"
            />
            {errors.credit_limit && (
              <p className="mt-1 text-sm text-red-600">{errors.credit_limit}</p>
            )}
          </div>

          {retailer && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
        
        {/* Existing Documents */}
        {documents.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h4>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Document */}
        <div className="border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add Document</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                placeholder="Document name"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <select
                value={newDocument.type}
                onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Select type</option>
                <option value="business_license">Business License</option>
                <option value="tax_certificate">Tax Certificate</option>
                <option value="id_document">ID Document</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <input
                type="url"
                placeholder="Document URL"
                value={newDocument.url}
                onChange={(e) => setNewDocument({ ...newDocument, url: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDocument}
              disabled={!newDocument.name || !newDocument.url || !newDocument.type}
            >
              Add Document
            </Button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : retailer ? 'Update Retailer' : 'Create Retailer'}
        </Button>
      </div>
    </form>
  )
}