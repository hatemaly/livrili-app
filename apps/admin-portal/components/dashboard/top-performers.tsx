'use client'

import { useState } from 'react'

interface TopPerformersProps {
  retailers: Array<{
    retailer: {
      id: string
      business_name: string
      phone: string
      email: string
      city: string
      state: string
      current_balance: number
      credit_limit: number
    }
    orders: number
    revenue: number
    delivered: number
    cancelled: number
    averageOrderValue: number
    lastOrderDate: string
    daysSinceLastOrder: number
    activityLevel: 'high' | 'medium' | 'low'
    deliveryRate: number
    creditUtilization: number
  }>
  products: Array<{
    product: {
      id: string
      sku: string
      name_en: string
      name_ar: string
      name_fr: string
      base_price: number
      stock_quantity: number
      categories: {
        id: string
        name_en: string
        name_ar: string
        name_fr: string
      }
    }
    quantitySold: number
    revenue: number
    orders: number
    averagePrice: number
    stockLevel: number
    stockStatus: 'low' | 'medium' | 'high'
  }>
  loading?: boolean
}

export function TopPerformers({ retailers, products, loading = false }: TopPerformersProps) {
  const [activeTab, setActiveTab] = useState<'retailers' | 'products'>('retailers')

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getActivityBadge = (level: 'high' | 'medium' | 'low') => {
    const badges = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    }
    return badges[level]
  }

  const getStockBadge = (status: 'low' | 'medium' | 'high') => {
    const badges = {
      low: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-green-100 text-green-800'
    }
    return badges[status]
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('retailers')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeTab === 'retailers'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Retailers
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeTab === 'products'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Products
          </button>
        </div>
      </div>

      {activeTab === 'retailers' ? (
        <div className="space-y-4">
          {retailers.slice(0, 10).map((retailer, index) => (
            <div key={retailer.retailer.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {retailer.retailer.business_name}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActivityBadge(retailer.activityLevel)}`}>
                      {retailer.activityLevel}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-gray-500">{retailer.retailer.city}, {retailer.retailer.state}</p>
                    <p className="text-xs text-gray-500">{retailer.daysSinceLastOrder} days ago</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{retailer.orders}</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'DZD',
                      minimumFractionDigits: 0,
                    }).format(retailer.revenue).replace('DZD', 'DA')}
                  </div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{retailer.deliveryRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Delivery Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{retailer.creditUtilization.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Credit Used</div>
                </div>
              </div>
            </div>
          ))}

          {retailers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5h6m-6 4h6m2-5h6m-6 4h6M9 1L1 9l8 8L17 9 9 1z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No retailer data</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating some orders.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {products.slice(0, 10).map((product, index) => (
            <div key={product.product.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.product.name_en}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStockBadge(product.stockStatus)}`}>
                      {product.stockStatus} stock
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-gray-500">SKU: {product.product.sku}</p>
                    <p className="text-xs text-gray-500">Category: {product.product.categories.name_en}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{product.quantitySold}</div>
                  <div className="text-xs text-gray-500">Sold</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'DZD',
                      minimumFractionDigits: 0,
                    }).format(product.revenue).replace('DZD', 'DA')}
                  </div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{product.orders}</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{product.stockLevel}</div>
                  <div className="text-xs text-gray-500">In Stock</div>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No product data</h3>
              <p className="mt-1 text-sm text-gray-500">Products will appear here once orders are created.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}