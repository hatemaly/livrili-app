'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CalendarIcon, Package, MapPin, User, Phone, Clock } from 'lucide-react'
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
  FormDescription,
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
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'

const createDeliverySchema = z.object({
  order_id: z.string().uuid('Please select a valid order'),
  priority: z.number().min(1).max(3).default(1),
  pickup_address: z.string().min(1, 'Pickup address is required'),
  pickup_contact: z.string().optional(),
  pickup_notes: z.string().optional(),
  pickup_date: z.date().optional(),
  pickup_time: z.string().optional(),
  delivery_address: z.string().min(1, 'Delivery address is required'),
  delivery_contact: z.string().min(1, 'Delivery contact is required'),
  delivery_notes: z.string().optional(),
  delivery_date: z.date().optional(),
  delivery_time: z.string().optional(),
  package_weight: z.number().positive().optional(),
  package_length: z.number().positive().optional(),
  package_width: z.number().positive().optional(),
  package_height: z.number().positive().optional(),
  special_instructions: z.string().optional(),
  cash_to_collect: z.number().min(0).default(0),
  delivery_fee: z.number().min(0).default(0),
})

type CreateDeliveryFormData = z.infer<typeof createDeliverySchema>

interface CreateDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateDeliveryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDeliveryDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateDeliveryFormData>({
    resolver: zodResolver(createDeliverySchema),
    defaultValues: {
      priority: 1,
      cash_to_collect: 0,
      delivery_fee: 0,
    },
  })

  // Fetch orders for dropdown
  const { data: ordersData } = trpc.orders.getAll.useQuery({
    status: 'confirmed',
    limit: 100,
  })

  const createDeliveryMutation = trpc.deliveries.createDelivery.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Delivery has been created successfully.',
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

  const onSubmit = (data: CreateDeliveryFormData) => {
    setIsSubmitting(true)

    // Prepare the delivery data
    const deliveryData = {
      order_id: data.order_id,
      priority: data.priority,
      pickup_address: data.pickup_address,
      pickup_contact: data.pickup_contact,
      pickup_notes: data.pickup_notes,
      pickup_time_window_start: data.pickup_date && data.pickup_time 
        ? new Date(`${format(data.pickup_date, 'yyyy-MM-dd')}T${data.pickup_time}`).toISOString()
        : undefined,
      delivery_address: data.delivery_address,
      delivery_contact: data.delivery_contact,
      delivery_notes: data.delivery_notes,
      delivery_time_window_start: data.delivery_date && data.delivery_time
        ? new Date(`${format(data.delivery_date, 'yyyy-MM-dd')}T${data.delivery_time}`).toISOString()
        : undefined,
      package_weight: data.package_weight,
      package_dimensions: (data.package_length || data.package_width || data.package_height) ? {
        length: data.package_length,
        width: data.package_width,
        height: data.package_height,
        unit: 'cm',
      } : undefined,
      special_instructions: data.special_instructions,
      cash_to_collect: data.cash_to_collect,
      delivery_fee: data.delivery_fee,
    }

    createDeliveryMutation.mutate(deliveryData)
  }

  const handleOrderSelect = (orderId: string) => {
    const selectedOrder = ordersData?.items.find(order => order.id === orderId)
    if (selectedOrder) {
      // Auto-fill delivery address from order
      form.setValue('delivery_address', selectedOrder.delivery_address)
      // Set cash to collect from order total if payment method is cash
      if (selectedOrder.payment_method === 'cash') {
        form.setValue('cash_to_collect', selectedOrder.total_amount)
      }
    }
  }

  const orders = ordersData?.items || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Delivery</DialogTitle>
          <DialogDescription>
            Create a delivery assignment for an order. Fill in the pickup and delivery details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Order & Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>Order Information</span>
                </div>

                <FormField
                  control={form.control}
                  name="order_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleOrderSelect(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.order_number} - {order.retailers?.business_name} (${order.total_amount})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Normal</SelectItem>
                          <SelectItem value="2">High</SelectItem>
                          <SelectItem value="3">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pickup Information */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Pickup Information</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="pickup_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Address *</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter pickup address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickup_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Contact</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Contact person phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="pickup_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Date</FormLabel>
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
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
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
                      name="pickup_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Time</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pickup_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Special pickup instructions" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Delivery Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Delivery Information</span>
                </div>

                <FormField
                  control={form.control}
                  name="delivery_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter delivery address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Contact *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Customer phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Date</FormLabel>
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
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
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
                    name="delivery_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Time</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="delivery_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Special delivery instructions" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Package Information */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Package Details</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="package_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            placeholder="0.0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="package_length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="package_width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="package_height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="special_instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Fragile, handle with care, etc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="cash_to_collect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cash to Collect ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Fee ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Delivery'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}