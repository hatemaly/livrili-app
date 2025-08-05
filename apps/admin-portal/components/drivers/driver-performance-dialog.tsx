'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Clock, TrendingUp, Package, CheckCircle } from 'lucide-react'
import { trpc } from '@/lib/trpc'

interface DriverPerformanceDialogProps {
  driverId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DriverPerformanceDialog({
  driverId,
  open,
  onOpenChange,
}: DriverPerformanceDialogProps) {
  // Fetch driver details
  const { data: driversData } = trpc.deliveries.getDrivers.useQuery({
    limit: 1000,
  })

  // Fetch driver deliveries
  const { data: deliveriesData } = trpc.deliveries.getDriverDeliveries.useQuery({
    driver_id: driverId,
    limit: 100,
  })

  const driver = driversData?.items.find(d => d.id === driverId)
  const deliveries = deliveriesData?.items || []

  if (!driver) {
    return null
  }

  // Calculate performance metrics
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered')
  const failedDeliveries = deliveries.filter(d => d.status === 'failed')
  const successRate = deliveries.length > 0 ? (completedDeliveries.length / deliveries.length) * 100 : 0

  // Calculate average rating from completed deliveries
  const ratedDeliveries = completedDeliveries.filter(d => d.customer_rating)
  const averageCustomerRating = ratedDeliveries.length > 0 
    ? ratedDeliveries.reduce((sum, d) => sum + (d.customer_rating || 0), 0) / ratedDeliveries.length
    : 0

  // Calculate on-time delivery rate
  const onTimeDeliveries = completedDeliveries.filter(d => {
    if (!d.estimated_delivery_time || !d.actual_delivery_time) return false
    return new Date(d.actual_delivery_time) <= new Date(d.estimated_delivery_time)
  })
  const onTimeRate = completedDeliveries.length > 0 ? (onTimeDeliveries.length / completedDeliveries.length) * 100 : 0

  // Recent deliveries (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentDeliveries = deliveries.filter(d => new Date(d.created_at) >= thirtyDaysAgo)

  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      delivered: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      in_transit: 'bg-blue-100 text-blue-800 border-blue-200',
      assigned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Driver Performance - {driver.users?.full_name || driver.users?.username || driver.phone}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Driver Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{driver.total_deliveries}</div>
                  <p className="text-sm text-muted-foreground">Total Deliveries</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{driver.successful_deliveries}</div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center space-x-1">
                    <span>{formatRating(driver.rating)}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-sm text-muted-foreground">Driver Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">On-Time Delivery Rate:</span>
                  <span className="font-medium">{onTimeRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer Rating:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{formatRating(averageCustomerRating)}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-muted-foreground">({ratedDeliveries.length} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed Deliveries:</span>
                  <span className="font-medium text-red-600">{failedDeliveries.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recent Activity (30 days):</span>
                  <span className="font-medium">{recentDeliveries.length} deliveries</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle & Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vehicle Type:</span>
                  <span className="font-medium capitalize">{driver.vehicle_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vehicle Plate:</span>
                  <span className="font-medium">{driver.vehicle_plate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Capacity:</span>
                  <span className="font-medium">{driver.max_capacity_kg}kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Orders/Trip:</span>
                  <span className="font-medium">{driver.max_orders_per_trip}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coverage Zones */}
          {driver.zone_coverage && driver.zone_coverage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coverage Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {driver.zone_coverage.map((zone, index) => (
                    <Badge key={index} variant="outline">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No deliveries found for this driver.
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {deliveries.slice(0, 10).map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{delivery.delivery_number}</span>
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {delivery.customer_rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-sm">{delivery.customer_rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Order: {delivery.orders?.order_number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        {delivery.cash_collected > 0 && (
                          <div className="text-sm font-medium text-green-600">
                            ${delivery.cash_collected}
                          </div>
                        )}
                        {delivery.actual_delivery_time && delivery.estimated_delivery_time && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(delivery.actual_delivery_time) <= new Date(delivery.estimated_delivery_time) ? (
                              <span className="text-green-600">On Time</span>
                            ) : (
                              <span className="text-red-600">Late</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}