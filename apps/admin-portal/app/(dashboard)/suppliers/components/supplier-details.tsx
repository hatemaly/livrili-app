'use client'

import { useState } from 'react'
import { Modal, Button, Badge, Avatar, Tabs, Card } from '@livrili/ui'
import { 
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import type { Supplier } from '../types'

interface SupplierDetailsProps {
  supplier: Supplier | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  formatCurrency: (amount: number) => string
  formatRating: (rating: number) => string
  formatPercentage: (value: number) => string
}

export function SupplierDetails({
  supplier,
  isOpen,
  onClose,
  onEdit,
  formatCurrency,
  formatRating,
  formatPercentage,
}: SupplierDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!supplier) return null

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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Purchase Orders' },
    { id: 'performance', label: 'Performance' },
    { id: 'communications', label: 'Communications' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Avatar
              size="sm"
              fallback={getInitials(supplier.company_name)}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{supplier.company_name}</h2>
                {supplier.is_preferred && (
                  <StarSolidIcon className="w-5 h-5 text-yellow-400" title="Preferred Supplier" />
                )}
                <Badge 
                  variant={getStatusColor(supplier.status) as any}
                  size="sm"
                >
                  {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                </Badge>
              </div>
              {supplier.registration_number && (
                <p className="text-sm text-gray-500">
                  Registration: {supplier.registration_number}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Button>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="grid w-full grid-cols-5">
            {tabs.map((tab) => (
              <Tabs.Trigger key={tab.id} value={tab.id}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Content value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {supplier.contact_person && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Person</label>
                      <p className="text-sm text-gray-900">{supplier.contact_person}</p>
                    </div>
                  )}
                  {supplier.contact_phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{supplier.contact_phone}</p>
                    </div>
                  )}
                  {supplier.contact_email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{supplier.contact_email}</p>
                    </div>
                  )}
                  {supplier.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <a 
                        href={supplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              {/* Address Information */}
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  Address
                </h3>
                <div className="space-y-2">
                  {supplier.address && (
                    <p className="text-sm text-gray-900">{supplier.address}</p>
                  )}
                  <div className="text-sm text-gray-900">
                    {[supplier.city, supplier.state, supplier.postal_code].filter(Boolean).join(', ')}
                  </div>
                  {supplier.country && (
                    <p className="text-sm text-gray-900">{supplier.country}</p>
                  )}
                </div>
              </Card>

              {/* Business Details */}
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5" />
                  Business Details
                </h3>
                <div className="space-y-3">
                  {supplier.tax_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tax ID</label>
                      <p className="text-sm text-gray-900">{supplier.tax_id}</p>
                    </div>
                  )}
                  {supplier.payment_terms && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                      <p className="text-sm text-gray-900">{supplier.payment_terms}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Minimum Order</label>
                    <p className="text-sm text-gray-900">{formatCurrency(supplier.minimum_order_value)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Lead Time</label>
                    <p className="text-sm text-gray-900">{supplier.lead_time_days} days</p>
                  </div>
                </div>
              </Card>

              {/* Performance Metrics */}
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Performance
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Overall Rating</label>
                    <div className="flex items-center gap-2">
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
                      <span className="text-sm text-gray-900">
                        {formatRating(supplier.performance_rating)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">On-time Delivery</label>
                    <p className="text-sm text-gray-900">
                      {formatPercentage(supplier.on_time_delivery_rate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quality Score</label>
                    <p className="text-sm text-gray-900">
                      {formatRating(supplier.quality_score)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Response Time</label>
                    <p className="text-sm text-gray-900">
                      {supplier.response_time_hours}h average
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Product Categories */}
            {supplier.product_categories && supplier.product_categories.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Product Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.product_categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Banking Information */}
            {(supplier.bank_name || supplier.bank_account_number) && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  Banking Information
                </h3>
                <div className="space-y-3">
                  {supplier.bank_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bank Name</label>
                      <p className="text-sm text-gray-900">{supplier.bank_name}</p>
                    </div>
                  )}
                  {supplier.bank_account_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <p className="text-sm text-gray-900 font-mono">
                        {supplier.bank_account_number.replace(/(.{4})/g, '$1 ')}
                      </p>
                    </div>
                  )}
                  {supplier.bank_routing_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Routing Number</label>
                      <p className="text-sm text-gray-900">{supplier.bank_routing_number}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Notes */}
            {supplier.notes && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  Internal Notes
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
              </Card>
            )}
          </Tabs.Content>

          {/* Products Tab */}
          <Tabs.Content value="products">
            <Card className="p-8 text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Product sourcing information will be displayed here once integrated with the product management system.
              </p>
            </Card>
          </Tabs.Content>

          {/* Purchase Orders Tab */}
          <Tabs.Content value="orders">
            <Card className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Purchase order history will be displayed here once the purchase order system is implemented.
              </p>
            </Card>
          </Tabs.Content>

          {/* Performance Tab */}
          <Tabs.Content value="performance">
            <Card className="p-8 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Detailed performance metrics and analytics will be displayed here.
              </p>
            </Card>
          </Tabs.Content>

          {/* Communications Tab */}
          <Tabs.Content value="communications">
            <Card className="p-8 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Communication history and logs will be displayed here once the communication system is integrated.
              </p>
            </Card>
          </Tabs.Content>
        </Tabs>
      </div>
    </Modal>
  )
}