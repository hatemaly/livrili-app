'use client'

import { useState } from 'react'
import { Route, MapPin, Clock, Truck, User, Phone, Package, CheckCircle, AlertCircle, Navigation } from 'lucide-react'
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

interface RouteDetailsDialogProps {
  routeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRouteUpdated?: () => void
}

export function RouteDetailsDialog({
  routeId,
  open,
  onOpenChange,
  onRouteUpdated,
}: RouteDetailsDialogProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch route details
  const { data: route, isLoading, refetch } = trpc.deliveries.getDeliveryRouteById.useQuery(routeId, {
    enabled: !!routeId && open,
  })

  // Fetch deliveries for this route
  const { data: deliveriesData } = trpc.deliveries.getDeliveries.useQuery({
    route_id: routeId,
    limit: 100,
  }, {
    enabled: !!routeId && open,
  })

  const deliveries = deliveriesData?.items || []

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getDeliveryStatusColor = (status: string) => {
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

  const formatDuration = (minutes: number) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      planned: <Clock className="h-4 w-4" />,
      active: <Navigation className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      cancelled: <AlertCircle className="h-4 w-4" />,
    }
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />
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

  if (!route) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Route not found</h3>
            <p className="text-muted-foreground">The requested route could not be loaded.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Route Details</span>
          </DialogTitle>
          <DialogDescription>
            {route.route_name || `Route for ${new Date(route.route_date).toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(route.status)}
              <Badge className={getStatusColor(route.status)}>
                {route.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Created: {new Date(route.created_at).toLocaleString()}
            </div>
          </div>

          {/* Route Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Route Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{route.total_deliveries}</div>
                  <div className="text-sm text-muted-foreground">Total Deliveries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{route.completed_deliveries}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {route.total_distance ? `${route.total_distance.toFixed(1)}km` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Distance</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Time Estimates</span>
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    <div>Estimated: {formatDuration(route.estimated_duration)}</div>
                    {route.actual_duration && (
                      <div>Actual: {formatDuration(route.actual_duration)}</div>
                    )}
                  </div>
                </div>

                {route.drivers && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Assigned Driver</span>
                    </div>
                    <div className="pl-6 space-y-1 text-sm">
                      <div>{route.drivers.users?.full_name || route.drivers.users?.username || 'Unnamed Driver'}</div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{route.drivers.phone}</span>
                      </div>
                      <div>{route.drivers.vehicle_type} ({route.drivers.vehicle_plate})</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {(route.start_time || route.end_time) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {route.start_time && (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Route Started</span>
                      </div>
                      <div className="pl-6">
                        {new Date(route.start_time).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {route.end_time && (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Route Completed</span>
                      </div>
                      <div className="pl-6">
                        {new Date(route.end_time).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Stops */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Route Stops ({deliveries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No deliveries found for this route
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map((delivery, index) => (
                    <div key={delivery.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{delivery.delivery_number}</span>
                              <Badge className={getDeliveryStatusColor(delivery.status)}>
                                {delivery.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            {delivery.cash_to_collect > 0 && (
                              <div className="text-sm text-orange-600 font-medium">
                                Cash: ${delivery.cash_to_collect}
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2">
                              <Package className="h-3 w-3 text-muted-foreground" />
                              <span>Order: {delivery.orders?.order_number}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{delivery.delivery_address}</span>
                            </div>
                            {delivery.estimated_delivery_time && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>ETA: {new Date(delivery.estimated_delivery_time).toLocaleString()}</span>
                              </div>
                            )}
                          </div>

                          {delivery.special_instructions && (
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                              <strong>Instructions:</strong> {delivery.special_instructions}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Notes */}
          {route.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{route.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}