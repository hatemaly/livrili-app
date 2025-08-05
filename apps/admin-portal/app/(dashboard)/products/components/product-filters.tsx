'use client'

import { useState, useCallback } from 'react'
import { Button } from '@livrili/ui'
import { Search, Filter, X } from 'lucide-react'
import type { ProductFilters as ProductFiltersType, Category, Supplier, ProductTag } from '../types'
import { api } from '@/lib/trpc'

interface ProductFiltersProps {
  filters: ProductFiltersType
  categories: Category[]
  suppliers: Supplier[]
  onFiltersChange: (filters: ProductFiltersType) => void
}

export function ProductFilters({
  filters,
  categories,
  suppliers,
  onFiltersChange,
}: ProductFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleInputChange = useCallback((field: keyof ProductFiltersType, value: any) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  const handlePriceRangeChange = useCallback((type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0
    const newPriceRange = { ...localFilters.priceRange, [type]: numValue }
    const newFilters = { ...localFilters, priceRange: newPriceRange }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  const { data: popularTags } = api.tags.getPopular.useQuery({ limit: 20 })

  const clearFilters = useCallback(() => {
    const clearedFilters: ProductFiltersType = {
      search: '',
      category: '',
      tags: [],
      priceRange: { min: 0, max: 0 },
      stockStatus: '',
      supplier: '',
      isActive: undefined,
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }, [onFiltersChange])

  const handleTagToggle = useCallback((tagId: string) => {
    const newTags = localFilters.tags.includes(tagId)
      ? localFilters.tags.filter(id => id !== tagId)
      : [...localFilters.tags, tagId]
    handleInputChange('tags', newTags)
  }, [localFilters.tags, handleInputChange])

  const hasActiveFilters = 
    localFilters.search ||
    localFilters.category ||
    localFilters.tags.length > 0 ||
    localFilters.priceRange.min > 0 ||
    localFilters.priceRange.max > 0 ||
    localFilters.stockStatus ||
    localFilters.supplier ||
    localFilters.isActive !== undefined

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      {/* Search and basic filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={localFilters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={localFilters.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name_en}
            </option>
          ))}
        </select>

        <select
          value={localFilters.stockStatus}
          onChange={(e) => handleInputChange('stockStatus', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Stock Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showAdvanced ? 'Less Filters' : 'More Filters'}
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t">
          {/* Tags Filter */}
          {popularTags && popularTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      localFilters.tags.includes(tag.id)
                        ? 'text-white'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: localFilters.tags.includes(tag.id) ? tag.color : undefined,
                      border: `1px solid ${tag.color}40`,
                    }}
                  >
                    {tag.name}
                    {tag.usage_count > 0 && (
                      <span className="ml-1 text-xs opacity-75">
                        {tag.usage_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (DZD)
              </label>
              <input
                type="number"
                value={localFilters.priceRange.min || ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (DZD)
              </label>
              <input
                type="number"
                value={localFilters.priceRange.max || ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                value={localFilters.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={localFilters.isActive === undefined ? '' : localFilters.isActive.toString()}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value === 'true'
                  handleInputChange('isActive', value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4" />
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}