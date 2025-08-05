'use client'

import { Truck, Users, TrendingUp, Star, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DriverStatsProps {
  stats: {
    totalDrivers: number
    availableDrivers: number
    busyDrivers: number
    offlineDrivers: number
    averageRating: number
    totalDeliveries: number
    completedDeliveries: number
    averageDeliveryTime: number
    topPerformers: {
      driver_id: string
      rating: number
      total_deliveries: number
    }[]
  }
}

export function DriverStats({ stats }: DriverStatsProps) {
  const formatRating = (value: number) => {
    return value.toFixed(1)
  }

  const getAvailabilityPercentage = () => {
    if (stats.totalDrivers === 0) return 0
    return (stats.availableDrivers / stats.totalDrivers) * 100
  }

  const getCompletionRate = () => {
    if (stats.totalDeliveries === 0) return 0
    return (stats.completedDeliveries / stats.totalDeliveries) * 100
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Drivers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDrivers}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>{stats.availableDrivers} available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span>{stats.busyDrivers} busy</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Availability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Availability Rate</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getAvailabilityPercentage().toFixed(1)}%</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>{stats.offlineDrivers} offline</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center space-x-1">
            <span>{formatRating(stats.averageRating)}</span>
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          </div>
          <p className="text-xs text-muted-foreground">
            Based on customer feedback
          </p>
        </CardContent>
      </Card>

      {/* Delivery Completion */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getCompletionRate().toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.completedDeliveries} of {stats.totalDeliveries} deliveries
          </p>
        </CardContent>
      </Card>

      {/* Driver Status Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Driver Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Available</span>
              </div>
              <span className="font-medium">{stats.availableDrivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Busy</span>
              </div>
              <span className="font-medium">{stats.busyDrivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm">Offline</span>
              </div>
              <span className="font-medium">{stats.offlineDrivers}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topPerformers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No performance data available</p>
          ) : (
            <div className="space-y-3">
              {stats.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={performer.driver_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{formatRating(performer.rating)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {performer.total_deliveries} deliveries
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Total Deliveries</span>
              <div className="text-lg font-bold">{stats.totalDeliveries.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Completed</span>
              <div className="text-lg font-bold text-green-600">{stats.completedDeliveries.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Success Rate</span>
              <div className="text-lg font-bold">{getCompletionRate().toFixed(1)}%</div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Avg Rating</span>
              <div className="text-lg font-bold flex items-center space-x-1">
                <span>{formatRating(stats.averageRating)}</span>
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}