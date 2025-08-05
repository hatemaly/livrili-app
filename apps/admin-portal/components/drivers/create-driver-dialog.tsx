'use client'

import { useState } from 'react'
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

const createDriverSchema = z.object({
  user_id: z.string().uuid().optional(),
  driver_license: z.string().min(1, 'Driver license is required'),
  license_expiry: z.date({
    required_error: 'License expiry date is required',
  }),
  vehicle_type: z.enum(['motorcycle', 'car', 'van', 'truck'], {
    required_error: 'Please select a vehicle type',
  }),
  vehicle_model: z.string().optional(),
  vehicle_plate: z.string().min(1, 'Vehicle plate is required'),
  vehicle_year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  phone: z.string().min(1, 'Phone number is required'),
  emergency_contact: z.string().optional(),
  zone_coverage: z.array(z.string()).default([]),
  max_capacity_kg: z.number().positive().default(50),
  max_orders_per_trip: z.number().int().positive().default(5),
})

type CreateDriverFormData = z.infer<typeof createDriverSchema>

interface CreateDriverDialogProps {
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

export function CreateDriverDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDriverDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateDriverFormData>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      max_capacity_kg: 50,
      max_orders_per_trip: 5,
      zone_coverage: [],
    },
  })

  // Fetch users with driver role for dropdown
  const { data: usersData } = trpc.users.getAll.useQuery({
    role: 'driver',
    limit: 100,
  })

  const createDriverMutation = trpc.deliveries.createDriver.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Driver has been created successfully.',
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

  const onSubmit = (data: CreateDriverFormData) => {
    setIsSubmitting(true)

    const driverData = {
      ...data,
      license_expiry: format(data.license_expiry, 'yyyy-MM-dd'),
    }

    createDriverMutation.mutate(driverData)
  }

  const users = usersData?.items || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>
            Create a driver profile with vehicle and contact information.
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
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to User Account</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name || user.username} ({user.phone || user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Link this driver to an existing user account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
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
                        <FormLabel>Driver License Number *</FormLabel>
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
                        <FormLabel>License Expiry Date *</FormLabel>
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
                      <FormLabel>Vehicle Type *</FormLabel>
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
                      <FormLabel>Vehicle Plate Number *</FormLabel>
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 50)}
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
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
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
                                            ? field.onChange([...field.value, zone])
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
                {isSubmitting ? 'Creating...' : 'Create Driver'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}