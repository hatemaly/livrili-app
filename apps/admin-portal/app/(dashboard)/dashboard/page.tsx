'use client'

import { useAuthContext } from '@livrili/auth'
import { api } from '@livrili/api/src/client'
import { useState, useEffect } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { CACHE_CONFIG, invalidateCache } from '../../../lib/cache-config'
import { useQueryClient } from '@tanstack/react-query'
import { MetricCard } from '../../../components/dashboard/metric-card'
import { OrderTrendsChart } from '../../../components/dashboard/order-trends-chart'
import { GeographicChart } from '../../../components/dashboard/geographic-chart'
import { PerformanceMetrics } from '../../../components/dashboard/performance-metrics'
import { RealTimeWidget } from '../../../components/dashboard/real-time-widget'
import { TopPerformers } from '../../../components/dashboard/top-performers'
import { ErrorBoundary } from '../../../components/dashboard/error-boundary'

export default function DashboardPage() {
  usePageTitle('Dashboard - Livrili Admin Portal')
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [refreshInterval, setRefreshInterval] = useState<number>(30000) // 30 seconds
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Fetch dashboard metrics
  const { data: dashboardMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = 
    api.analytics.getDashboardMetrics.useQuery(undefined, {
      ...CACHE_CONFIG.dashboard,
      refetchInterval: refreshInterval || CACHE_CONFIG.dashboard.refetchInterval,
      refetchOnWindowFocus: true,
      enabled: true,
    })

  // Fetch order trends
  const { data: orderTrends, isLoading: trendsLoading, refetch: refetchTrends } = 
    api.analytics.getOrderTrends.useQuery({ period: 'daily', days: 30 }, {
      ...CACHE_CONFIG.analytics,
      refetchInterval: refreshInterval ? refreshInterval * 2 : CACHE_CONFIG.analytics.refetchInterval,
      enabled: true,
    })

  // Fetch geographic data
  const { data: geographicData, isLoading: geoLoading, refetch: refetchGeo } = 
    api.analytics.getGeographicMetrics.useQuery(undefined, {
      ...CACHE_CONFIG.analytics,
      refetchInterval: refreshInterval ? refreshInterval * 2 : CACHE_CONFIG.analytics.refetchInterval,
      enabled: true,
    })

  // Fetch performance metrics
  const { data: performanceData, isLoading: perfLoading, refetch: refetchPerf } = 
    api.analytics.getPerformanceMetrics.useQuery(undefined, {
      ...CACHE_CONFIG.performance,
      refetchInterval: refreshInterval ? refreshInterval * 2 : CACHE_CONFIG.performance.refetchInterval,
      enabled: true,
    })

  // Fetch retailer metrics
  const { data: retailerMetrics, isLoading: retailerLoading, refetch: refetchRetailers } = 
    api.analytics.getRetailerMetrics.useQuery({ limit: 10 }, {
      ...CACHE_CONFIG.performers,
      refetchInterval: refreshInterval ? refreshInterval * 3 : CACHE_CONFIG.performers.refetchInterval,
      enabled: true,
    })

  // Fetch product metrics
  const { data: productMetrics, isLoading: productLoading, refetch: refetchProducts } = 
    api.analytics.getProductMetrics.useQuery({ limit: 10 }, {
      ...CACHE_CONFIG.performers,
      refetchInterval: refreshInterval ? refreshInterval * 3 : CACHE_CONFIG.performers.refetchInterval,
      enabled: true,
    })

  // Real-time metrics subscription (simulated with interval for now)
  const [realTimeData, setRealTimeData] = useState<{
    activeOrders: number
    onlineUsers: number
    todayRevenue: number
    lastOrderTime: string | null
    timestamp: string
  } | null>(null)

  // Update real-time data
  useEffect(() => {
    const updateRealTimeData = () => {
      // In a real implementation, this would come from a WebSocket or Server-Sent Events
      setRealTimeData({
        activeOrders: dashboardMetrics?.activeOrders.value || 0,
        onlineUsers: dashboardMetrics?.activeUsers.value || 0,
        todayRevenue: dashboardMetrics?.gmv.value || 0,
        lastOrderTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        timestamp: new Date().toISOString()
      })
      setLastRefresh(new Date())
    }

    updateRealTimeData()
    const interval = setInterval(updateRealTimeData, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [dashboardMetrics])

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      // Invalidate cache first for fresh data
      invalidateCache.all(queryClient)
      
      // Then refetch all queries
      await Promise.all([
        refetchMetrics(),
        refetchTrends(),
        refetchGeo(),
        refetchPerf(),
        refetchRetailers(),
        refetchProducts()
      ])
      
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
    }
  }

  // Auto-refresh controls
  const refreshOptions = [
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 },
    { label: '5m', value: 300000 },
    { label: 'Off', value: 0 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {user?.fullName || user?.username}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Refresh Controls */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Auto-refresh:</label>
                <select 
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {refreshOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <div className="text-xs text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Real-time Widget */}
        <ErrorBoundary>
          <RealTimeWidget data={realTimeData} loading={metricsLoading} />
        </ErrorBoundary>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Orders"
            value={dashboardMetrics?.activeOrders.value || 0}
            change={dashboardMetrics?.activeOrders.trend}
            changeLabel="vs last period"
            loading={metricsLoading}
            color="blue"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
          <MetricCard
            title="Gross Merchandise Value"
            value={dashboardMetrics?.gmv.formatted || '0 DA'}
            change={dashboardMetrics?.gmv.trend}
            changeLabel="vs last period"
            loading={metricsLoading}
            color="green"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <MetricCard
            title="Active Users"
            value={`${dashboardMetrics?.activeUsers.value || 0}/${dashboardMetrics?.activeUsers.total || 0}`}
            change={dashboardMetrics?.activeUsers.percentage}
            changeLabel="active rate"
            loading={metricsLoading}
            color="purple"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <MetricCard
            title="Active Retailers"
            value={dashboardMetrics?.retailers.value || 0}
            loading={metricsLoading}
            color="yellow"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <OrderTrendsChart 
              data={orderTrends?.data || []} 
              period={orderTrends?.period || 'daily'}
              loading={trendsLoading}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <GeographicChart 
              cities={geographicData?.cities || []} 
              states={geographicData?.states || []}
              loading={geoLoading}
            />
          </ErrorBoundary>
        </div>

        {/* Performance Metrics */}
        <ErrorBoundary>
          {performanceData && (
            <PerformanceMetrics 
              summary={performanceData.summary}
              distribution={performanceData.distribution}
              dailyPerformance={performanceData.dailyPerformance}
              loading={perfLoading}
            />
          )}
        </ErrorBoundary>

        {/* Top Performers */}
        <ErrorBoundary>
          <TopPerformers 
            retailers={retailerMetrics?.topPerformers || []}
            products={productMetrics?.bestSellers || []}
            loading={retailerLoading || productLoading}
          />
        </ErrorBoundary>
      </div>
    </div>
  )
}