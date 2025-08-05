'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Plus, Search, MoreVertical, Truck, Star, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { CreateDriverDialog } from '@/components/drivers/create-driver-dialog'
import { EditDriverDialog } from '@/components/drivers/edit-driver-dialog'
import { DriverPerformanceDialog } from '@/components/drivers/driver-performance-dialog'
import { DriverStats } from '@/components/drivers/driver-stats'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface DriverDeliveriesDialogProps {
  driverId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DriverDeliveriesDialog({ driverId, open, onOpenChange }: DriverDeliveriesDialogProps) {
  // Fetch driver details
  const { data: driversData } = trpc.deliveries.getDrivers.useQuery({
    limit: 1000,
  })

  // Fetch driver deliveries
  const { data: deliveriesData } = trpc.deliveries.getDriverDeliveries.useQuery({
    driver_id: driverId,
    limit: 50,
  })

  const driver = driversData?.items.find(d => d.id === driverId)
  const deliveries = deliveriesData?.items || []

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
            Driver Deliveries - {driver?.users?.full_name || driver?.users?.username || driver?.phone}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {deliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No deliveries found for this driver.
            </p>
          ) : (
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{delivery.delivery_number}</span>
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status.replace('_', ' ').toUpperCase()}
                      </Badge>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DriversPage() {
  usePageTitle('Drivers - Livrili Admin Portal')
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [viewingPerformance, setViewingPerformance] = useState<string | null>(null)
  const [viewingDeliveries, setViewingDeliveries] = useState<string | null>(null)

  // Fetch drivers with filters
  const { data: driversData, isLoading, refetch } = trpc.deliveries.getDrivers.useQuery({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    vehicle_type: vehicleTypeFilter !== 'all' ? vehicleTypeFilter as any : undefined,
    limit: 50,
  })

  // Fetch driver statistics
  const { data: statsData } = trpc.deliveries.getDriverStats.useQuery()

  // Suspend driver mutation
  const suspendDriverMutation = trpc.deliveries.updateDriver.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Driver suspended successfully.',
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to suspend driver.',
        variant: 'destructive',
      })
    },
  })

  const drivers = driversData?.items || []

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

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
    // Return appropriate icon based on vehicle type
    return <Truck className="h-4 w-4" />
  }

  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  const handleViewDeliveries = (driverId: string) => {
    setViewingDeliveries(driverId)
  }

  const handleSuspendDriver = (driver: any) => {
    const confirmMessage = `Are you sure you want to suspend ${driver.users?.full_name || driver.users?.username || driver.phone}?`
    
    if (confirm(confirmMessage)) {
      suspendDriverMutation.mutate({
        id: driver.id,
        status: 'suspended'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Driver Management</h1>
          <p className="text-muted-foreground">
            Manage drivers, track performance, and monitor availability
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsData && <DriverStats stats={statsData} />}

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
                  placeholder="Search by name, phone, or vehicle plate..."
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Drivers</CardTitle>
          <CardDescription>
            {driversData?.total || 0} drivers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No drivers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || vehicleTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first driver to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && vehicleTypeFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Driver
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drivers.map((driver) => (
                <Card key={driver.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(driver.status)}>
                          {driver.status.toUpperCase()}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {formatRating(driver.rating)}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingDriver(driver.id)}
                          >
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setViewingPerformance(driver.id)}
                          >
                            View Performance
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewDeliveries(driver.id)}
                          >
                            View Deliveries
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleSuspendDriver(driver)}
                          >
                            Suspend Driver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-medium">
                        {driver.users?.full_name || driver.users?.username || 'Unnamed Driver'}
                      </h3>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{driver.phone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <div className="flex items-center space-x-1">
                          {getVehicleTypeIcon(driver.vehicle_type)}
                          <span className="font-medium">
                            {driver.vehicle_type.charAt(0).toUpperCase() + driver.vehicle_type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Plate:</span>
                        <span className="font-medium">{driver.vehicle_plate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deliveries:</span>
                        <span className="font-medium">
                          {driver.successful_deliveries}/{driver.total_deliveries}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{driver.max_capacity_kg}kg</span>
                      </div>
                    </div>

                    {driver.zone_coverage && driver.zone_coverage.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" />
                          <span>Coverage Zones:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {driver.zone_coverage.slice(0, 3).map((zone, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {zone}
                            </Badge>
                          ))}
                          {driver.zone_coverage.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{driver.zone_coverage.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {driver.current_location && (
                      <div className="text-xs text-muted-foreground">
                        Last location: {driver.current_location.address || 'Unknown'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateDriverDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          refetch()
        }}
      />

      {editingDriver && (
        <EditDriverDialog
          driverId={editingDriver}
          open={!!editingDriver}
          onOpenChange={(open) => !open && setEditingDriver(null)}
          onSuccess={() => {
            setEditingDriver(null)
            refetch()
          }}
        />
      )}

      {viewingPerformance && (
        <DriverPerformanceDialog
          driverId={viewingPerformance}
          open={!!viewingPerformance}
          onOpenChange={(open) => !open && setViewingPerformance(null)}
        />
      )}

      {viewingDeliveries && (
        <DriverDeliveriesDialog
          driverId={viewingDeliveries}
          open={!!viewingDeliveries}
          onOpenChange={(open) => !open && setViewingDeliveries(null)}
        />
      )}
    </div>
  )
}