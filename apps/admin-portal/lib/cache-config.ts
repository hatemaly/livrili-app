// Cache configuration for dashboard analytics
export const CACHE_CONFIG = {
  // Real-time metrics - very short cache
  realtime: {
    staleTime: 1000 * 10, // 10 seconds
    cacheTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // 30 seconds
  },
  
  // Dashboard metrics - short cache
  dashboard: {
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // 1 minute
  },
  
  // Trends and analytics - medium cache
  analytics: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  },
  
  // Performance data - longer cache
  performance: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  },
  
  // Top performers - longest cache
  performers: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 15, // 15 minutes
  },
} as const

// Query keys for cache invalidation
export const QUERY_KEYS = {
  dashboardMetrics: ['analytics', 'dashboard-metrics'] as const,
  orderTrends: ['analytics', 'order-trends'] as const,
  geographicMetrics: ['analytics', 'geographic-metrics'] as const,
  performanceMetrics: ['analytics', 'performance-metrics'] as const,
  retailerMetrics: ['analytics', 'retailer-metrics'] as const,
  productMetrics: ['analytics', 'product-metrics'] as const,
  realtimeMetrics: ['analytics', 'realtime-metrics'] as const,
} as const

// Cache invalidation strategies
export const invalidateCache = {
  // Invalidate all analytics data
  all: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
  },
  
  // Invalidate specific metrics
  dashboard: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardMetrics })
  },
  
  trends: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orderTrends })
  },
  
  // Invalidate on new orders
  onNewOrder: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardMetrics })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orderTrends })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performanceMetrics })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.realtimeMetrics })
  },
  
  // Invalidate on retailer changes
  onRetailerChange: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retailerMetrics })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.geographicMetrics })
  },
  
  // Invalidate on product changes
  onProductChange: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productMetrics })
  },
}