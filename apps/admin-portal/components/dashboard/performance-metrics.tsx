'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface PerformanceMetricsProps {
  summary: {
    totalOrders: number
    deliveredOrders: number
    cancelledOrders: number
    pendingOrders: number
    deliverySuccessRate: number
    cancellationRate: number
    fulfillmentRate: number
    averageDeliveryTime: number
    averageOrderValue: number
    medianOrderValue: number
  }
  distribution: {
    pending: number
    confirmed: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  dailyPerformance: Array<{
    date: string
    total: number
    delivered: number
    cancelled: number
    successRate: number
  }>
  loading?: boolean
}

export function PerformanceMetrics({ summary, distribution, dailyPerformance, loading = false }: PerformanceMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statusData = Object.entries(distribution).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: summary.totalOrders > 0 ? (count / summary.totalOrders) * 100 : 0
  }))

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: '#F59E0B',
      Confirmed: '#3B82F6',
      Processing: '#8B5CF6',
      Shipped: '#06B6D4',
      Delivered: '#10B981',
      Cancelled: '#EF4444'
    }
    return colors[status] || '#6B7280'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'Success Rate' && '%'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Key Performance Indicators */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {summary.deliverySuccessRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Delivery Success Rate</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {summary.fulfillmentRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Fulfillment Rate</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {summary.averageDeliveryTime.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg. Delivery Days</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {summary.cancellationRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Cancellation Rate</div>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
        <div className="space-y-3">
          {statusData.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.status}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-900">{item.count}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: getStatusColor(item.status)
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Performance Trend */}
      <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Performance Trend (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyPerformance}>
              <defs>
                <linearGradient id="successRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                className="text-xs"
              />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke="#10B981"
                fill="url(#successRate)"
                strokeWidth={2}
                name="Success Rate"
              />
              
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="total" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
                name="Total Orders"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="delivered" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                name="Delivered"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="cancelled" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={false}
                name="Cancelled"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Total Orders</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-600">Delivered</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-gray-600">Cancelled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
            <span className="text-gray-600">Success Rate</span>
          </div>
        </div>
      </div>

      {/* Order Value Analysis */}
      <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Value Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'DZD',
                minimumFractionDigits: 0,
              }).format(summary.averageOrderValue)}
            </div>
            <div className="text-sm text-gray-600">Average Order Value</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'DZD',
                minimumFractionDigits: 0,
              }).format(summary.medianOrderValue)}
            </div>
            <div className="text-sm text-gray-600">Median Order Value</div>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">
              {summary.totalOrders.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </div>
      </div>
    </div>
  )
}