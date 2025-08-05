'use client'

import { Package, MapPin, Truck, Clock, User, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DeliveryListProps {
  deliveries: any[]
  onAssignDriver?: (deliveryId: string) => void
  onViewDetails?: (deliveryId: string) => void
}

export function DeliveryList({ deliveries, onAssignDriver, onViewDetails }: DeliveryListProps) {
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

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No deliveries found</h3>
        <p className="text-muted-foreground">
          No deliveries match your current filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deliveries.map((delivery) => (
        <Card key={delivery.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>Order: {delivery.orders?.order_number}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{delivery.retailers?.business_name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {delivery.delivery_address}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{delivery.delivery_contact}</span>
                  </div>
                  
                  {delivery.drivers && (
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4" />
                      <span>Driver: {delivery.drivers.phone}</span>
                    </div>
                  )}
                  
                  {delivery.estimated_delivery_time && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Est: {new Date(delivery.estimated_delivery_time).toLocaleDateString()} {new Date(delivery.estimated_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>

                {delivery.cash_to_collect > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-green-600">
                      Cash to collect: ${delivery.cash_to_collect}
                    </span>
                  </div>
                )}

                {delivery.special_instructions && (
                  <div className="text-sm">
                    <span className="font-medium">Instructions:</span> {delivery.special_instructions}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {delivery.status === 'pending' && onAssignDriver && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignDriver(delivery.id)}
                  >
                    Assign Driver
                  </Button>
                )}
                
                {onViewDetails && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewDetails(delivery.id)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}