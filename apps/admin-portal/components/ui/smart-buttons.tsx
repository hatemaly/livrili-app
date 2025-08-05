'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState, useEffect } from 'react'
import { Button } from './button'

interface SmartButtonProps {
  children: ReactNode
  onClick?: () => void | Promise<void>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  className?: string
  successMessage?: string
  loadingMessage?: string
  errorMessage?: string
  celebration?: boolean
  hapticFeedback?: boolean
}

export function SmartButton({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  successMessage = 'Success!',
  loadingMessage = 'Working...',
  errorMessage = 'Something went wrong',
  celebration = false,
  hapticFeedback = true,
  ...props
}: SmartButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [showFeedback, setShowFeedback] = useState(false)

  const handleClick = async () => {
    if (!onClick || disabled || state === 'loading') return

    // Haptic feedback (if supported)
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }

    setState('loading')
    setShowFeedback(true)

    try {
      await onClick()
      setState('success')
      
      if (celebration) {
        // Brief celebration animation
        setTimeout(() => {
          setState('idle')
          setShowFeedback(false)
        }, 2000)
      } else {
        setTimeout(() => {
          setState('idle')
          setShowFeedback(false)
        }, 1500)
      }
    } catch (error) {
      setState('error')
      setTimeout(() => {
        setState('idle')
        setShowFeedback(false)
      }, 3000)
    }
  }

  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {loadingMessage}
          </motion.div>
        )
      case 'success':
        return (
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <motion.svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
            {successMessage}
          </motion.div>
        )
      case 'error':
        return (
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
            {errorMessage}
          </motion.div>
        )
      default:
        return children
    }
  }

  const getVariant = () => {
    if (state === 'success') return 'default'
    if (state === 'error') return 'destructive'
    return variant
  }

  return (
    <div className="relative inline-block">
      <Button
        variant={getVariant()}
        size={size}
        disabled={disabled || state === 'loading'}
        className={`transition-all duration-200 ${className} ${
          state === 'success' ? 'bg-green-600 hover:bg-green-700' : ''
        }`}
        onClick={handleClick}
        {...props}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {getButtonContent()}
          </motion.div>
        </AnimatePresence>
      </Button>

      {/* Celebration confetti */}
      {celebration && state === 'success' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                i % 3 === 0 ? 'bg-yellow-400' :
                i % 3 === 1 ? 'bg-green-400' : 'bg-blue-400'
              }`}
              initial={{
                x: '50%',
                y: '50%',
                scale: 0
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                scale: [0, 1, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Refresh button with rotating icon
export function RefreshButton({ 
  onRefresh, 
  className = '',
  lastUpdated 
}: { 
  onRefresh: () => Promise<void>
  className?: string
  lastUpdated?: Date
}) {
  return (
    <div className="flex items-center space-x-3">
      <SmartButton
        onClick={onRefresh}
        variant="outline"
        size="sm"
        className={`flex items-center ${className}`}
        loadingMessage="Refreshing..."
        successMessage="Updated!"
      >
        <motion.svg 
          className="w-4 h-4 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </motion.svg>
        Refresh
      </SmartButton>
      
      {lastUpdated && (
        <motion.span 
          className="text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={lastUpdated.getTime()}
        >
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.span>
      )}
    </div>
  )
}

// Save button with progress indication
export function SaveButton({ 
  onSave, 
  hasChanges = false,
  className = ''
}: { 
  onSave: () => Promise<void>
  hasChanges?: boolean
  className?: string
}) {
  return (
    <div className="relative">
      <SmartButton
        onClick={onSave}
        disabled={!hasChanges}
        className={`${className} ${hasChanges ? 'animate-pulse' : ''}`}
        successMessage="Saved!"
        celebration={true}
        hapticFeedback={true}
      >
        <motion.div
          className="flex items-center"
          animate={hasChanges ? {
            scale: [1, 1.05, 1],
            transition: { duration: 2, repeat: Infinity }
          } : {}}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Changes
        </motion.div>
      </SmartButton>
      
      {hasChanges && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  )
}

// Delete button with confirmation
export function DeleteButton({ 
  onDelete, 
  confirmMessage = "Are you sure?",
  className = ''
}: { 
  onDelete: () => Promise<void>
  confirmMessage?: string
  className?: string
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000) // Auto-hide after 3s
      return
    }
    
    await onDelete()
    setShowConfirm(false)
  }

  return (
    <SmartButton
      onClick={handleDelete}
      variant={showConfirm ? "destructive" : "outline"}
      className={`${className} ${showConfirm ? 'animate-pulse' : ''}`}
      errorMessage="Failed to delete"
    >
      <motion.div
        className="flex items-center"
        animate={showConfirm ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: showConfirm ? Infinity : 0 }}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {showConfirm ? confirmMessage : "Delete"}
      </motion.div>
    </SmartButton>
  )
}

// Create button with excitement
export function CreateButton({ 
  onCreate, 
  label = "Create",
  className = ''
}: { 
  onCreate: () => Promise<void>
  label?: string
  className?: string
}) {
  return (
    <SmartButton
      onClick={onCreate}
      className={`bg-gradient-to-r from-[#003049] to-[#669BBC] hover:from-[#003049]/90 hover:to-[#669BBC]/90 text-white font-medium shadow-lg hover:shadow-xl ${className}`}
      successMessage="Created successfully!"
      celebration={true}
    >
      <motion.div
        className="flex items-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.svg 
          className="w-4 h-4 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </motion.svg>
        {label}
      </motion.div>
    </SmartButton>
  )
}