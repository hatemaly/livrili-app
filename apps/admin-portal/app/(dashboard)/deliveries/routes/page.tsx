'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../../hooks/use-page-title'
import { Search, Route, MapPin, Clock, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc'
import { RouteDetailsDialog } from '@/components/deliveries/route-details-dialog'
import { useToast } from '@/hooks/use-toast'

export default function DeliveryRoutesPage() {
  usePageTitle('Delivery Routes - Livrili Admin Portal')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [driverFilter, setDriverFilter] = useState<string>('all')
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const { toast } = useToast()

  // Fetch delivery routes
  const { data: routesData, isLoading, refetch } = trpc.deliveries.getDeliveryRoutes.useQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    driver_id: driverFilter !== 'all' ? driverFilter : undefined,
    limit: 50,
  })

  // Optimize routes mutation
  const optimizeRoutesMutation = trpc.deliveries.optimizeRoutes.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Routes have been optimized successfully.',
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to optimize routes. Please try again.',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setIsOptimizing(false)
    },
  })

  // Start route mutation
  const startRouteMutation = trpc.deliveries.startRoute.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Route has been started successfully.',
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start route. Please try again.',
        variant: 'destructive',
      })
    },
  })

  // Fetch drivers for filter
  const { data: driversData } = trpc.deliveries.getDrivers.useQuery({
    limit: 100,
  })

  const routes = routesData?.items || []
  const drivers = driversData?.items || []

  const handleOptimizeRoutes = () => {
    setIsOptimizing(true)
    optimizeRoutesMutation.mutate({
      date: new Date().toISOString().split('T')[0], // Today's date
      driver_id: driverFilter !== 'all' ? driverFilter : undefined,
    })
  }

  const handleStartRoute = (routeId: string) => {
    startRouteMutation.mutate({ route_id: routeId })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Routes</h1>
          <p className="text-muted-foreground">
            View and manage optimized delivery routes for drivers
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleOptimizeRoutes}
            disabled={isOptimizing}
          >
            <Route className="mr-2 h-4 w-4" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Routes'}
          </Button>
        </div>
      </div>

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
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={driverFilter} onValueChange={setDriverFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.users?.full_name || driver.users?.username || driver.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Routes List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Routes</CardTitle>
          <CardDescription>
            {routesData?.total || 0} routes found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : routes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Route className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No routes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || driverFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first optimized route'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <Card key={route.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">
                          {route.route_name || `Route ${route.route_date}`}
                        </h3>
                        <Badge className={getStatusColor(route.status)}>
                          {route.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(route.route_date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {route.drivers?.users?.full_name || 
                         route.drivers?.users?.username || 
                         route.drivers?.phone || 'Unassigned'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Deliveries:</span>
                        <div className="font-medium">
                          {route.completed_deliveries}/{route.total_deliveries}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Distance:</span>
                        <div className="font-medium">
                          {route.total_distance ? `${route.total_distance.toFixed(1)}km` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estimated:</span>
                        <div className="font-medium">
                          {formatDuration(route.estimated_duration)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actual:</span>
                        <div className="font-medium">
                          {formatDuration(route.actual_duration)}
                        </div>
                      </div>
                    </div>

                    {route.start_time && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Started: {new Date(route.start_time).toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    {route.end_time && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Completed: {new Date(route.end_time).toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedRouteId(route.id)}
                      >
                        View Route
                      </Button>
                      {route.status === 'planned' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleStartRoute(route.id)}
                          disabled={startRouteMutation.isLoading}
                        >
                          {startRouteMutation.isLoading ? 'Starting...' : 'Start Route'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Details Dialog */}
      {selectedRouteId && (
        <RouteDetailsDialog
          routeId={selectedRouteId}
          open={!!selectedRouteId}
          onOpenChange={(open) => !open && setSelectedRouteId(null)}
          onRouteUpdated={() => {
            setSelectedRouteId(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}