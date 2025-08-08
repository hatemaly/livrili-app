'use client'

import { Button, ButtonProps } from '@livrili/ui'
import React, { useCallback } from 'react'

interface HapticButtonProps extends ButtonProps {
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
  enableHaptic?: boolean
}

// Web Vibration API patterns for different feedback types
const VIBRATION_PATTERNS = {
  light: [10],
  medium: [30],
  heavy: [50],
  success: [20, 50, 20],
  warning: [50, 100, 50],
  error: [100, 50, 100, 50, 100]
}

export function HapticButton({ 
  hapticType = 'light',
  enableHaptic = true,
  onClick,
  children,
  className = '',
  disabled,
  ...props 
}: HapticButtonProps) {
  const triggerHaptic = useCallback(() => {
    if (!enableHaptic || disabled) return

    // Check if device supports vibration
    if ('vibrate' in navigator && navigator.vibrate) {
      const pattern = VIBRATION_PATTERNS[hapticType]
      navigator.vibrate(pattern)
    }
  }, [hapticType, enableHaptic, disabled])

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic()
    onClick?.(event)
  }, [onClick, triggerHaptic])

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled}
      className={`
        touch-feedback transition-all duration-150
        active:scale-95 hover:scale-105
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </Button>
  )
}

// Hook for programmatic haptic feedback
export function useHapticFeedback() {
  return useCallback((type: HapticButtonProps['hapticType'] = 'light') => {
    if ('vibrate' in navigator && navigator.vibrate) {
      const pattern = VIBRATION_PATTERNS[type]
      navigator.vibrate(pattern)
    }
  }, [])
}

// Enhanced touch interactions for better mobile UX
interface TouchFeedbackProps {
  children: React.ReactNode
  onPress?: () => void
  onLongPress?: () => void
  longPressDelay?: number
  hapticType?: HapticButtonProps['hapticType']
  className?: string
  disabled?: boolean
}

export function TouchFeedback({
  children,
  onPress,
  onLongPress,
  longPressDelay = 500,
  hapticType = 'light',
  className = '',
  disabled = false
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = React.useState(false)
  const longPressTimer = React.useRef<NodeJS.Timeout>()
  const haptic = useHapticFeedback()

  const handleTouchStart = useCallback(() => {
    if (disabled) return
    
    setIsPressed(true)
    haptic('light') // Light feedback on touch start
    
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        haptic('heavy') // Heavy feedback for long press
        onLongPress()
      }, longPressDelay)
    }
  }, [disabled, haptic, onLongPress, longPressDelay])

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false)
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    
    if (!disabled && onPress) {
      haptic(hapticType)
      onPress()
    }
  }, [disabled, onPress, haptic, hapticType])

  const handleTouchCancel = useCallback(() => {
    setIsPressed(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  return (
    <div
      className={`
        cursor-pointer select-none transition-all duration-150
        ${isPressed ? 'scale-95' : 'hover:scale-105'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
    >
      {children}
    </div>
  )
}

// Quick success/error feedback with haptics
interface ActionFeedbackProps {
  type: 'success' | 'error' | 'warning'
  message: string
  onAction?: () => void
  actionLabel?: string
  className?: string
}

export function ActionFeedback({
  type,
  message,
  onAction,
  actionLabel,
  className = ''
}: ActionFeedbackProps) {
  const haptic = useHapticFeedback()

  React.useEffect(() => {
    haptic(type)
  }, [type, haptic])

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return '💬'
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-300 text-green-800'
      case 'error': return 'bg-red-100 border-red-300 text-red-800'
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default: return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }

  return (
    <div className={`
      flex items-center justify-between p-4 rounded-xl border-2 animate-slide-up
      ${getColors()} ${className}
    `}>
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <span className="text-2xl">{getIcon()}</span>
        <span className="font-medium">{message}</span>
      </div>
      
      {onAction && actionLabel && (
        <HapticButton
          variant="ghost"
          size="sm"
          hapticType={type}
          onClick={onAction}
          className="ml-3 rtl:ml-0 rtl:mr-3"
        >
          {actionLabel}
        </HapticButton>
      )}
    </div>
  )
}