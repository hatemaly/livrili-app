'use client'

import { useState } from 'react'
import { Button, Badge, Avatar } from '@livrili/ui'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import type { Supplier } from '../types'

interface SupplierTableProps {
  suppliers: Supplier[]
  loading: boolean
  selectedSuppliers: Set<string>
  onSelectSupplier: (supplierId: string, isSelected: boolean) => void
  onSelectAll: (isSelected: boolean) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (id: string) => void
  onViewDetails: (supplier: Supplier) => void
  onDuplicate: (id: string) => void
  formatCurrency: (amount: number) => string
  formatRating: (rating: number) => string
  formatPercentage: (value: number) => string
}

type SortField = 'company_name' | 'status' | 'performance_rating' | 'created_at' | 'last_order_date'
type SortDirection = 'asc' | 'desc'

export function SupplierTable({
  suppliers,
  loading,
  selectedSuppliers,
  onSelectSupplier,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  formatCurrency,
  formatRating,
  formatPercentage,
}: SupplierTableProps) {
  const [sortField, setSortField] = useState<SortField>('company_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    // Handle null/undefined values
    if (aValue == null) aValue = ''
    if (bValue == null) bValue = ''

    // Handle dates
    if (sortField === 'created_at' || sortField === 'last_order_date') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    // Handle numbers
    if (sortField === 'performance_rating') {
      aValue = Number(aValue)
      bValue = Number(bValue)
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'inactive':
        return 'gray'
      case 'suspended':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading suppliers...</p>
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="p-8 text-center">
        <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No suppliers found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={suppliers.length > 0 && suppliers.every(s => selectedSuppliers.has(s.id))}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('company_name')}
            >
              <div className="flex items-center gap-1">
                Supplier
                {sortField === 'company_name' && (
                  <span className="text-blue-500">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categories
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('performance_rating')}
            >
              <div className="flex items-center gap-1">
                Rating
                {sortField === 'performance_rating' && (
                  <span className="text-blue-500">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Terms
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                {sortField === 'status' && (
                  <span className="text-blue-500">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('last_order_date')}
            >
              <div className="flex items-center gap-1">
                Last Order
                {sortField === 'last_order_date' && (
                  <span className="text-blue-500">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedSuppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedSuppliers.has(supplier.id)}
                  onChange={(e) => onSelectSupplier(supplier.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Avatar
                    size="sm"
                    fallback={getInitials(supplier.company_name)}
                    className="mr-3"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {supplier.company_name}
                      </span>
                      {supplier.is_preferred && (
                        <StarSolidIcon className="w-4 h-4 text-yellow-400" title="Preferred Supplier" />
                      )}
                    </div>
                    {supplier.registration_number && (
                      <div className="text-xs text-gray-500">
                        Reg: {supplier.registration_number}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {supplier.contact_person && (
                    <div className="font-medium">{supplier.contact_person}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {supplier.contact_phone && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <PhoneIcon className="w-3 h-3" />
                        {supplier.contact_phone}
                      </div>
                    )}
                    {supplier.contact_email && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <EnvelopeIcon className="w-3 h-3" />
                        {supplier.contact_email}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {supplier.product_categories?.slice(0, 2).map((category) => (
                    <Badge key={category} variant="secondary" size="sm">
                      {category}
                    </Badge>
                  ))}
                  {supplier.product_categories && supplier.product_categories.length > 2 && (
                    <Badge variant="outline" size="sm">
                      +{supplier.product_categories.length - 2}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(supplier.performance_rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">
                    {formatRating(supplier.performance_rating)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatPercentage(supplier.on_time_delivery_rate)} on-time
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {supplier.payment_terms || 'Not set'}
                </div>
                <div className="text-xs text-gray-500">
                  Min: {formatCurrency(supplier.minimum_order_value)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge 
                  variant={getStatusColor(supplier.status) as any}
                  size="sm"
                >
                  {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.last_order_date ? (
                  <div>
                    {new Date(supplier.last_order_date).toLocaleDateString()}
                  </div>
                ) : (
                  <span className="text-gray-400">Never</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(supplier)}
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(supplier)}
                    title="Edit Supplier"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(supplier.id)}
                    title="Duplicate Supplier"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(supplier.id)}
                    title="Delete Supplier"
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}