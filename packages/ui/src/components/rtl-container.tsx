'use client'

import React from 'react'
import { useLanguage, useRTL } from '../providers/language-provider'
import { cn } from '../lib/utils'
import { getFontClass } from '../lib/rtl-utils'

interface RTLContainerProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

/**
 * RTL-aware container component that automatically applies:
 * - Appropriate font family based on language
 * - Direction-aware styling
 * - Language-specific text rendering
 */
export function RTLContainer({ 
  children, 
  className,
  as: Component = 'div' 
}: RTLContainerProps) {
  const { language, direction } = useLanguage()
  const { isRTL } = useRTL()

  const fontClass = getFontClass(language)
  
  return (
    <Component
      dir={direction}
      className={cn(
        fontClass,
        isRTL && 'text-right',
        className
      )}
    >
      {children}
    </Component>
  )
}

interface RTLTextProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  autoDetect?: boolean // Auto-detect direction based on content
}

/**
 * RTL-aware text component with optional auto-detection
 */
export function RTLText({ 
  children, 
  className,
  as: Component = 'span',
  autoDetect = false
}: RTLTextProps) {
  const { language, direction } = useLanguage()
  const { isRTL } = useRTL()

  const fontClass = getFontClass(language)
  
  // Auto-detect direction if enabled and children is string
  let textDirection = direction
  if (autoDetect && typeof children === 'string') {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    textDirection = arabicRegex.test(children) ? 'rtl' : 'ltr'
  }
  
  return (
    <Component
      dir={textDirection}
      className={cn(
        fontClass,
        textDirection === 'rtl' && 'text-right',
        textDirection === 'ltr' && 'text-left',
        className
      )}
    >
      {children}
    </Component>
  )
}

interface RTLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/**
 * RTL-aware input component
 */
export function RTLInput({ 
  label, 
  error, 
  className, 
  type = 'text',
  ...props 
}: RTLInputProps) {
  const { language, direction } = useLanguage()
  const { isRTL } = useRTL()

  const fontClass = getFontClass(language)
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            fontClass,
            isRTL ? 'text-right' : 'text-left'
          )}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        dir={direction}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          fontClass,
          isRTL ? 'text-right' : 'text-left',
          // Special handling for number inputs (should remain LTR)
          type === 'number' && 'text-left',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
      {error && (
        <p className={cn(
          'text-sm text-destructive',
          fontClass,
          isRTL ? 'text-right' : 'text-left'
        )}>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * RTL-aware grid component for layouts
 */
export function RTLGrid({ 
  children, 
  className,
  cols = 1,
  gap = 4 
}: {
  children: React.ReactNode
  className?: string
  cols?: number
  gap?: number
}) {
  const { isRTL } = useRTL()
  
  return (
    <div 
      className={cn(
        'grid',
        `grid-cols-${cols}`,
        `gap-${gap}`,
        isRTL && 'direction-rtl',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * RTL-aware flex component
 */
export function RTLFlex({ 
  children, 
  className,
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  gap = 0
}: {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  gap?: number
}) {
  const { isRTL } = useRTL()
  
  const flexDirection = direction === 'row' 
    ? (isRTL ? 'flex-row-reverse' : 'flex-row')
    : 'flex-col'
    
  const justifyClass = (() => {
    switch (justify) {
      case 'start': return isRTL && direction === 'row' ? 'justify-end' : 'justify-start'
      case 'end': return isRTL && direction === 'row' ? 'justify-start' : 'justify-end'
      case 'center': return 'justify-center'
      case 'between': return 'justify-between'
      case 'around': return 'justify-around'
      case 'evenly': return 'justify-evenly'
      default: return 'justify-start'
    }
  })()
  
  const alignClass = (() => {
    switch (align) {
      case 'start': return 'items-start'
      case 'end': return 'items-end'
      case 'center': return 'items-center'
      case 'stretch': return 'items-stretch'
      case 'baseline': return 'items-baseline'
      default: return 'items-stretch'
    }
  })()
  
  return (
    <div 
      className={cn(
        'flex',
        flexDirection,
        justifyClass,
        alignClass,
        gap > 0 && `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  )
}