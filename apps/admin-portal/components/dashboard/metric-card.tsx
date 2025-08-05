'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: ReactNode
  loading?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  onClick?: () => void
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    change: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    change: 'text-green-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    change: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    change: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    change: 'text-purple-600',
  },
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
  color = 'blue',
  onClick
}: MetricCardProps) {
  const colors = colorClasses[color]
  
  // Animated number counter
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : 0
  
  useEffect(() => {
    if (typeof value === 'number' && !loading) {
      const duration = 1500
      const steps = 60
      const increment = numericValue / steps
      let current = 0
      let step = 0
      
      const timer = setInterval(() => {
        step++
        current = Math.min(increment * step, numericValue)
        setDisplayValue(Math.floor(current))
        
        if (step >= steps) {
          clearInterval(timer)
          setDisplayValue(numericValue)
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    }
  }, [value, loading, numericValue])

  if (loading) {
    return (
      <motion.div 
        className="bg-white overflow-hidden shadow rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5">
          <div className="animate-pulse">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-8 h-8 ${colors.bg} rounded-md`}></div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  const getTrendIcon = () => {
    if (change === undefined) return null
    
    if (change > 0) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      )
    } else if (change < 0) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    
    return (
      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <motion.div 
      className={`bg-white overflow-hidden shadow rounded-lg transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-blue-100' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-2 ${colors.bg} rounded-md`}>
            <div className={`h-6 w-6 ${colors.icon}`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <motion.div 
                  className="text-2xl font-semibold text-gray-900"
                  key={displayValue}
                  initial={{ scale: 1.1, color: colors.change || '#374151' }}
                  animate={{ scale: 1, color: '#111827' }}
                  transition={{ duration: 0.3 }}
                >
                  {typeof value === 'number' ? formatValue(displayValue) : formatValue(value)}
                </motion.div>
                {change !== undefined && (
                  <motion.div 
                    className="ml-2 flex items-center text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <motion.div
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      {getTrendIcon()}
                    </motion.div>
                    <motion.span 
                      className={`ml-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      {Math.abs(change).toFixed(1)}%
                    </motion.span>
                    {changeLabel && (
                      <span className="ml-1 text-gray-500">{changeLabel}</span>
                    )}
                  </motion.div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </motion.div>
  )
}