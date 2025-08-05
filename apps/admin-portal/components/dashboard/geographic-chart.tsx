'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useState } from 'react'

interface GeographicChartProps {
  cities: Array<{
    city: string
    state: string
    orders: number
    revenue: number
    delivered: number
  }>
  states: Array<{
    state: string
    orders: number
    revenue: number
    delivered: number
  }>
  loading?: boolean
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#F97316']

export function GeographicChart({ cities, states, loading = false }: GeographicChartProps) {
  const [activeView, setActiveView] = useState<'cities' | 'states'>('states')

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const data = activeView === 'cities' ? cities.slice(0, 8) : states.slice(0, 8)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {activeView === 'cities' ? `${data.city}, ${data.state}` : data.state}
          </p>
          <p className="text-sm text-blue-600">Orders: {data.orders}</p>
          <p className="text-sm text-green-600">
            Revenue: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'DZD',
              minimumFractionDigits: 0,
            }).format(data.revenue)}
          </p>
          <p className="text-sm text-gray-600">Delivered: {data.delivered}</p>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.revenue / states.reduce((sum, s) => sum + s.revenue, 0)) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.state}</p>
          <p className="text-sm text-blue-600">Orders: {data.orders}</p>
          <p className="text-sm text-green-600">
            Revenue: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'DZD',
              minimumFractionDigits: 0,
            }).format(data.revenue)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView('states')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeView === 'states'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            States
          </button>
          <button
            onClick={() => setActiveView('cities')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeView === 'cities'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cities
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="h-64">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Top {activeView === 'cities' ? 'Cities' : 'States'} by Revenue
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                className="text-xs"
              />
              <YAxis 
                type="category" 
                dataKey={activeView === 'cities' ? 'city' : 'state'} 
                width={100}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart for States Only */}
        {activeView === 'states' && (
          <div className="h-64">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={states.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="revenue"
                  label={({ state, value, percent }) => 
                    `${state}: ${(percent * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {states.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Cities List for Cities View */}
        {activeView === 'cities' && (
          <div className="h-64 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Top Cities</h4>
            <div className="space-y-2">
              {cities.slice(0, 10).map((city, index) => (
                <div key={`${city.city}-${city.state}`} className="flex items-center justify-between p-2 border border-gray-100 rounded">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{city.city}</p>
                      <p className="text-xs text-gray-500">{city.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{city.orders} orders</p>
                    <p className="text-xs text-gray-500">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'DZD',
                        minimumFractionDigits: 0,
                      }).format(city.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}