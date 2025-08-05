'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Select, Textarea, Card, Tabs } from '@livrili/ui'
import { api } from '@/lib/trpc'
import type { Supplier } from './types'

interface SupplierFormProps {
  supplier?: Supplier | null
  onSuccess: () => void
  onCancel: () => void
}

const paymentTermsOptions = [
  { value: 'Net 15', label: 'Net 15 Days' },
  { value: 'Net 30', label: 'Net 30 Days' },
  { value: 'Net 45', label: 'Net 45 Days' },
  { value: 'Net 60', label: 'Net 60 Days' },
  { value: '2/10 Net 30', label: '2/10 Net 30' },
  { value: 'Cash on Delivery', label: 'Cash on Delivery' },
  { value: 'Prepayment', label: 'Prepayment Required' },
  { value: 'Custom', label: 'Custom Terms' },
]

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

const countryOptions = [
  { value: 'Algeria', label: 'Algeria' },
  { value: 'Morocco', label: 'Morocco' },
  { value: 'Tunisia', label: 'Tunisia' },
  { value: 'France', label: 'France' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Other', label: 'Other' },
]

const productCategoryOptions = [
  'Food & Beverages',
  'Personal Care',
  'Household',
  'Health & Wellness',
  'Baby Care',
  'Pet Care',
  'Automotive',
  'Electronics',
  'Textiles',
  'Office Supplies',
  'Construction',
  'Other',
]

export function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
  const [activeTab, setActiveTab] = useState('company')
  const [formData, setFormData] = useState({
    // Company Information
    company_name: '',
    registration_number: '',
    tax_id: '',
    website: '',
    
    // Contact Information
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Algeria',
    
    // Business Details
    product_categories: [] as string[],
    payment_terms: '',
    minimum_order_value: 0,
    lead_time_days: 0,
    
    // Banking Information
    bank_name: '',
    bank_account_number: '',
    bank_routing_number: '',
    
    // Status and Metadata
    status: 'active' as const,
    is_preferred: false,
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (supplier) {
      setFormData({
        company_name: supplier.company_name || '',
        registration_number: supplier.registration_number || '',
        tax_id: supplier.tax_id || '',
        website: supplier.website || '',
        contact_person: supplier.contact_person || '',
        contact_phone: supplier.contact_phone || '',
        contact_email: supplier.contact_email || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        postal_code: supplier.postal_code || '',
        country: supplier.country || 'Algeria',
        product_categories: supplier.product_categories || [],
        payment_terms: supplier.payment_terms || '',
        minimum_order_value: supplier.minimum_order_value || 0,
        lead_time_days: supplier.lead_time_days || 0,
        bank_name: supplier.bank_name || '',
        bank_account_number: supplier.bank_account_number || '',
        bank_routing_number: supplier.bank_routing_number || '',
        status: supplier.status || 'active',
        is_preferred: supplier.is_preferred || false,
        notes: supplier.notes || '',
      })
    }
  }, [supplier])

  const createMutation = api.suppliers.create.useMutation({
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      console.error('Create supplier error:', error)
    },
  })

  const updateMutation = api.suppliers.update.useMutation({
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      console.error('Update supplier error:', error)
    },
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required'
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address'
    }

    if (formData.minimum_order_value < 0) {
      newErrors.minimum_order_value = 'Minimum order value cannot be negative'
    }

    if (formData.lead_time_days < 0) {
      newErrors.lead_time_days = 'Lead time cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (supplier?.id) {
        await updateMutation.mutateAsync({
          id: supplier.id,
          ...formData,
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      product_categories: prev.product_categories.includes(category)
        ? prev.product_categories.filter(c => c !== category)
        : [...prev.product_categories, category]
    }))
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  const tabs = [
    { id: 'company', label: 'Company Info' },
    { id: 'contact', label: 'Contact Details' },
    { id: 'business', label: 'Business Terms' },
    { id: 'banking', label: 'Banking Info' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Company Information Tab */}
        <Tabs.Content value="company" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Company Name *"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter company name"
                  error={errors.company_name}
                  required
                />
              </div>
              <div>
                <Input
                  label="Registration Number"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="Business registration number"
                />
              </div>
              <div>
                <Input
                  label="Tax ID"
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                  placeholder="Tax identification number"
                />
              </div>
              <div>
                <Input
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://company.com"
                  type="url"
                />
              </div>
            </div>
          </Card>
        </Tabs.Content>

        {/* Contact Details Tab */}
        <Tabs.Content value="contact" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Contact Person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="Primary contact name"
                />
              </div>
              <div>
                <Input
                  label="Phone Number"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+213 XX XX XX XX"
                  type="tel"
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Email Address"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contact@company.com"
                  type="email"
                  error={errors.contact_email}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Address Information</h3>
            <div className="space-y-4">
              <div>
                <Textarea
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full street address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Input
                    label="State/Province"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State or Province"
                  />
                </div>
                <div>
                  <Input
                    label="Postal Code"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
              </div>
              <div>
                <Select
                  label="Country"
                  value={formData.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                  options={countryOptions}
                />
              </div>
            </div>
          </Card>
        </Tabs.Content>

        {/* Business Terms Tab */}
        <Tabs.Content value="business" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Product Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {productCategoryOptions.map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.product_categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Business Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Payment Terms"
                  value={formData.payment_terms}
                  onValueChange={(value) => handleInputChange('payment_terms', value)}
                  options={paymentTermsOptions}
                  placeholder="Select payment terms"
                />
              </div>
              <div>
                <Input
                  label="Lead Time (Days)"
                  type="number"
                  value={formData.lead_time_days}
                  onChange={(e) => handleInputChange('lead_time_days', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  error={errors.lead_time_days}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Minimum Order Value (DZD)"
                  type="number"
                  value={formData.minimum_order_value}
                  onChange={(e) => handleInputChange('minimum_order_value', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  error={errors.minimum_order_value}
                />
              </div>
            </div>
          </Card>
        </Tabs.Content>

        {/* Banking Information Tab */}
        <Tabs.Content value="banking" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Banking Information</h3>
            <div className="space-y-4">
              <div>
                <Input
                  label="Bank Name"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  placeholder="Bank name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Account Number"
                    value={formData.bank_account_number}
                    onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <Input
                    label="Routing Number"
                    value={formData.bank_routing_number}
                    onChange={(e) => handleInputChange('bank_routing_number', e.target.value)}
                    placeholder="Routing/SWIFT code"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Tabs.Content>

        {/* Settings Tab */}
        <Tabs.Content value="settings" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Status & Preferences</h3>
            <div className="space-y-4">
              <div>
                <Select
                  label="Status"
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_preferred}
                    onChange={(e) => handleInputChange('is_preferred', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Preferred Supplier</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Mark as preferred to prioritize in supplier selection
                </p>
              </div>
              <div>
                <Textarea
                  label="Internal Notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Internal notes about this supplier..."
                  rows={4}
                />
              </div>
            </div>
          </Card>
        </Tabs.Content>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  )
}