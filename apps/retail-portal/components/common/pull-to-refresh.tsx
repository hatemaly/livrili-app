'use client'

import { useLanguage } from '@livrili/ui'
import React, { useState, useRef, useCallback, useEffect } from 'react'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  pullThreshold?: number
  maxPullDistance?: number
  refreshingHeight?: number
  disabled?: boolean
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  pullThreshold = 80,
  maxPullDistance = 150,
  refreshingHeight = 80,
  disabled = false,
  className = ''
}: PullToRefreshProps) {
  const { t } = useLanguage()
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isAtTop = useRef(true)

  const checkIfAtTop = useCallback(() => {
    if (containerRef.current) {
      isAtTop.current = containerRef.current.scrollTop <= 0
    }
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return
    
    checkIfAtTop()
    if (isAtTop.current) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [disabled, isRefreshing, checkIfAtTop])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return

    currentY.current = e.touches[0].clientY
    const distance = currentY.current - startY.current

    if (distance > 0 && isAtTop.current) {
      e.preventDefault()
      const dampedDistance = Math.min(
        distance * 0.6,
        maxPullDistance
      )
      setPullDistance(dampedDistance)

      // Add haptic feedback at threshold
      if (distance >= pullThreshold && 'vibrate' in navigator) {
        navigator.vibrate([10])
      }
    }
  }, [isPulling, disabled, isRefreshing, maxPullDistance, pullThreshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled || isRefreshing) return

    setIsPulling(false)

    if (pullDistance >= pullThreshold) {
      setIsRefreshing(true)
      setPullDistance(refreshingHeight)

      // Strong haptic feedback for refresh trigger
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50])
      }

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, pullThreshold, refreshingHeight, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Passive listeners for better performance
    const touchStartOptions = { passive: false }
    const touchMoveOptions = { passive: false }
    const touchEndOptions = { passive: true }

    container.addEventListener('touchstart', handleTouchStart, touchStartOptions)
    container.addEventListener('touchmove', handleTouchMove, touchMoveOptions)
    container.addEventListener('touchend', handleTouchEnd, touchEndOptions)
    container.addEventListener('scroll', checkIfAtTop, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('scroll', checkIfAtTop)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, checkIfAtTop])

  const getRefreshIcon = () => {
    if (isRefreshing) {
      return (
        <div className="w-6 h-6 border-2 border-livrili-prussian border-t-transparent rounded-full animate-spin" />
      )
    }
    
    if (pullDistance >= pullThreshold) {
      return <span className="text-2xl animate-bounce">↻</span>
    }
    
    return <span className="text-2xl">↓</span>
  }

  const getRefreshText = () => {
    if (isRefreshing) {
      return t('pull_refresh.refreshing', 'Refreshing...')
    }
    
    if (pullDistance >= pullThreshold) {
      return t('pull_refresh.release', 'Release to refresh')
    }
    
    return t('pull_refresh.pull', 'Pull down to refresh')
  }

  const refreshOpacity = Math.min(pullDistance / pullThreshold, 1)
  const refreshScale = Math.min(0.5 + (pullDistance / pullThreshold) * 0.5, 1)

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ 
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-transparent"
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          transform: `translateY(-${Math.max(pullDistance - 20, 0)}px)`,
          opacity: refreshOpacity,
          zIndex: 10
        }}
      >
        <div 
          className="flex flex-col items-center space-y-2 text-livrili-prussian"
          style={{ transform: `scale(${refreshScale})` }}
        >
          {getRefreshIcon()}
          <span className="text-sm font-medium">
            {getRefreshText()}
          </span>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

// Hook for programmatic refresh
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh, isRefreshing])

  return { isRefreshing, refresh }
}

// Simple refresh button for desktop/fallback
interface RefreshButtonProps {
  onRefresh: () => Promise<void>
  isLoading?: boolean
  className?: string
}

export function RefreshButton({ onRefresh, isLoading = false, className = '' }: RefreshButtonProps) {
  const { t } = useLanguage()
  
  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className={`
        flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 
        bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">
            {t('pull_refresh.refreshing', 'Refreshing...')}
          </span>
        </>
      ) : (
        <>
          <span className="text-lg">↻</span>
          <span className="text-sm font-medium">
            {t('pull_refresh.refresh', 'Refresh')}
          </span>
        </>
      )}
    </button>
  )
}