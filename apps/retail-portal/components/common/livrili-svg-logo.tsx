'use client'

import React from 'react'
import { cn } from '@livrili/ui'

interface LivriliSVGLogoProps {
  variant?: 'full' | 'icon' | 'text' | 'stacked'
  size?: number | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'mono' | 'gradient'
  className?: string
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
}

// Livrili Icon - Box with checkmark
export function LivriliSVGIcon({ 
  size = 'md', 
  color = 'primary',
  className 
}: Omit<LivriliSVGLogoProps, 'variant'>) {
  const iconSize = typeof size === 'number' ? size : sizeMap[size]
  
  const colors = {
    primary: '#003049',
    white: '#FFFFFF',
    mono: '#374151',
    gradient: 'url(#brandGradient)',
  }

  return (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 100 100" 
      className={cn("flex-shrink-0", className)}
      role="img"
      aria-label="Livrili Logo"
    >
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#003049" />
          <stop offset="100%" stopColor="#669BBC" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#003049" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Box container */}
      <rect 
        x="10" y="15" 
        width="70" height="55" 
        rx="8" 
        fill={colors[color]}
        filter="url(#shadow)"
      />
      
      {/* Box lid */}
      <path 
        d="M 15 30 L 50 10 L 85 30 L 80 25 L 50 8 L 20 25 Z" 
        fill={color === 'gradient' ? colors[color] : '#669BBC'}
        opacity="0.9"
      />
      
      {/* Checkmark */}
      <path 
        d="M 30 45 L 42 57 L 65 35" 
        stroke={color === 'primary' ? '#669BBC' : '#003049'} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
        opacity="0.95"
      />
      
      {/* Side panel lines for 3D effect */}
      <line x1="80" y1="30" x2="80" y2="70" stroke="#002638" strokeWidth="1" opacity="0.6" />
      <line x1="15" y1="70" x2="80" y2="70" stroke="#002638" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

// Livrili Text Logo
export function LivriliSVGText({ 
  size = 'md', 
  color = 'primary',
  className 
}: Omit<LivriliSVGLogoProps, 'variant'>) {
  const textHeight = typeof size === 'number' ? size : sizeMap[size]
  const textWidth = textHeight * 2.8 // Approximate width ratio
  
  const colors = {
    primary: '#003049',
    white: '#FFFFFF',
    mono: '#374151',
    gradient: 'url(#textGradient)',
  }

  return (
    <svg 
      width={textWidth} 
      height={textHeight} 
      viewBox="0 0 280 100" 
      className={cn("flex-shrink-0", className)}
      role="img"
      aria-label="Livrili Text Logo"
    >
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#003049" />
          <stop offset="100%" stopColor="#669BBC" />
        </linearGradient>
      </defs>
      
      <text 
        x="140" 
        y="65" 
        textAnchor="middle" 
        fill={colors[color]}
        fontSize="48"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        letterSpacing="-0.025em"
      >
        Livrili
      </text>
      
      {/* Accent dot */}
      <circle 
        cx="250" 
        cy="35" 
        r="4" 
        fill="#C1121F"
        opacity="0.8"
      />
    </svg>
  )
}

// Full logo combining icon and text
export function LivriliSVGLogo({
  variant = 'full',
  size = 'md',
  color = 'primary',
  className
}: LivriliSVGLogoProps) {
  const logoHeight = typeof size === 'number' ? size : sizeMap[size]
  
  switch (variant) {
    case 'icon':
      return <LivriliSVGIcon size={size} color={color} className={className} />
    
    case 'text':
      return <LivriliSVGText size={size} color={color} className={className} />
      
    case 'stacked':
      return (
        <div className={cn("flex flex-col items-center space-y-2", className)}>
          <LivriliSVGIcon size={size} color={color} />
          <LivriliSVGText size={Math.floor(logoHeight * 0.6)} color={color} />
        </div>
      )
    
    case 'full':
    default:
      const logoWidth = logoHeight * 4 // Approximate width for horizontal layout
      return (
        <div className={cn("flex items-center space-x-3", className)}>
          <LivriliSVGIcon size={size} color={color} />
          <LivriliSVGText size={Math.floor(logoHeight * 0.8)} color={color} />
        </div>
      )
  }
}

// Brand mark variations
export function LivriliSVGBrandMark({ 
  size = 'md', 
  className,
  showBackground = true 
}: { 
  size?: number | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBackground?: boolean
}) {
  const markSize = typeof size === 'number' ? size : sizeMap[size]
  
  return (
    <svg 
      width={markSize} 
      height={markSize} 
      viewBox="0 0 100 100" 
      className={cn("flex-shrink-0", className)}
      role="img"
      aria-label="Livrili Brand Mark"
    >
      <defs>
        <linearGradient id="brandMarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#003049" />
          <stop offset="50%" stopColor="#669BBC" />
          <stop offset="100%" stopColor="#FDF0D5" />
        </linearGradient>
        <filter id="brandShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#003049" floodOpacity="0.25" />
        </filter>
      </defs>
      
      {showBackground && (
        <circle 
          cx="50" cy="50" r="45" 
          fill="url(#brandMarkGradient)"
          filter="url(#brandShadow)"
        />
      )}
      
      {/* Simplified box icon */}
      <rect 
        x="25" y="30" 
        width="50" height="35" 
        rx="4" 
        fill={showBackground ? "#FFFFFF" : "#003049"}
        opacity="0.95"
      />
      
      {/* Box lid */}
      <path 
        d="M 30 38 L 50 28 L 70 38 L 68 36 L 50 27 L 32 36 Z" 
        fill={showBackground ? "#003049" : "#669BBC"}
        opacity="0.8"
      />
      
      {/* Checkmark */}
      <path 
        d="M 35 48 L 43 56 L 58 42" 
        stroke={showBackground ? "#669BBC" : "#003049"}
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
    </svg>
  )
}