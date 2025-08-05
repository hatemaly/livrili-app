// Demo data generator for testing the analytics dashboard
// This file provides sample data when real data is not available

export const generateDemoMetrics = () => ({
  activeOrders: {
    value: Math.floor(Math.random() * 50) + 10,
    trend: (Math.random() - 0.5) * 40, // -20% to +20%
    label: 'Active Orders'
  },
  gmv: {
    value: Math.floor(Math.random() * 100000) + 50000,
    trend: (Math.random() - 0.3) * 30, // Bias toward positive growth
    label: 'Gross Merchandise Value',
    formatted: new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'DZD' 
    }).format(Math.floor(Math.random() * 100000) + 50000)
  },
  activeUsers: {
    value: Math.floor(Math.random() * 20) + 5,
    total: Math.floor(Math.random() * 50) + 25,
    label: 'Active Users (7 days)',
    percentage: Math.random() * 80 + 10 // 10-90%
  },
  retailers: {
    value: Math.floor(Math.random() * 30) + 10,
    label: 'Active Retailers'
  },
  lastUpdated: new Date().toISOString()
})

export const generateDemoOrderTrends = (days: number = 30) => {
  const data = []
  const baseOrders = 15
  const baseRevenue = 25000
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const orders = Math.floor(baseOrders + Math.sin(i / 7) * 5 + Math.random() * 10)
    const delivered = Math.floor(orders * (0.7 + Math.random() * 0.2))
    const cancelled = Math.floor(orders * (0.05 + Math.random() * 0.1))
    
    data.push({
      date: date.toISOString().split('T')[0],
      orders,
      revenue: Math.floor(baseRevenue + Math.sin(i / 7) * 5000 + Math.random() * 10000),
      delivered,
      cancelled
    })
  }
  
  return {
    period: 'daily' as const,
    data,
    summary: {
      totalOrders: data.reduce((sum, d) => sum + d.orders, 0),
      totalRevenue: data.reduce((sum, d) => sum + d.revenue, 0),
      averageOrderValue: data.reduce((sum, d) => sum + d.revenue, 0) / data.reduce((sum, d) => sum + d.orders, 0),
      deliveryRate: (data.reduce((sum, d) => sum + d.delivered, 0) / data.reduce((sum, d) => sum + d.orders, 0)) * 100,
      cancellationRate: (data.reduce((sum, d) => sum + d.cancelled, 0) / data.reduce((sum, d) => sum + d.orders, 0)) * 100
    }
  }
}

export const generateDemoGeographicData = () => {
  const states = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif']
  const cities = [
    { city: 'Algiers', state: 'Algiers' },
    { city: 'Oran', state: 'Oran' },
    { city: 'Constantine', state: 'Constantine' },
    { city: 'Annaba', state: 'Annaba' },
    { city: 'Blida', state: 'Blida' },
    { city: 'Batna', state: 'Batna' },
    { city: 'Bouira', state: 'Bouira' },
    { city: 'Bejaia', state: 'Bejaia' }
  ]
  
  const stateData = states.map(state => ({
    state,
    orders: Math.floor(Math.random() * 100) + 20,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    delivered: Math.floor(Math.random() * 80) + 15
  }))
  
  const cityData = cities.map(({ city, state }) => ({
    city,
    state,
    orders: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 25000) + 5000,
    delivered: Math.floor(Math.random() * 40) + 8
  }))
  
  return {
    cities: cityData.sort((a, b) => b.revenue - a.revenue),
    states: stateData.sort((a, b) => b.revenue - a.revenue),
    summary: {
      totalCities: cities.length,
      totalStates: states.length,
      topRevenueCity: cityData.sort((a, b) => b.revenue - a.revenue)[0],
      topRevenueState: stateData.sort((a, b) => b.revenue - a.revenue)[0]
    }
  }
}

export const generateDemoPerformanceData = () => {
  const totalOrders = Math.floor(Math.random() * 500) + 200
  const deliveredOrders = Math.floor(totalOrders * (0.75 + Math.random() * 0.15))
  const cancelledOrders = Math.floor(totalOrders * (0.05 + Math.random() * 0.1))
  const pendingOrders = totalOrders - deliveredOrders - cancelledOrders
  
  const distribution = {
    pending: Math.floor(pendingOrders * 0.3),
    confirmed: Math.floor(pendingOrders * 0.3),
    processing: Math.floor(pendingOrders * 0.25),
    shipped: Math.floor(pendingOrders * 0.15),
    delivered: deliveredOrders,
    cancelled: cancelledOrders
  }
  
  const dailyPerformance = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const total = Math.floor(Math.random() * 20) + 5
    const delivered = Math.floor(total * (0.7 + Math.random() * 0.2))
    const cancelled = Math.floor(total * (0.05 + Math.random() * 0.1))
    
    return {
      date: date.toISOString().split('T')[0],
      total,
      delivered,
      cancelled,
      successRate: total > 0 ? (delivered / total) * 100 : 0
    }
  })
  
  return {
    summary: {
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      pendingOrders,
      deliverySuccessRate: (deliveredOrders / totalOrders) * 100,
      cancellationRate: (cancelledOrders / totalOrders) * 100,
      fulfillmentRate: ((deliveredOrders + distribution.shipped) / totalOrders) * 100,
      averageDeliveryTime: 2.5 + Math.random() * 2,
      averageOrderValue: 1500 + Math.random() * 1000,
      medianOrderValue: 1200 + Math.random() * 800
    },
    distribution,
    dailyPerformance,
    lastUpdated: new Date().toISOString()
  }
}

