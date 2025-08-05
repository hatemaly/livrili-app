'use client'

import { useState } from 'react'
import { Input, Select, Button, Card } from '@livrili/ui'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { SupplierFilters } from '../types'

interface SupplierFiltersProps {
  filters: SupplierFilters
  onFiltersChange: (filters: SupplierFilters) => void
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

const paymentTermsOptions = [
  { value: '', label: 'All Payment Terms' },
  { value: 'Net 15', label: 'Net 15 Days' },
  { value: 'Net 30', label: 'Net 30 Days' },
  { value: 'Net 45', label: 'Net 45 Days' },
  { value: 'Net 60', label: 'Net 60 Days' },
  { value: '2/10 Net 30', label: '2/10 Net 30' },
  { value: 'Cash on Delivery', label: 'Cash on Delivery' },
  { value: 'Prepayment', label: 'Prepayment Required' },
]

const categoryOptions = [
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

export function SupplierFilters({ filters, onFiltersChange }: SupplierFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (field: keyof SupplierFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    })
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    handleFilterChange('categories', newCategories)
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      categories: [],
      payment_terms: '',
      performance_rating: { min: 0, max: 5 },
      is_preferred: undefined,
      has_recent_orders: undefined,
    })
  }

  const hasActiveFilters = 
    filters.search ||
    filters.status ||
    filters.categories.length > 0 ||
    filters.payment_terms ||
    filters.performance_rating.min > 0 ||
    filters.performance_rating.max < 5 ||
    filters.is_preferred !== undefined ||
    filters.has_recent_orders !== undefined

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Basic Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search suppliers by name, contact, or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
              options={statusOptions}
              placeholder="Filter by status"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="w-4 h-4" />
              Advanced
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.is_preferred === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('is_preferred', filters.is_preferred === true ? undefined : true)}
              >
                Preferred Only
              </Button>
              <Button
                variant={filters.has_recent_orders === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('has_recent_orders', filters.has_recent_orders === true ? undefined : true)}
              >
                Recent Orders
              </Button>
            </div>

            {/* Payment Terms */}
            <div>
              <Select
                label="Payment Terms"
                value={filters.payment_terms}
                onValueChange={(value) => handleFilterChange('payment_terms', value)}
                options={paymentTermsOptions}
              />
            </div>

            {/* Performance Rating Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Rating Range: {filters.performance_rating.min} - {filters.performance_rating.max}
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.performance_rating.min}
                    onChange={(e) => handleFilterChange('performance_rating', {
                      ...filters.performance_rating,
                      min: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 mt-1">Min: {filters.performance_rating.min}</div>
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.performance_rating.max}
                    onChange={(e) => handleFilterChange('performance_rating', {
                      ...filters.performance_rating,
                      max: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 mt-1">Max: {filters.performance_rating.max}</div>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {categoryOptions.map((category) => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm truncate" title={category}>
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.categories.map((category) => (
              <span key={category} className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs">
                {category}
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.is_preferred === true && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs">
                Preferred
                <button
                  onClick={() => handleFilterChange('is_preferred', undefined)}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}