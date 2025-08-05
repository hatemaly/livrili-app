'use client'

import { Package, Truck, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeliveryStatsProps {
  stats: {
    totalDeliveries: number
    completedDeliveries: number
    pendingDeliveries: number
    averageDeliveryTime: number
    onTimeDeliveryRate: number
    statusBreakdown: {
      pending: number
      assigned: number
      picked_up: number
      in_transit: number
      delivered: number
      failed: number
      cancelled: number
    }
    deliveryTrend: number
    recentDeliveriesCount: number
  }
}

export function DeliveryStats({ stats }: DeliveryStatsProps) {
  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%'
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}m`
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
    return <div className="h-4 w-4" />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Deliveries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDeliveries.toLocaleString()}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {getTrendIcon(stats.deliveryTrend)}
            <span className={getTrendColor(stats.deliveryTrend)}>
              {stats.deliveryTrend > 0 ? '+' : ''}{formatPercentage(stats.deliveryTrend)}
            </span>
            <span>from last week</span>
          </div>
        </CardContent>
      </Card>

      {/* Completed Deliveries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedDeliveries.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalDeliveries > 0 
              ? formatPercentage((stats.completedDeliveries / stats.totalDeliveries) * 100)
              : '0%'
            } completion rate
          </p>
        </CardContent>
      </Card>

      {/* Pending Deliveries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingDeliveries.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting assignment or pickup
          </p>
        </CardContent>
      </Card>

      {/* On-Time Delivery Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(stats.onTimeDeliveryRate)}</div>
          <p className="text-xs text-muted-foreground">
            Average delivery time: {formatTime(Math.abs(stats.averageDeliveryTime))}
          </p>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending:</span>
              <span className="font-medium">{stats.statusBreakdown.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned:</span>
              <span className="font-medium">{stats.statusBreakdown.assigned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Picked Up:</span>
              <span className="font-medium">{stats.statusBreakdown.picked_up}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">In Transit:</span>
              <span className="font-medium">{stats.statusBreakdown.in_transit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivered:</span>
              <span className="font-medium text-green-600">{stats.statusBreakdown.delivered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Failed:</span>
              <span className="font-medium text-red-600">{stats.statusBreakdown.failed}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deliveries this week:</span>
              <span className="font-medium">{stats.recentDeliveriesCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cancelled deliveries:</span>
              <span className="font-medium">{stats.statusBreakdown.cancelled}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active deliveries:</span>
              <span className="font-medium">
                {stats.statusBreakdown.assigned + 
                 stats.statusBreakdown.picked_up + 
                 stats.statusBreakdown.in_transit}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}