export const generateDemoRetailerMetrics = () => {
  const retailers = Array.from({ length: 10 }, (_, i) => {
    const orders = Math.floor(Math.random() * 50) + 10
    const revenue = Math.floor(Math.random() * 25000) + 5000
    const delivered = Math.floor(orders * (0.8 + Math.random() * 0.15))
    const cancelled = Math.floor(orders * (0.05 + Math.random() * 0.1))
    const daysSinceLastOrder = Math.floor(Math.random() * 30)
    
    let activityLevel: 'high' | 'medium' | 'low'
    if (daysSinceLastOrder <= 7) activityLevel = 'high'
    else if (daysSinceLastOrder <= 30) activityLevel = 'medium'
    else activityLevel = 'low'
    
    return {
      retailer: {
        id: `retailer-${i + 1}`,
        business_name: `Business ${i + 1}`,
        phone: `+213 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `business${i + 1}@example.com`,
        city: ['Algiers', 'Oran', 'Constantine', 'Annaba'][Math.floor(Math.random() * 4)],
        state: ['Algiers', 'Oran', 'Constantine', 'Annaba'][Math.floor(Math.random() * 4)],
        current_balance: Math.floor(Math.random() * 10000) - 5000,
        credit_limit: Math.floor(Math.random() * 20000) + 10000
      },
      orders,
      revenue,
      delivered,
      cancelled,
      averageOrderValue: revenue / orders,
      lastOrderDate: new Date(Date.now() - daysSinceLastOrder * 24 * 60 * 60 * 1000).toISOString(),
      daysSinceLastOrder,
      activityLevel,
      deliveryRate: (delivered / orders) * 100,
      creditUtilization: Math.random() * 80
    }
  }).sort((a, b) => b.revenue - a.revenue)
  
  return {
    topPerformers: retailers,
    summary: {
      totalRetailers: retailers.length,
      totalRevenue: retailers.reduce((sum, r) => sum + r.revenue, 0),
      averageOrderValue: retailers.reduce((sum, r) => sum + r.averageOrderValue, 0) / retailers.length,
      highActivityRetailers: retailers.filter(r => r.activityLevel === 'high').length,
      lowActivityRetailers: retailers.filter(r => r.activityLevel === 'low').length
    }
  }
}

export const generateDemoProductMetrics = () => {
  const categories = [
    { id: 'cat-1', name_en: 'Beverages', name_ar: 'المشروبات', name_fr: 'Boissons' },
    { id: 'cat-2', name_en: 'Dairy', name_ar: 'منتجات الألبان', name_fr: 'Produits laitiers' },
    { id: 'cat-3', name_en: 'Snacks', name_ar: 'الوجبات الخفيفة', name_fr: 'Collations' },
    { id: 'cat-4', name_en: 'Cleaning', name_ar: 'منتجات التنظيف', name_fr: 'Nettoyage' }
  ]
  
  const products = Array.from({ length: 10 }, (_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const quantitySold = Math.floor(Math.random() * 200) + 50
    const price = Math.floor(Math.random() * 500) + 100
    const revenue = quantitySold * price
    const stockLevel = Math.floor(Math.random() * 100) + 10
    
    let stockStatus: 'low' | 'medium' | 'high'
    if (stockLevel < 20) stockStatus = 'low'
    else if (stockLevel < 50) stockStatus = 'medium'
    else stockStatus = 'high'
    
    return {
      product: {
        id: `product-${i + 1}`,
        sku: `SKU-${1000 + i}`,
        name_en: `Product ${i + 1}`,
        name_ar: `منتج ${i + 1}`,
        name_fr: `Produit ${i + 1}`,
        base_price: price,
        stock_quantity: stockLevel,
        category_id: category.id,
        categories: category
      },
      quantitySold,
      revenue,
      orders: Math.floor(quantitySold / (2 + Math.random() * 3)),
      averagePrice: price,
      stockLevel,
      stockStatus
    }
  }).sort((a, b) => b.revenue - a.revenue)
  
  const lowStockProducts = products.filter(p => p.stockStatus === 'low')
  
  return {
    bestSellers: products,
    lowStockProducts,
    topCategories: categories.map(cat => ({
      category: cat,
      revenue: Math.floor(Math.random() * 50000) + 10000,
      quantitySold: Math.floor(Math.random() * 500) + 100,
      productCount: Math.floor(Math.random() * 20) + 5
    })).sort((a, b) => b.revenue - a.revenue),
    summary: {
      totalProducts: products.length,
      totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
      totalQuantitySold: products.reduce((sum, p) => sum + p.quantitySold, 0),
      lowStockCount: lowStockProducts.length,
      averagePrice: products.reduce((sum, p) => sum + p.averagePrice, 0) / products.length
    }
  }
}