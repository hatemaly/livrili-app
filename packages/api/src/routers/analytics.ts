import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'

// Analytics input schemas
const dateRangeSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

const geographicFiltersSchema = z.object({
  ...dateRangeSchema.shape,
  city: z.string().optional(),
  state: z.string().optional(),
})

const performanceFiltersSchema = z.object({
  ...dateRangeSchema.shape,
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
})

const retailerMetricsSchema = z.object({
  ...dateRangeSchema.shape,
  limit: z.number().int().positive().max(100).default(10),
  retailer_id: z.string().uuid().optional(),
})

const productMetricsSchema = z.object({
  ...dateRangeSchema.shape,
  limit: z.number().int().positive().max(100).default(10),
  category_id: z.string().uuid().optional(),
})

const trendsSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  days: z.number().int().positive().max(365).default(30),
})

// Helper function to get date range
const getDateRange = (date_from?: string, date_to?: string) => {
  const now = new Date()
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  
  return {
    from: date_from ? new Date(date_from) : defaultFrom,
    to: date_to ? new Date(date_to) : now,
  }
}

// Helper function to calculate percentage change
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export const analyticsRouter = router({
  // Real-time dashboard metrics
  getDashboardMetrics: adminProcedure
    .input(dateRangeSchema.optional())
    .query(async ({ ctx, input }) => {
      const { from, to } = getDateRange(input?.date_from, input?.date_to)
      
      // Get previous period for comparison
      const periodLength = to.getTime() - from.getTime()
      const previousFrom = new Date(from.getTime() - periodLength)
      const previousTo = from

      try {
        // Current period metrics
        const [ordersResult, retailersResult, usersResult, revenueResult] = await Promise.all([
          // Active orders count
          ctx.supabase
            .from('orders')
            .select('id, status', { count: 'exact' })
            .gte('created_at', from.toISOString())
            .lte('created_at', to.toISOString())
            .in('status', ['pending', 'confirmed', 'processing', 'shipped']),

          // Active retailers count  
          ctx.supabase
            .from('retailers')
            .select('id', { count: 'exact' })
            .eq('status', 'active'),

          // Total user profiles count
          ctx.supabase
            .from('user_profiles')
            .select('id', { count: 'exact' })
            .eq('is_active', true),

          // GMV (Gross Merchandise Value)
          ctx.supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', from.toISOString())
            .lte('created_at', to.toISOString())
            .in('status', ['delivered', 'processing', 'shipped'])
        ])

        // Previous period metrics for comparison
        const [prevOrdersResult, prevRevenueResult] = await Promise.all([
          ctx.supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .gte('created_at', previousFrom.toISOString())
            .lte('created_at', previousTo.toISOString())
            .in('status', ['pending', 'confirmed', 'processing', 'shipped']),

          ctx.supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', previousFrom.toISOString())
            .lte('created_at', previousTo.toISOString())
            .in('status', ['delivered', 'processing', 'shipped'])
        ])

        // Calculate current metrics
        const activeOrders = ordersResult.count || 0
        const activeRetailers = retailersResult.count || 0
        const totalUsers = usersResult.count || 0
        
        // Calculate GMV
        const currentGMV = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        const previousGMV = prevRevenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        
        // Calculate active users (logged in within last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const activeUsers = usersResult.data?.filter(user => 
          user.last_login_at && new Date(user.last_login_at) >= sevenDaysAgo
        ).length || 0

        // Calculate trends
        const previousActiveOrders = prevOrdersResult.count || 0
        const ordersTrend = calculatePercentageChange(activeOrders, previousActiveOrders)
        const gmvTrend = calculatePercentageChange(currentGMV, previousGMV)

        return {
          activeOrders: {
            value: activeOrders,
            trend: ordersTrend,
            label: 'Active Orders'
          },
          gmv: {
            value: currentGMV,
            trend: gmvTrend,
            label: 'Gross Merchandise Value',
            formatted: new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'DZD' 
            }).format(currentGMV)
          },
          activeUsers: {
            value: activeUsers,
            total: totalUsers,
            label: 'Active Users (7 days)',
            percentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
          },
          retailers: {
            value: activeRetailers,
            label: 'Active Retailers'
          },
          lastUpdated: new Date().toISOString()
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard metrics',
          cause: error,
        })
      }
    }),

  // Order trends analysis
  getOrderTrends: adminProcedure
    .input(trendsSchema.optional())
    .query(async ({ ctx, input }) => {
      const { period = 'daily', days = 30 } = input || {}
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      try {
        const { data: orders, error } = await ctx.supabase
          .from('orders')
          .select('created_at, total_amount, status')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true })

        if (error) throw error

        // Group orders by period
        const trendData: Record<string, {
          date: string
          orders: number
          revenue: number
          delivered: number
          cancelled: number
        }> = {}

        orders?.forEach(order => {
          const orderDate = new Date(order.created_at)
          let key: string

          switch (period) {
            case 'weekly':
              // Get start of week (Monday)
              const weekStart = new Date(orderDate)
              weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
              key = weekStart.toISOString().split('T')[0]
              break
            case 'monthly':
              key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
              break
            default: // daily
              key = orderDate.toISOString().split('T')[0]
          }

          if (!trendData[key]) {
            trendData[key] = {
              date: key,
              orders: 0,
              revenue: 0,
              delivered: 0,
              cancelled: 0
            }
          }

          trendData[key].orders += 1
          trendData[key].revenue += order.total_amount || 0
          
          if (order.status === 'delivered') {
            trendData[key].delivered += 1
          } else if (order.status === 'cancelled') {
            trendData[key].cancelled += 1
          }
        })

        const trends = Object.values(trendData).sort((a, b) => a.date.localeCompare(b.date))

        return {
          period,
          data: trends,
          summary: {
            totalOrders: orders?.length || 0,
            totalRevenue: orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
            averageOrderValue: orders && orders.length > 0 
              ? (orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length)
              : 0,
            deliveryRate: orders && orders.length > 0
              ? (orders.filter(o => o.status === 'delivered').length / orders.length) * 100
              : 0,
            cancellationRate: orders && orders.length > 0
              ? (orders.filter(o => o.status === 'cancelled').length / orders.length) * 100
              : 0
          }
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch order trends',
          cause: error,
        })
      }
    }),

  // Geographic metrics (orders by location)
  getGeographicMetrics: adminProcedure
    .input(geographicFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      const { from, to } = getDateRange(input?.date_from, input?.date_to)

      try {
        const { data: orders, error } = await ctx.supabase
          .from('orders')
          .select(`
            total_amount,
            status,
            retailers(city, state, address)
          `)
          .gte('created_at', from.toISOString())
          .lte('created_at', to.toISOString())

        if (error) throw error

        // Group by city and state
        const cityMetrics: Record<string, {
          city: string
          state: string
          orders: number
          revenue: number
          delivered: number
        }> = {}

        const stateMetrics: Record<string, {
          state: string
          orders: number
          revenue: number
          delivered: number
        }> = {}

        orders?.forEach(order => {
          const retailer = order.retailers
          if (!retailer) return

          const city = retailer.city || 'Unknown'
          const state = retailer.state || 'Unknown'
          const cityKey = `${city}-${state}`

          // City metrics
          if (!cityMetrics[cityKey]) {
            cityMetrics[cityKey] = {
              city,
              state,
              orders: 0,
              revenue: 0,
              delivered: 0
            }
          }

          cityMetrics[cityKey].orders += 1
          cityMetrics[cityKey].revenue += order.total_amount || 0
          if (order.status === 'delivered') {
            cityMetrics[cityKey].delivered += 1
          }

          // State metrics
          if (!stateMetrics[state]) {
            stateMetrics[state] = {
              state,
              orders: 0,
              revenue: 0,
              delivered: 0
            }
          }

          stateMetrics[state].orders += 1
          stateMetrics[state].revenue += order.total_amount || 0
          if (order.status === 'delivered') {
            stateMetrics[state].delivered += 1
          }
        })

        // Sort by revenue
        const topCities = Object.values(cityMetrics)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 20)

        const topStates = Object.values(stateMetrics)
          .sort((a, b) => b.revenue - a.revenue)

        return {
          cities: topCities,
          states: topStates,
          summary: {
            totalCities: Object.keys(cityMetrics).length,
            totalStates: Object.keys(stateMetrics).length,
            topRevenueCity: topCities[0] || null,
            topRevenueState: topStates[0] || null
          }
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch geographic metrics',
          cause: error,
        })
      }
    }),

  // Performance metrics (delivery success rates, timing)
  getPerformanceMetrics: adminProcedure
    .input(performanceFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      const { from, to } = getDateRange(input?.date_from, input?.date_to)

      try {
        const { data: orders, error } = await ctx.supabase
          .from('orders')
          .select('id, status, created_at, delivery_date, total_amount')
          .gte('created_at', from.toISOString())
          .lte('created_at', to.toISOString())

        if (error) throw error

        // Calculate delivery metrics
        const totalOrders = orders?.length || 0
        const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0
        const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0
        const pendingOrders = orders?.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length || 0
        const shippedOrders = orders?.filter(o => o.status === 'shipped').length || 0

        // Calculate success rates
        const deliverySuccessRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0
        const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0
        const fulfillmentRate = totalOrders > 0 ? ((deliveredOrders + shippedOrders) / totalOrders) * 100 : 0

        // Calculate average delivery time for delivered orders
        const deliveredOrdersWithDates = orders?.filter(o => 
          o.status === 'delivered' && o.delivery_date
        ) || []

        let averageDeliveryTime = 0
        if (deliveredOrdersWithDates.length > 0) {
          const totalDeliveryTime = deliveredOrdersWithDates.reduce((sum, order) => {
            const orderDate = new Date(order.created_at)
            const deliveryDate = new Date(order.delivery_date!)
            return sum + (deliveryDate.getTime() - orderDate.getTime())
          }, 0)
          
          averageDeliveryTime = totalDeliveryTime / deliveredOrdersWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
        }

        // Calculate order value distribution
        const orderValues = orders?.map(o => o.total_amount || 0) || []
        orderValues.sort((a, b) => a - b)
        
        const averageOrderValue = orderValues.length > 0 
          ? orderValues.reduce((sum, val) => sum + val, 0) / orderValues.length 
          : 0

        const medianOrderValue = orderValues.length > 0
          ? orderValues[Math.floor(orderValues.length / 2)]
          : 0

        // Order status distribution over time
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          return date.toISOString().split('T')[0]
        })

        const dailyPerformance = last30Days.map(date => {
          const dayOrders = orders?.filter(o => 
            o.created_at.startsWith(date)
          ) || []

          return {
            date,
            total: dayOrders.length,
            delivered: dayOrders.filter(o => o.status === 'delivered').length,
            cancelled: dayOrders.filter(o => o.status === 'cancelled').length,
            successRate: dayOrders.length > 0 
              ? (dayOrders.filter(o => o.status === 'delivered').length / dayOrders.length) * 100 
              : 0
          }
        })

        return {
          summary: {
            totalOrders,
            deliveredOrders,
            cancelledOrders,
            pendingOrders,
            deliverySuccessRate,
            cancellationRate,
            fulfillmentRate,
            averageDeliveryTime,
            averageOrderValue,
            medianOrderValue
          },
          distribution: {
            pending: pendingOrders,
            confirmed: orders?.filter(o => o.status === 'confirmed').length || 0,
            processing: orders?.filter(o => o.status === 'processing').length || 0,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders
          },
          dailyPerformance,
          lastUpdated: new Date().toISOString()
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch performance metrics',
          cause: error,
        })
      }
    }),

  // Real-time metrics subscription (for live updates)
  getRealtimeMetrics: adminProcedure
    .subscription(() => {
      return observable<{
        activeOrders: number
        onlineUsers: number
        todayRevenue: number
        lastOrderTime: string | null
        timestamp: string
      }>((emit) => {
        // Real-time metrics update function
        const updateMetrics = async () => {
          try {
            const now = new Date()
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            // These would ideally come from a real-time database or cache
            // For now, we'll simulate real-time data
            emit.next({
              activeOrders: Math.floor(Math.random() * 50) + 10,
              onlineUsers: Math.floor(Math.random() * 20) + 5,
              todayRevenue: Math.floor(Math.random() * 50000) + 10000,
              lastOrderTime: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
              timestamp: now.toISOString()
            })
          } catch (error) {
            emit.error(error)
          }
        }

        // Update every 10 seconds
        const interval = setInterval(updateMetrics, 10000)
        
        // Send initial data
        updateMetrics()

        // Cleanup
        return () => {
          clearInterval(interval)
        }
      })
    }),

  // Top performing retailers
  getRetailerMetrics: adminProcedure
    .input(retailerMetricsSchema.optional())
    .query(async ({ ctx, input }) => {
      const { from, to } = getDateRange(input?.date_from, input?.date_to)
      const { limit = 10, retailer_id } = input || {}

      try {
        let query = ctx.supabase
          .from('orders')
          .select(`
            retailer_id,
            total_amount,
            status,
            created_at,
            retailers(
              id, business_name, phone, email, 
              city, state, current_balance, credit_limit
            )
          `)
          .gte('created_at', from.toISOString())
          .lte('created_at', to.toISOString())

        if (retailer_id) {
          query = query.eq('retailer_id', retailer_id)
        }

        const { data: orders, error } = await query

        if (error) throw error

        // Group by retailer
        const retailerMetrics: Record<string, {
          retailer: any
          orders: number
          revenue: number
          delivered: number
          cancelled: number
          averageOrderValue: number
          lastOrderDate: string
          creditUtilization: number
        }> = {}

        orders?.forEach(order => {
          const retailerId = order.retailer_id
          const retailer = order.retailers

          if (!retailer) return

          if (!retailerMetrics[retailerId]) {
            const creditLimit = retailer.credit_limit || 0
            const currentBalance = retailer.current_balance || 0
            const creditUsed = creditLimit - currentBalance

            retailerMetrics[retailerId] = {
              retailer,
              orders: 0,
              revenue: 0,
              delivered: 0,
              cancelled: 0,
              averageOrderValue: 0,
              lastOrderDate: order.created_at,
              creditUtilization: creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0
            }
          }

          const metrics = retailerMetrics[retailerId]
          metrics.orders += 1
          metrics.revenue += order.total_amount || 0
          
          if (order.status === 'delivered') {
            metrics.delivered += 1
          } else if (order.status === 'cancelled') {
            metrics.cancelled += 1
          }

          // Update last order date if this order is more recent
          if (new Date(order.created_at) > new Date(metrics.lastOrderDate)) {
            metrics.lastOrderDate = order.created_at
          }
        })

        // Calculate average order values
        Object.values(retailerMetrics).forEach(metrics => {
          metrics.averageOrderValue = metrics.orders > 0 ? metrics.revenue / metrics.orders : 0
        })

        // Sort by revenue and limit results
        const topRetailers = Object.values(retailerMetrics)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, limit)

        // Calculate activity levels
        const activityLevels = topRetailers.map(retailer => {
          const daysSinceLastOrder = Math.floor(
            (Date.now() - new Date(retailer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
          )
          
          let activityLevel: 'high' | 'medium' | 'low'
          if (daysSinceLastOrder <= 7) activityLevel = 'high'
          else if (daysSinceLastOrder <= 30) activityLevel = 'medium'
          else activityLevel = 'low'

          return {
            ...retailer,
            daysSinceLastOrder,
            activityLevel,
            deliveryRate: retailer.orders > 0 ? (retailer.delivered / retailer.orders) * 100 : 0
          }
        })

        return {
          topPerformers: activityLevels,
          summary: {
            totalRetailers: Object.keys(retailerMetrics).length,
            totalRevenue: Object.values(retailerMetrics).reduce((sum, r) => sum + r.revenue, 0),
            averageOrderValue: Object.values(retailerMetrics).reduce((sum, r) => sum + r.averageOrderValue, 0) / Object.keys(retailerMetrics).length || 0,
            highActivityRetailers: activityLevels.filter(r => r.activityLevel === 'high').length,
            lowActivityRetailers: activityLevels.filter(r => r.activityLevel === 'low').length
          }
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch retailer metrics',
          cause: error,
        })
      }
    }),

  // Product performance metrics
  getProductMetrics: adminProcedure
    .input(productMetricsSchema.optional())
    .query(async ({ ctx, input }) => {
      const { from, to } = getDateRange(input?.date_from, input?.date_to)
      const { limit = 10, category_id } = input || {}

      try {
        let query = ctx.supabase
          .from('order_items')
          .select(`
            product_id,
            quantity,
            unit_price,
            total_price,
            orders!inner(created_at, status),
            products(
              id, sku, name_en, name_ar, name_fr,
              base_price, stock_quantity, category_id,
              categories(id, name_en, name_ar, name_fr)
            )
          `)

        const { data: orderItems, error } = await query

        if (error) throw error

        // Filter by date range and category
        const filteredItems = orderItems?.filter(item => {
          const orderDate = new Date(item.orders.created_at)
          const inDateRange = orderDate >= from && orderDate <= to
          const inCategory = !category_id || item.products?.category_id === category_id
          return inDateRange && inCategory && item.orders.status !== 'cancelled'
        }) || []

        // Group by product
        const productMetrics: Record<string, {
          product: any
          quantitySold: number
          revenue: number
          orders: number
          averagePrice: number
          stockLevel: number
          stockStatus: 'low' | 'medium' | 'high'
        }> = {}

        filteredItems.forEach(item => {
          const productId = item.product_id
          const product = item.products

          if (!product) return

          if (!productMetrics[productId]) {
            const stockLevel = product.stock_quantity || 0
            let stockStatus: 'low' | 'medium' | 'high'
            
            if (stockLevel < 10) stockStatus = 'low'
            else if (stockLevel < 50) stockStatus = 'medium'
            else stockStatus = 'high'

            productMetrics[productId] = {
              product,
              quantitySold: 0,
              revenue: 0,
              orders: 0,
              averagePrice: 0,
              stockLevel,
              stockStatus
            }
          }

          const metrics = productMetrics[productId]
          metrics.quantitySold += item.quantity || 0
          metrics.revenue += item.total_price || 0
          metrics.orders += 1
        })

        // Calculate average prices
        Object.values(productMetrics).forEach(metrics => {
          metrics.averagePrice = metrics.orders > 0 ? metrics.revenue / metrics.orders : 0
        })

        // Sort by revenue and limit results
        const bestSellers = Object.values(productMetrics)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, limit)

        // Get low stock products
        const lowStockProducts = Object.values(productMetrics)
          .filter(p => p.stockStatus === 'low')
          .sort((a, b) => a.stockLevel - b.stockLevel)
          .slice(0, 10)

        // Category performance
        const categoryMetrics: Record<string, {
          category: any
          revenue: number
          quantitySold: number
          productCount: number
        }> = {}

        Object.values(productMetrics).forEach(product => {
          const category = product.product.categories
          if (!category) return

          const categoryId = category.id
          if (!categoryMetrics[categoryId]) {
            categoryMetrics[categoryId] = {
              category,
              revenue: 0,
              quantitySold: 0,
              productCount: 0
            }
          }

          categoryMetrics[categoryId].revenue += product.revenue
          categoryMetrics[categoryId].quantitySold += product.quantitySold
          categoryMetrics[categoryId].productCount += 1
        })

        const topCategories = Object.values(categoryMetrics)
          .sort((a, b) => b.revenue - a.revenue)

        return {
          bestSellers,
          lowStockProducts,
          topCategories,
          summary: {
            totalProducts: Object.keys(productMetrics).length,
            totalRevenue: Object.values(productMetrics).reduce((sum, p) => sum + p.revenue, 0),
            totalQuantitySold: Object.values(productMetrics).reduce((sum, p) => sum + p.quantitySold, 0),
            lowStockCount: lowStockProducts.length,
            averagePrice: Object.values(productMetrics).reduce((sum, p) => sum + p.averagePrice, 0) / Object.keys(productMetrics).length || 0
          }
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch product metrics',
          cause: error,
        })
      }
    }),
})