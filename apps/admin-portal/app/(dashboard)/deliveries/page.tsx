'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Plus, Search, Filter, MapPin, Truck, Clock, Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc'
import { DeliveryList } from '@/components/deliveries/delivery-list'
import { DeliveryAssignmentDialog } from '@/components/deliveries/delivery-assignment-dialog'
import { CreateDeliveryDialog } from '@/components/deliveries/create-delivery-dialog'
import { DeliveryStats } from '@/components/deliveries/delivery-stats'
import { DeliveryDetailsDialog } from '@/components/deliveries/delivery-details-dialog'

export default function DeliveriesPage() {
  usePageTitle('Deliveries - Livrili Admin Portal')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [driverFilter, setDriverFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)
  const [deliveryDetailsId, setDeliveryDetailsId] = useState<string | null>(null)

  // Fetch deliveries with filters
  const { data: deliveriesData, isLoading, error: deliveriesError, refetch } = trpc.deliveries.getDeliveries.useQuery({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    driver_id: driverFilter !== 'all' ? driverFilter : undefined,
    limit: 50,
  })

  // Fetch drivers for filter dropdown
  const { data: driversData, error: driversError } = trpc.deliveries.getDrivers.useQuery({
    limit: 100,
  })

  // Fetch delivery statistics
  const { data: statsData, error: statsError } = trpc.deliveries.getDeliveryStats.useQuery()

  const deliveries = deliveriesData?.items || []
  const drivers = driversData?.items || []

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleDeliveryAssigned = () => {
    setSelectedDelivery(null)
    refetch()
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      assigned: 'bg-blue-100 text-blue-800 border-blue-200',
      picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: 'bg-gray-100 text-gray-800 border-gray-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPriorityLabel = (priority: number) => {
    const labels = { 1: 'Normal', 2: 'High', 3: 'Urgent' }
    return labels[priority as keyof typeof labels] || 'Normal'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground">
            Manage deliveries, assign drivers, and track delivery status
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Delivery
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsError ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load statistics</span>
            </div>
          </CardContent>
        </Card>
      ) : statsData ? (
        <DeliveryStats stats={statsData} />
      ) : null}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by delivery number or address..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={driverFilter} onValueChange={setDriverFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {driversError ? (
                  <SelectItem value="error" disabled>
                    Error loading drivers
                  </SelectItem>
                ) : (
                  drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.users?.full_name || driver.users?.username || driver.phone}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deliveries</CardTitle>
          <CardDescription>
            {deliveriesData?.total || 0} deliveries found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : deliveriesError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Error loading deliveries</h3>
              <p className="text-muted-foreground mb-4">
                {deliveriesError.message || 'Failed to load deliveries. Please try again.'}
              </p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No deliveries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || driverFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first delivery to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && driverFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Delivery
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{delivery.delivery_number}</h3>
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(delivery.priority)}>
                          {getPriorityLabel(delivery.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4" />
                          <span>Order: {delivery.orders?.order_number}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-xs">
                            {delivery.delivery_address}
                          </span>
                        </div>
                        {delivery.drivers && (
                          <div className="flex items-center space-x-1">
                            <Truck className="h-4 w-4" />
                            <span>{delivery.drivers.phone}</span>
                          </div>
                        )}
                        {delivery.estimated_delivery_time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(delivery.estimated_delivery_time).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {delivery.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDelivery(delivery.id)}
                        >
                          Assign Driver
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDeliveryDetailsId(delivery.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateDeliveryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          refetch()
        }}
      />

      {selectedDelivery && (
        <DeliveryAssignmentDialog
          deliveryId={selectedDelivery}
          open={!!selectedDelivery}
          onOpenChange={(open) => !open && setSelectedDelivery(null)}
          onSuccess={handleDeliveryAssigned}
        />
      )}

      {deliveryDetailsId && (
        <DeliveryDetailsDialog
          deliveryId={deliveryDetailsId}
          open={!!deliveryDetailsId}
          onOpenChange={(open) => !open && setDeliveryDetailsId(null)}
          onDeliveryUpdated={() => {
            setDeliveryDetailsId(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}