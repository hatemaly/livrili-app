'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CalendarIcon, User, Truck, Phone, MapPin, FileText, Package } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'

const updateDriverSchema = z.object({
  driver_license: z.string().min(1, 'Driver license is required').optional(),
  license_expiry: z.date().optional(),
  vehicle_type: z.enum(['motorcycle', 'car', 'van', 'truck']).optional(),
  vehicle_model: z.string().optional(),
  vehicle_plate: z.string().min(1, 'Vehicle plate is required').optional(),
  vehicle_year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  emergency_contact: z.string().optional(),
  zone_coverage: z.array(z.string()).optional(),
  max_capacity_kg: z.number().positive().optional(),
  max_orders_per_trip: z.number().int().positive().optional(),
  status: z.enum(['available', 'busy', 'offline', 'suspended']).optional(),
})

type UpdateDriverFormData = z.infer<typeof updateDriverSchema>

interface EditDriverDialogProps {
  driverId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const availableZones = [
  'Central',
  'North',
  'South',
  'East',
  'West',
  'Downtown',
  'Suburbs',
  'Industrial',
  'Commercial',
  'Residential'
]

export function EditDriverDialog({
  driverId,
  open,
  onOpenChange,
  onSuccess,
}: EditDriverDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateDriverFormData>({
    resolver: zodResolver(updateDriverSchema),
  })

  // Fetch driver details
  const { data: driversData } = trpc.deliveries.getDrivers.useQuery({
    limit: 1000,
  })

  const driver = driversData?.items.find(d => d.id === driverId)

  // Update form when driver data loads
  useEffect(() => {
    if (driver) {
      form.reset({
        driver_license: driver.driver_license,
        license_expiry: driver.license_expiry ? new Date(driver.license_expiry) : undefined,
        vehicle_type: driver.vehicle_type,
        vehicle_model: driver.vehicle_model || '',
        vehicle_plate: driver.vehicle_plate,
        vehicle_year: driver.vehicle_year || undefined,
        phone: driver.phone,
        emergency_contact: driver.emergency_contact || '',
        zone_coverage: driver.zone_coverage || [],
        max_capacity_kg: driver.max_capacity_kg,
        max_orders_per_trip: driver.max_orders_per_trip,
        status: driver.status,
      })
    }
  }, [driver, form])

  const updateDriverMutation = trpc.deliveries.updateDriver.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Driver has been updated successfully.',
      })
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

  const onSubmit = (data: UpdateDriverFormData) => {
    setIsSubmitting(true)

    const driverData = {
      ...data,
      license_expiry: data.license_expiry ? format(data.license_expiry, 'yyyy-MM-dd') : undefined,
    }

    updateDriverMutation.mutate({
      id: driverId,
      data: driverData,
    })
  }

  if (!driver) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription>
            Update driver information and settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Personal Information</span>
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergency_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Emergency contact phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* License Information */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>License Information</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="driver_license"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver License Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="License number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="license_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date</FormLabel>
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
                </div>
              </div>

              {/* Right Column - Vehicle Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Vehicle Information</span>
                </div>

                <FormField
                  control={form.control}
                  name="vehicle_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle_plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Plate Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC-1234" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="vehicle_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Toyota Camry" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="1990"
                            max={new Date().getFullYear() + 1}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            placeholder="2020"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Capacity Information */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Capacity Settings</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="max_capacity_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Capacity (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            step="0.1"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            placeholder="50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_orders_per_trip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Orders per Trip</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="1"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            placeholder="5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Zone Coverage */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Coverage Zones</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="zone_coverage"
                    render={() => (
                      <FormItem>
                        <FormLabel>Select Coverage Zones</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {availableZones.map((zone) => (
                            <FormField
                              key={zone}
                              control={form.control}
                              name="zone_coverage"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={zone}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(zone)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), zone])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== zone
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {zone}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormDescription>
                          Select the zones this driver can cover
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Driver'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}