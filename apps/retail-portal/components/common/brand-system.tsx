'use client'

import React from 'react'
import { cn } from '@livrili/ui'
import { LivriliIcon } from './livrili-logo'

// Brand Color Palette
export const brandColors = {
  prussianBlue: '#003049',    // Primary brand color
  fireBrick: '#C1121F',       // Secondary/accent color
  airBlue: '#669BBC',         // Accent color
  barnRed: '#780000',         // Dark red variant
  papayaWhip: '#FDF0D5',      // Light accent
} as const

// Typography Components
export function BrandHeading({ 
  children, 
  level = 1,
  color = 'primary',
  className 
}: { 
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4
  color?: 'primary' | 'secondary' | 'accent' | 'gray'
  className?: string 
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  const colors = {
    primary: 'text-livrili-prussian',
    secondary: 'text-livrili-fire',
    accent: 'text-livrili-air',
    gray: 'text-gray-700',
  }

  const sizes = {
    1: 'text-3xl md:text-4xl font-bold',
    2: 'text-2xl md:text-3xl font-bold',
    3: 'text-xl md:text-2xl font-semibold',
    4: 'text-lg md:text-xl font-semibold',
  }

  return (
    <Tag className={cn(sizes[level], colors[color], 'leading-tight', className)}>
      {children}
    </Tag>
  )
}

export function BrandText({ 
  children, 
  variant = 'body',
  color = 'gray',
  className 
}: { 
  children: React.ReactNode
  variant?: 'body' | 'caption' | 'small' | 'large'
  color?: 'primary' | 'secondary' | 'gray' | 'muted'
  className?: string 
}) {
  const colors = {
    primary: 'text-livrili-prussian',
    secondary: 'text-livrili-fire',
    gray: 'text-gray-700',
    muted: 'text-gray-500',
  }

  const variants = {
    body: 'text-base',
    caption: 'text-sm',
    small: 'text-xs',
    large: 'text-lg',
  }

  return (
    <p className={cn(variants[variant], colors[color], className)}>
      {children}
    </p>
  )
}

// Button Components with Brand Colors
export function BrandButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className,
  ...props 
}: { 
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  isLoading?: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  
  const variants = {
    primary: 'bg-livrili-prussian hover:bg-livrili-prussian/90 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-livrili-fire hover:bg-livrili-fire/90 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-livrili-prussian text-livrili-prussian hover:bg-livrili-prussian hover:text-white',
    ghost: 'text-livrili-prussian hover:bg-livrili-prussian/10',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl',
  }

  return (
    <button
      className={cn(
        'font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transform hover:scale-105 active:scale-95',
        'touch-feedback enhanced-touch ripple',
        variants[variant],
        sizes[size],
        isLoading && 'animate-pulse',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          <span className="text-lg">{icon}</span>
        ) : null}
        <span>{children}</span>
      </div>
    </button>
  )
}

// Status Indicators with Brand Colors
export function StatusBadge({ 
  status, 
  children,
  className 
}: { 
  status: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
  className?: string 
}) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-livrili-air/20 text-livrili-air border-livrili-air/30',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-livrili-prussian/10 text-livrili-prussian border-livrili-prussian/20',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
      statusColors[status],
      className
    )}>
      {children}
    </span>
  )
}

// Card Components with Brand Styling
export function FeatureCard({ 
  icon,
  title, 
  description,
  action,
  variant = 'default',
  className 
}: { 
  icon?: string
  title: string
  description: string
  action?: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
  className?: string 
}) {
  const variants = {
    default: 'bg-white border-gray-200 hover:border-gray-300',
    primary: 'bg-livrili-prussian/5 border-livrili-prussian/20 hover:border-livrili-prussian/30',
    secondary: 'bg-livrili-fire/5 border-livrili-fire/20 hover:border-livrili-fire/30',
    accent: 'bg-livrili-papaya/50 border-livrili-papaya hover:border-livrili-papaya',
  }

  return (
    <div className={cn(
      'rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg hover:scale-105',
      'cursor-pointer group',
      variants[variant],
      className
    )}>
      {icon && (
        <div className="mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-livrili-prussian to-livrili-air rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            {icon}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <BrandHeading level={3} className="group-hover:text-livrili-fire transition-colors">
          {title}
        </BrandHeading>
        <BrandText color="muted">
          {description}
        </BrandText>
        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

// Statistics Card
export function StatCard({ 
  icon,
  value, 
  label,
  trend,
  className 
}: { 
  icon?: string
  value: string | number
  label: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string 
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  }

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    neutral: '➡️',
  }

  return (
    <div className={cn(
      'bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div className="text-2xl">{icon}</div>
        )}
        {trend && (
          <span className={cn('text-sm', trendColors[trend])}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-livrili-prussian">
          {value}
        </div>
        <div className="text-sm text-gray-600">
          {label}
        </div>
      </div>
    </div>
  )
}

// Loading Components with Brand Colors
export function BrandSpinner({ 
  size = 'md',
  color = 'primary',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  className?: string 
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }

  const colors = {
    primary: 'border-livrili-prussian border-t-transparent',
    secondary: 'border-livrili-fire border-t-transparent',
    white: 'border-white border-t-transparent',
  }

  return (
    <div className={cn(
      'rounded-full animate-spin',
      sizes[size],
      colors[color],
      className
    )} />
  )
}

// Card Components
export function BrandCard({ 
  children,
  variant = 'default',
  className,
  padding = 'default'
}: { 
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'gradient'
  padding?: 'none' | 'sm' | 'default' | 'lg'
  className?: string 
}) {
  const variants = {
    default: 'bg-white border-gray-200',
    primary: 'bg-livrili-prussian/5 border-livrili-prussian/20',
    secondary: 'bg-livrili-fire/5 border-livrili-fire/20',
    accent: 'bg-livrili-papaya/50 border-livrili-papaya',
    gradient: 'bg-gradient-to-br from-livrili-prussian/5 to-livrili-air/5 border-livrili-prussian/20',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  }

  return (
    <div className={cn(
      'rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all duration-200',
      variants[variant],
      paddings[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Alert Components
export function BrandAlert({ 
  type = 'info',
  title,
  children,
  className 
}: { 
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  children: React.ReactNode
  className?: string 
}) {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '✅',
      iconBg: 'bg-green-100',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '❌',
      iconBg: 'bg-red-100',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: '⚠️',
      iconBg: 'bg-yellow-100',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-livrili-prussian/5',
      border: 'border-livrili-prussian/20',
      icon: 'ℹ️',
      iconBg: 'bg-livrili-prussian/10',
      titleColor: 'text-livrili-prussian',
      textColor: 'text-livrili-prussian/80',
    },
  }

  const config = types[type]

  return (
    <div className={cn(
      'rounded-xl border p-4',
      config.bg,
      config.border,
      className
    )}>
      <div className="flex items-start space-x-3 rtl:space-x-reverse">
        <div className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm',
          config.iconBg
        )}>
          {config.icon}
        </div>
        <div className="flex-1 space-y-1">
          {title && (
            <div className={cn('font-medium', config.titleColor)}>
              {title}
            </div>
          )}
          <div className={cn('text-sm', config.textColor)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}