'use client'

import { Card } from '@livrili/ui'
import { 
  BuildingOfficeIcon, 
  CheckCircleIcon, 
  StarIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import type { SupplierStats } from '../types'

interface SupplierStatsProps {
  stats: SupplierStats
}

export function SupplierStats({ stats }: SupplierStatsProps) {
  const statCards = [
    {
      title: 'Total Suppliers',
      value: stats.total_suppliers.toLocaleString(),
      icon: BuildingOfficeIcon,
      color: 'blue',
    },
    {
      title: 'Active Suppliers',
      value: stats.active_suppliers.toLocaleString(),
      icon: CheckCircleIcon,
      color: 'green',
    },
    {
      title: 'Preferred Suppliers',
      value: stats.preferred_suppliers.toLocaleString(),
      icon: StarIcon,
      color: 'yellow',
    },
    {
      title: 'Average Rating',
      value: stats.average_rating.toFixed(1),
      icon: ChartBarIcon,
      color: 'purple',
    },
    {
      title: 'Purchase Orders',
      value: stats.total_purchase_orders.toLocaleString(),
      icon: DocumentTextIcon,
      color: 'indigo',
    },
    {
      title: 'Total Purchase Value',
      value: new Intl.NumberFormat('en-DZ', {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.total_purchase_value),
      icon: CurrencyDollarIcon,
      color: 'emerald',
    },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 bg-blue-100'
      case 'green':
        return 'text-green-600 bg-green-100'
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100'
      case 'purple':
        return 'text-purple-600 bg-purple-100'
      case 'indigo':
        return 'text-indigo-600 bg-indigo-100'
      case 'emerald':
        return 'text-emerald-600 bg-emerald-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="p-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}