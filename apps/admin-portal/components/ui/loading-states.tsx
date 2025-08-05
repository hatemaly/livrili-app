'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'accent'
  message?: string
}

export function LoadingSpinner({ size = 'md', color = 'primary', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }
  
  const colorClasses = {
    primary: 'text-[#003049]',
    secondary: 'text-[#C1121F]',
    accent: 'text-[#669BBC]'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <svg fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            className="opacity-75"
          />
        </svg>
      </motion.div>
      {message && (
        <motion.p 
          className="text-sm text-gray-600 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200"
  
  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-md",
    circular: "rounded-full"
  }
  
  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '2rem')
  }
  
  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  )
}

interface DelightfulLoadingProps {
  message?: string
  submessage?: string
  icon?: ReactNode
}

export function DelightfulLoading({ 
  message = "Working on it...", 
  submessage = "This won't take long",
  icon 
}: DelightfulLoadingProps) {
  const loadingMessages = [
    "Organizing your dashboard...",
    "Fetching the latest data...",
    "Crunching the numbers...",
    "Almost ready...",
    "Putting the finishing touches..."
  ]
  
  const algerian_touches = [
    "Preparing your business insights... ☕",
    "Connecting suppliers across Algeria... 🇩🇿",
    "Loading fresh market data... 📊",
    "Getting everything ready for you... ✨"
  ]
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-8 space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Icon */}
      <motion.div
        className="relative"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {icon || (
          <div className="w-16 h-16 bg-gradient-to-br from-[#003049] to-[#669BBC] rounded-2xl flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          </div>
        )}
        
        {/* Floating particles */}
        <motion.div
          className="absolute -top-2 -right-2 w-3 h-3 bg-[#C1121F] rounded-full"
          animate={{ 
            y: [-5, 5, -5],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#FDF0D5] rounded-full"
          animate={{ 
            x: [-3, 3, -3],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>
      
      {/* Main message */}
      <motion.h3 
        className="text-lg font-semibold text-gray-900 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.h3>
      
      {/* Submessage */}
      <motion.p 
        className="text-sm text-gray-600 text-center max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {submessage}
      </motion.p>
      
      {/* Progress dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#669BBC] rounded-full"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Table Loading State
export function TableLoadingState({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div 
          key={rowIndex}
          className="flex space-x-4 p-4 bg-white rounded-lg border"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: rowIndex * 0.1 }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton 
              key={colIndex}
              width={colIndex === 0 ? '150px' : colIndex === columns - 1 ? '80px' : '120px'}
              className="h-4"
            />
          ))}
        </motion.div>
      ))}
    </div>
  )
}