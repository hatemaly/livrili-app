'use client'

import { Button, Badge, Avatar, Card } from '@livrili/ui'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import type { Supplier } from '../types'

interface SupplierGridProps {
  suppliers: Supplier[]
  loading: boolean
  selectedSuppliers: Set<string>
  onSelectSupplier: (supplierId: string, isSelected: boolean) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (id: string) => void
  onViewDetails: (supplier: Supplier) => void
  onDuplicate: (id: string) => void
  formatCurrency: (amount: number) => string
  formatRating: (rating: number) => string
  formatPercentage: (value: number) => string
}

export function SupplierGrid({
  suppliers,
  loading,
  selectedSuppliers,
  onSelectSupplier,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  formatCurrency,
  formatRating,
  formatPercentage,
}: SupplierGridProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {suppliers.map((supplier) => (
        <Card key={supplier.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedSuppliers.has(supplier.id)}
                  onChange={(e) => onSelectSupplier(supplier.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Avatar
                  size="sm"
                  fallback={getInitials(supplier.company_name)}
                />
              </div>
              <div className="flex items-center gap-1">
                {supplier.is_preferred && (
                  <StarSolidIcon className="w-4 h-4 text-yellow-400" title="Preferred Supplier" />
                )}
                <Badge 
                  variant={getStatusColor(supplier.status) as any}
                  size="sm"
                >
                  {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="font-medium text-gray-900 truncate" title={supplier.company_name}>
                {supplier.company_name}
              </h3>
              {supplier.registration_number && (
                <p className="text-xs text-gray-500">
                  Reg: {supplier.registration_number}
                </p>
              )}
            </div>

            {/* Contact Info */}
            {(supplier.contact_person || supplier.contact_phone || supplier.contact_email) && (
              <div className="space-y-1">
                {supplier.contact_person && (
                  <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                )}
                <div className="flex flex-col gap-1">
                  {supplier.contact_phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <PhoneIcon className="w-3 h-3" />
                      <span className="truncate">{supplier.contact_phone}</span>
                    </div>
                  )}
                  {supplier.contact_email && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <EnvelopeIcon className="w-3 h-3" />
                      <span className="truncate">{supplier.contact_email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {supplier.city && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPinIcon className="w-3 h-3" />
                <span className="truncate">
                  {supplier.city}{supplier.country && supplier.country !== 'Algeria' && `, ${supplier.country}`}
                </span>
              </div>
            )}

            {/* Categories */}
            {supplier.product_categories && supplier.product_categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {supplier.product_categories.slice(0, 2).map((category) => (
                  <Badge key={category} variant="secondary" size="sm">
                    {category}
                  </Badge>
                ))}
                {supplier.product_categories.length > 2 && (
                  <Badge variant="outline" size="sm">
                    +{supplier.product_categories.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Performance */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(supplier.performance_rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  {formatRating(supplier.performance_rating)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {formatPercentage(supplier.on_time_delivery_rate)} on-time delivery
              </div>
            </div>

            {/* Business Terms */}
            <div className="space-y-1">
              {supplier.payment_terms && (
                <div className="text-xs text-gray-600">
                  Terms: {supplier.payment_terms}
                </div>
              )}
              <div className="text-xs text-gray-600">
                Min Order: {formatCurrency(supplier.minimum_order_value)}
              </div>
              {supplier.lead_time_days > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3" />
                  {supplier.lead_time_days} day lead time
                </div>
              )}
            </div>

            {/* Last Order */}
            <div className="text-xs text-gray-500">
              Last order: {supplier.last_order_date ? (
                new Date(supplier.last_order_date).toLocaleDateString()
              ) : (
                'Never'
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(supplier)}
                className="flex-1 mr-1"
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                View
              </Button>
              <div className="flex gap-1">
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
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}