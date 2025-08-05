'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CalendarIcon, Truck, MapPin, Star, Phone } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'

const assignDriverSchema = z.object({
  driver_id: z.string().uuid('Please select a driver'),
  estimated_pickup_time: z.date().optional(),
  estimated_delivery_time: z.date().optional(),
  notes: z.string().optional(),
})

type AssignDriverFormData = z.infer<typeof assignDriverSchema>

interface DeliveryAssignmentDialogProps {
  deliveryId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeliveryAssignmentDialog({
  deliveryId,
  open,
  onOpenChange,
  onSuccess,
}: DeliveryAssignmentDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AssignDriverFormData>({
    resolver: zodResolver(assignDriverSchema),
  })

  // Fetch delivery details
  const { data: delivery } = trpc.deliveries.getDeliveryById.useQuery(deliveryId, {
    enabled: !!deliveryId,
  })

  // Fetch available drivers
  const { data: driversData } = trpc.deliveries.getDrivers.useQuery({
    status: 'available',
    limit: 50,
  })

  const assignDriverMutation = trpc.deliveries.assignDriver.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Driver has been assigned to the delivery.',
      })
      form.reset()
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = (data: AssignDriverFormData) => {
    setIsSubmitting(true)

    assignDriverMutation.mutate({
      delivery_id: deliveryId,
      driver_id: data.driver_id,
      estimated_pickup_time: data.estimated_pickup_time?.toISOString(),
      estimated_delivery_time: data.estimated_delivery_time?.toISOString(),
      notes: data.notes,
    })
  }

  const drivers = driversData?.items || []

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      busy: 'bg-blue-100 text-blue-800 border-blue-200',
      offline: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getVehicleTypeIcon = (vehicleType: string) => {
    return <Truck className="h-4 w-4" />
  }

  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Driver to Delivery</DialogTitle>
          <DialogDescription>
            Select an available driver and set pickup/delivery estimates for delivery {delivery?.delivery_number}.
          </DialogDescription>
        </DialogHeader>

        {delivery && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Order:</span> {delivery.orders?.order_number}
                </div>
                <div>
                  <span className="font-medium">Priority:</span>{' '}
                  <Badge className={delivery.priority === 3 ? 'bg-red-100 text-red-800' : 
                                   delivery.priority === 2 ? 'bg-orange-100 text-orange-800' : 
                                   'bg-gray-100 text-gray-800'}>
                    {delivery.priority === 3 ? 'Urgent' : delivery.priority === 2 ? 'High' : 'Normal'}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Pickup:</span> {delivery.pickup_address}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Delivery:</span> {delivery.delivery_address}
                </div>
                {delivery.cash_to_collect > 0 && (
                  <div>
                    <span className="font-medium">Cash to Collect:</span> ${delivery.cash_to_collect}
                  </div>
                )}
                {delivery.package_weight && (
                  <div>
                    <span className="font-medium">Weight:</span> {delivery.package_weight}kg
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Selection */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="driver_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Driver *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an available driver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {driver.users?.full_name || driver.users?.username || driver.phone}
                                </span>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Badge className={getStatusColor(driver.status)} className="text-xs">
                                    {driver.status}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs">{formatRating(driver.rating)}</span>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Available Drivers List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium">Available Drivers</h4>
                  {drivers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available drivers found.</p>
                  ) : (
                    drivers.map((driver) => (
                      <Card
                        key={driver.id}
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/50',
                          form.watch('driver_id') === driver.id && 'ring-2 ring-primary'
                        )}
                        onClick={() => form.setValue('driver_id', driver.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {driver.users?.full_name || driver.users?.username || 'Unnamed Driver'}
                                </span>
                                <Badge className={getStatusColor(driver.status)}>
                                  {driver.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{driver.phone}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {getVehicleTypeIcon(driver.vehicle_type)}
                                  <span>{driver.vehicle_type}</span>
                                  <span>({driver.vehicle_plate})</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{formatRating(driver.rating)}</span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {driver.successful_deliveries}/{driver.total_deliveries} successful deliveries
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Time Estimates */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Time Estimates</h4>

                <FormField
                  control={form.control}
                  name="estimated_pickup_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Pickup Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP p')
                              ) : (
                                <span>Pick pickup time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_delivery_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP p')
                              ) : (
                                <span>Pick delivery time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Special instructions for the driver..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Driver Location Info */}
                {form.watch('driver_id') && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Driver Information</h5>
                    {(() => {
                      const selectedDriver = drivers.find(d => d.id === form.watch('driver_id'))
                      if (!selectedDriver) return null
                      
                      return (
                        <div className="text-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Capacity:</span>
                            <span>{selectedDriver.max_capacity_kg}kg</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Max orders/trip:</span>
                            <span>{selectedDriver.max_orders_per_trip}</span>
                          </div>
                          {selectedDriver.zone_coverage && selectedDriver.zone_coverage.length > 0 && (
                            <div>
                              <span className="text-muted-foreground">Coverage zones:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedDriver.zone_coverage.map((zone, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {zone}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedDriver.current_location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-muted-foreground">Last location:</span>
                              <span className="text-xs">
                                {selectedDriver.current_location.address || 'Unknown location'}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.watch('driver_id')}>
                {isSubmitting ? 'Assigning...' : 'Assign Driver'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}