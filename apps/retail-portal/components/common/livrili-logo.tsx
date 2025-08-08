'use client'

import Image from 'next/image'
import { cn } from '@livrili/ui'
import React from 'react'

export interface LivriliLogoProps {
  variant?: 'primary' | 'white' | 'mono-blue' | 'icon-only' | 'stacked'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  priority?: boolean
}

const logoSizes = {
  'xs': { width: 80, height: 24 },
  'sm': { width: 100, height: 30 },
  'md': { width: 120, height: 36 },
  'lg': { width: 160, height: 48 },
  'xl': { width: 200, height: 60 },
  '2xl': { width: 240, height: 72 },
}

const iconSizes = {
  'xs': { width: 24, height: 24 },
  'sm': { width: 30, height: 30 },
  'md': { width: 36, height: 36 },
  'lg': { width: 48, height: 48 },
  'xl': { width: 60, height: 60 },
  '2xl': { width: 72, height: 72 },
}

const stackedSizes = {
  'xs': { width: 60, height: 48 },
  'sm': { width: 80, height: 64 },
  'md': { width: 100, height: 80 },
  'lg': { width: 120, height: 96 },
  'xl': { width: 140, height: 112 },
  '2xl': { width: 160, height: 128 },
}

export function LivriliLogo({
  variant = 'primary',
  size = 'md',
  className,
  priority = false,
}: LivriliLogoProps) {
  const getLogoPath = () => {
    switch (variant) {
      case 'white':
        return '/livrili-logo-white.png'
      case 'mono-blue':
        return '/livrili-logo-mono-blue.png'
      case 'icon-only':
        return '/livrili-logo-icon.png'
      case 'stacked':
        return '/livrili-logo-stacked.png'
      case 'primary':
      default:
        return '/livrili-logo-primary.png'
    }
  }

  const getDimensions = () => {
    if (variant === 'icon-only') return iconSizes[size]
    if (variant === 'stacked') return stackedSizes[size]
    return logoSizes[size]
  }

  const { width, height } = getDimensions()

  return (
    <div className={cn("flex-shrink-0 inline-flex items-center", className)}>
      <Image
        src={getLogoPath()}
        alt="Livrili - B2B Marketplace"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  )
}

// Brand Identity Components
export function LivriliIcon({ 
  size = 36, 
  className 
}: { 
  size?: number
  className?: string 
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-xl bg-livrili-prussian text-white shadow-md",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span className="text-lg font-bold">
        {/* Box with checkmark icon */}
        ✓
      </span>
    </div>
  )
}

export function BrandGradient({ 
  children, 
  variant = 'primary',
  className 
}: { 
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  className?: string 
}) {
  const gradients = {
    primary: 'bg-gradient-to-br from-livrili-prussian via-livrili-prussian to-livrili-air',
    secondary: 'bg-gradient-to-br from-livrili-fire to-livrili-barn',
    accent: 'bg-gradient-to-br from-livrili-air to-livrili-papaya',
  }

  return (
    <div className={cn(gradients[variant], className)}>
      {children}
    </div>
  )
}

export function BrandCard({ 
  children, 
  variant = 'default',
  className 
}: { 
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'accent'
  className?: string 
}) {
  const variants = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-livrili-prussian/5 border border-livrili-prussian/20',
    accent: 'bg-livrili-papaya/30 border border-livrili-papaya',
  }

  return (
    <div className={cn(
      "rounded-2xl p-6 shadow-sm transition-all duration-200",
      variants[variant],
      className
    )}>
      {children}
    </div>
  )
}