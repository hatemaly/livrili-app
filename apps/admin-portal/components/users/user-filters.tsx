'use client'

import { UserFilters } from '@/types/user'

interface UserFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  retailers: Array<{ id: string; business_name: string; status: string }>
}

export function UserFiltersComponent({ filters, onFiltersChange, retailers }: UserFiltersProps) {
  const updateFilter = (key: keyof UserFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      role: '',
      status: '',
      retailer_id: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search by name, username..."
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={filters.role}
            onChange={(e) => updateFilter('role', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="retailer">Retailer</option>
            <option value="driver">Driver</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Retailer Filter */}
        <div>
          <label htmlFor="retailer" className="block text-sm font-medium text-gray-700 mb-1">
            Retailer
          </label>
          <select
            id="retailer"
            value={filters.retailer_id}
            onChange={(e) => updateFilter('retailer_id', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
          >
            <option value="">All Retailers</option>
            {retailers.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>
                {retailer.business_name} ({retailer.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-livrili-prussian hover:text-livrili-prussian/80 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}