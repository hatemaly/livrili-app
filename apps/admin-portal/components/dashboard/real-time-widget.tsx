'use client'

import { useState, useEffect } from 'react'

interface RealTimeWidgetProps {
  data: {
    activeOrders: number
    onlineUsers: number
    todayRevenue: number
    lastOrderTime: string | null
    timestamp: string
  } | null
  loading?: boolean
}

export function RealTimeWidget({ data, loading = false }: RealTimeWidgetProps) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date(data.timestamp))
    }
  }, [data])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow text-white">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-white bg-opacity-20 rounded"></div>
            <div className="h-16 bg-white bg-opacity-20 rounded"></div>
            <div className="h-16 bg-white bg-opacity-20 rounded"></div>
            <div className="h-16 bg-white bg-opacity-20 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const formatLastOrderTime = (timestamp: string | null) => {
    if (!timestamp) return 'No recent orders'
    
    const now = new Date()
    const orderTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getConnectionStatus = () => {
    if (!data) return { status: 'disconnected', color: 'bg-red-500' }
    
    const now = new Date()
    const dataTime = new Date(data.timestamp)
    const diffInSeconds = (now.getTime() - dataTime.getTime()) / 1000
    
    if (diffInSeconds < 30) return { status: 'live', color: 'bg-green-500' }
    if (diffInSeconds < 120) return { status: 'delayed', color: 'bg-yellow-500' }
    return { status: 'stale', color: 'bg-red-500' }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Real-Time Metrics</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connectionStatus.color} animate-pulse`}></div>
          <span className="text-sm text-white text-opacity-90 capitalize">
            {connectionStatus.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-2xl font-bold">{data?.activeOrders || 0}</div>
              <div className="text-sm text-white text-opacity-80">Active Orders</div>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <div>
              <div className="text-2xl font-bold">{data?.onlineUsers || 0}</div>
              <div className="text-sm text-white text-opacity-80">Online Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-2xl font-bold">
                {data?.todayRevenue ? 
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'DZD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(data.todayRevenue).replace('DZD', 'DA') : 
                  '0 DA'
                }
              </div>
              <div className="text-sm text-white text-opacity-80">Today's Revenue</div>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-lg font-bold">
                {formatLastOrderTime(data?.lastOrderTime || null)}
              </div>
              <div className="text-sm text-white text-opacity-80">Last Order</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-white text-opacity-70 text-center">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  )
}