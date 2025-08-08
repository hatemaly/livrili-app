'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage, useRTL } from '@livrili/ui'
import { format } from 'date-fns'
import { ar, enUS, fr } from 'date-fns/locale'

interface OrderStatus {
  id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled'
  title: string
  description?: string
  timestamp: Date
  estimatedTime?: Date
  isCompleted: boolean
  isCurrent: boolean
  details?: {
    location?: string
    driverName?: string
    driverPhone?: string
    notes?: string
    images?: string[]
  }
}

interface OrderTrackingTimelineProps {
  orderId: string
  statuses: OrderStatus[]
  currentStatus: string
  estimatedDelivery?: Date
  deliveryAddress?: string
  driverInfo?: {
    name: string
    phone: string
    vehicle?: string
    location?: {
      lat: number
      lng: number
    }
  }
  onContactDriver?: () => void
  onViewMap?: () => void
  onCancelOrder?: () => void
  canCancel?: boolean
  className?: string
}

export function OrderTrackingTimeline({
  orderId,
  statuses,
  currentStatus,
  estimatedDelivery,
  deliveryAddress,
  driverInfo,
  onContactDriver,
  onViewMap,
  onCancelOrder,
  canCancel = false,
  className = ''
}: OrderTrackingTimelineProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const dateLocale = language === 'ar' ? ar : language === 'fr' ? fr : enUS

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: OrderStatus) => {
    switch (status.status) {
      case 'pending':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'confirmed':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'preparing':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        )
      case 'ready':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        )
      case 'picked_up':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'out_for_delivery':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        )
      case 'delivered':
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    if (status.status === 'cancelled') {
      return {
        bg: 'bg-red-100',
        border: 'border-red-500',
        icon: 'text-red-600',
        text: 'text-red-800',
        line: 'bg-red-300'
      }
    }
    
    if (status.isCompleted) {
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        icon: 'text-green-600',
        text: 'text-green-800',
        line: 'bg-green-500'
      }
    }
    
    if (status.isCurrent) {
      return {
        bg: 'bg-livrili-prussian/10',
        border: 'border-livrili-prussian',
        icon: 'text-livrili-prussian',
        text: 'text-livrili-prussian',
        line: 'bg-livrili-prussian'
      }
    }
    
    return {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      icon: 'text-gray-400',
      text: 'text-gray-600',
      line: 'bg-gray-300'
    }
  }

  const formatTime = (date: Date) => {
    return format(date, 'MMM dd, HH:mm', { locale: dateLocale })
  }

  const getTimeRemaining = (targetDate: Date) => {
    const diff = targetDate.getTime() - currentTime.getTime()
    if (diff <= 0) return null
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {t('orders.tracking.title', 'Order Tracking')}
          </h2>
          <p className="text-gray-600 text-sm">
            {t('orders.tracking.order_id', 'Order ID')}: #{orderId}
          </p>
        </div>
        
        {canCancel && (
          <button
            onClick={onCancelOrder}
            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            {t('orders.tracking.cancel', 'Cancel Order')}
          </button>
        )}
      </div>

      {/* Delivery Info */}
      {estimatedDelivery && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                {t('orders.tracking.estimated_delivery', 'Estimated Delivery')}
              </h3>
              <p className="text-gray-600 text-sm">
                {formatTime(estimatedDelivery)}
              </p>
              {getTimeRemaining(estimatedDelivery) && (
                <p className="text-livrili-prussian font-medium text-sm">
                  {getTimeRemaining(estimatedDelivery)} {t('orders.tracking.remaining', 'remaining')}
                </p>
              )}
            </div>
            
            {deliveryAddress && (
              <div className="text-right">
                <p className="text-gray-600 text-sm">
                  {t('orders.tracking.delivering_to', 'Delivering to')}
                </p>
                <p className="text-gray-900 font-medium text-sm">
                  {deliveryAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Driver Info */}
      {driverInfo && (currentStatus === 'out_for_delivery' || currentStatus === 'picked_up') && (
        <div className="bg-livrili-prussian/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-livrili-prussian/10 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-livrili-prussian" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {driverInfo.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('orders.tracking.your_driver', 'Your Driver')}
                  {driverInfo.vehicle && ` • ${driverInfo.vehicle}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {onContactDriver && (
                <button
                  onClick={onContactDriver}
                  className="p-2 text-livrili-prussian hover:bg-livrili-prussian/10 rounded-lg transition-colors"
                  title={t('orders.tracking.contact_driver', 'Contact Driver')}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              )}
              
              {onViewMap && (
                <button
                  onClick={onViewMap}
                  className="p-2 text-livrili-prussian hover:bg-livrili-prussian/10 rounded-lg transition-colors"
                  title={t('orders.tracking.view_map', 'View on Map')}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {statuses.map((status, index) => {
          const colors = getStatusColor(status)
          const isLast = index === statuses.length - 1
          const isExpanded = expandedStatus === status.id

          return (
            <div key={status.id} className="relative">
              {/* Connecting Line */}
              {!isLast && (
                <div 
                  className={`absolute top-12 ${isRTL ? 'right-6' : 'left-6'} w-0.5 h-16 ${colors.line}`}
                  style={{ transform: isRTL ? 'translateX(50%)' : 'translateX(-50%)' }}
                />
              )}

              {/* Status Item */}
              <div className="flex items-start space-x-4 rtl:space-x-reverse mb-8">
                {/* Icon */}
                <div className={`
                  relative z-10 flex items-center justify-center w-12 h-12 
                  rounded-full border-2 ${colors.bg} ${colors.border}
                `}>
                  <div className={colors.icon}>
                    {getStatusIcon(status)}
                  </div>
                  
                  {/* Pulse animation for current status */}
                  {status.isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-livrili-prussian animate-ping opacity-20" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setExpandedStatus(isExpanded ? null : status.id)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${colors.text} group-hover:underline`}>
                          {status.title}
                        </h3>
                        {status.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {status.description}
                          </p>
                        )}
                      </div>
                      
                      <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                        <p className="text-gray-500 text-sm">
                          {status.isCompleted 
                            ? formatTime(status.timestamp)
                            : status.estimatedTime
                            ? `~${formatTime(status.estimatedTime)}`
                            : t('orders.tracking.pending', 'Pending')
                          }
                        </p>
                        
                        {status.details && (
                          <svg 
                            className={`h-4 w-4 text-gray-400 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && status.details && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                      {status.details.location && (
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('orders.tracking.location', 'Location')}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {status.details.location}
                          </p>
                        </div>
                      )}
                      
                      {status.details.driverName && (
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('orders.tracking.driver', 'Driver')}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {status.details.driverName}
                            {status.details.driverPhone && ` • ${status.details.driverPhone}`}
                          </p>
                        </div>
                      )}
                      
                      {status.details.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('orders.tracking.notes', 'Notes')}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {status.details.notes}
                          </p>
                        </div>
                      )}
                      
                      {status.details.images && status.details.images.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-2">
                            {t('orders.tracking.photos', 'Photos')}
                          </h4>
                          <div className="flex space-x-2 overflow-x-auto">
                            {status.details.images.map((image, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0"
                              >
                                <img
                                  src={image}
                                  alt={`Status ${status.status} photo ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}