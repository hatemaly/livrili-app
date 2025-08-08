'use client'

import { useLanguage } from '@livrili/ui'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
      toast.success(t('offline.back_online', 'Back online! 🎉'), {
        duration: 3000,
        position: 'top-center'
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
      toast.error(t('offline.went_offline', 'You are now offline 📶'), {
        duration: 5000,
        position: 'top-center'
      })
    }

    // Check initial state
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setShowOfflineMessage(true)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [t])

  // Auto-hide offline message after 10 seconds
  useEffect(() => {
    if (showOfflineMessage && !isOnline) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [showOfflineMessage, isOnline])

  if (!showOfflineMessage || isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 shadow-lg animate-slide-down">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm">📶</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {t('offline.title', 'You\'re offline')}
            </p>
            <p className="text-xs opacity-90">
              {t('offline.description', 'Some features may not work. We\'ll sync when you\'re back online.')}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowOfflineMessage(false)}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ml-3 rtl:ml-0 rtl:mr-3"
          aria-label={t('offline.dismiss', 'Dismiss')}
        >
          <span className="text-white text-sm">✕</span>
        </button>
      </div>
    </div>
  )
}

// Hook to get online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Set initial state
    setIsOnline(navigator.onLine)

    // Add listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Component to show different content based on online status
interface OnlineStatusProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function OnlineStatus({ children, fallback }: OnlineStatusProps) {
  const isOnline = useOnlineStatus()
  const { t } = useLanguage()

  if (!isOnline && fallback) {
    return <>{fallback}</>
  }

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📶</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('offline.content_unavailable', 'Content Unavailable')}
        </h3>
        
        <p className="text-gray-600 text-sm">
          {t('offline.connect_to_view', 'Connect to the internet to view this content.')}
        </p>
      </div>
    )
  }

  return <>{children}</>
}