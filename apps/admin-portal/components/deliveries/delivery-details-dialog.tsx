'use client'

import { useState } from 'react'
import { Package, MapPin, Clock, Truck, User, Phone, DollarSign, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'

interface DeliveryDetailsDialogProps {
  deliveryId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeliveryUpdated?: () => void
}

export function DeliveryDetailsDialog({
  deliveryId,
  open,
  onOpenChange,
  onDeliveryUpdated,
}: DeliveryDetailsDialogProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch delivery details
  const { data: delivery, isLoading, refetch } = trpc.deliveries.getDeliveryById.useQuery(deliveryId, {
    enabled: !!deliveryId && open,
  })

  // Update delivery status mutation
  const updateStatusMutation = trpc.deliveries.updateDeliveryStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Delivery status updated successfully.',
      })
      refetch()
      onDeliveryUpdated?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setIsUpdating(false)
    },
  })

  const handleStatusUpdate = (newStatus: string) => {
    setIsUpdating(true)
    updateStatusMutation.mutate({
      delivery_id: deliveryId,
      status: newStatus,
    })
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

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      assigned: <User className="h-4 w-4" />,
      picked_up: <Package className="h-4 w-4" />,
      in_transit: <Truck className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      failed: <XCircle className="h-4 w-4" />,
      cancelled: <AlertCircle className="h-4 w-4" />,
    }
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />
  }

  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions: Record<string, Array<{ status: string; label: string }>> = {
      pending: [
        { status: 'cancelled', label: 'Cancel Delivery' }
      ],
      assigned: [
        { status: 'picked_up', label: 'Mark as Picked Up' },
        { status: 'cancelled', label: 'Cancel Delivery' }
      ],
      picked_up: [
        { status: 'in_transit', label: 'Mark as In Transit' },
        { status: 'failed', label: 'Mark as Failed' }
      ],
      in_transit: [
        { status: 'delivered', label: 'Mark as Delivered' },
        { status: 'failed', label: 'Mark as Failed' }
      ],
      delivered: [],
      failed: [
        { status: 'assigned', label: 'Reassign for Delivery' }
      ],
      cancelled: []
    }
    return transitions[currentStatus] || []
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!delivery) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Delivery not found</h3>
            <p className="text-muted-foreground">The requested delivery could not be loaded.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const availableTransitions = getAvailableStatusTransitions(delivery.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Delivery Details</span>
          </DialogTitle>
          <DialogDescription>
            {delivery.delivery_number} - Order {delivery.orders?.order_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(delivery.status)}
              <Badge className={getStatusColor(delivery.status)}>
                {delivery.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityColor(delivery.priority)}>
                {getPriorityLabel(delivery.priority)} Priority
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Created: {new Date(delivery.created_at).toLocaleString()}
            </div>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Order Details</span>
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    <div>Order: {delivery.orders?.order_number}</div>
                    <div>Customer: {delivery.orders?.retailers?.business_name}</div>
                    {delivery.orders?.total_amount && (
                      <div>Order Value: ${delivery.orders.total_amount}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Payment Information</span>
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    {delivery.cash_to_collect > 0 ? (
                      <div className="text-orange-600 font-medium">
                        Cash to Collect: ${delivery.cash_to_collect}
                      </div>
                    ) : (
                      <div className="text-green-600">Prepaid</div>
                    )}
                  </div>
                </div>
              </div>

              {delivery.package_weight && (
                <div>
                  <span className="font-medium">Package Weight:</span> {delivery.package_weight}kg
                </div>
              )}

              {delivery.package_dimensions && (
                <div>
                  <span className="font-medium">Dimensions:</span> {delivery.package_dimensions}
                </div>
              )}

              {delivery.special_instructions && (
                <div>
                  <span className="font-medium">Special Instructions:</span>
                  <p className="mt-1 text-sm text-muted-foreground">{delivery.special_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Pickup Address</span>
                </div>
                <p className="pl-6 text-sm">{delivery.pickup_address}</p>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Delivery Address</span>
                </div>
                <p className="pl-6 text-sm">{delivery.delivery_address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Driver Information */}
          {delivery.drivers && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {delivery.drivers.users?.full_name || delivery.drivers.users?.username || 'Unnamed Driver'}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{delivery.drivers.phone}</span>
                      </div>
                      <div>
                        {delivery.drivers.vehicle_type} ({delivery.drivers.vehicle_plate})
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {delivery.estimated_pickup_time && (
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Estimated Pickup</span>
                    </div>
                    <div className="pl-6">
                      {new Date(delivery.estimated_pickup_time).toLocaleString()}
                    </div>
                  </div>
                )}

                {delivery.estimated_delivery_time && (
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Estimated Delivery</span>
                    </div>
                    <div className="pl-6">
                      {new Date(delivery.estimated_delivery_time).toLocaleString()}
                    </div>
                  </div>
                )}

                {delivery.actual_pickup_time && (
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Actual Pickup</span>
                    </div>
                    <div className="pl-6">
                      {new Date(delivery.actual_pickup_time).toLocaleString()}
                    </div>
                  </div>
                )}

                {delivery.actual_delivery_time && (
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Actual Delivery</span>
                    </div>
                    <div className="pl-6">
                      {new Date(delivery.actual_delivery_time).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Actions */}
          {availableTransitions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableTransitions.map((transition) => (
                    <Button
                      key={transition.status}
                      variant="outline"
                      onClick={() => handleStatusUpdate(transition.status)}
                      disabled={isUpdating}
                    >
                      {transition.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}