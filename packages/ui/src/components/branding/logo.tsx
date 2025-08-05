import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, Package } from 'lucide-react'

import { cn } from '../../lib/utils'

const logoVariants = cva(
  'inline-flex items-center gap-2 transition-colors',
  {
    variants: {
      variant: {
        default: 'text-livrili-prussian',
        inverse: 'text-white',
        muted: 'text-gray-600',
        secondary: 'text-livrili-fire',
      },
      size: {
        xs: 'text-sm',
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl',
        xl: 'text-2xl',
        '2xl': 'text-3xl',
        '3xl': 'text-4xl',
      },
      layout: {
        horizontal: 'flex-row',
        vertical: 'flex-col items-center gap-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      layout: 'horizontal',
    },
  }
)

const iconSizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const

const textSizeMap = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
  '2xl': 'text-3xl',
  '3xl': 'text-4xl',
} as const

export interface LogoIconProps {
  size?: keyof typeof iconSizeMap
  className?: string
  variant?: 'default' | 'inverse' | 'muted' | 'secondary'
}

// Standalone logo icon component
export const LogoIcon = React.forwardRef<SVGSVGElement, LogoIconProps>(
  ({ size = 'md', className, variant = 'default', ...props }, ref) => {
    const iconSize = iconSizeMap[size]
    
    const colorClasses = {
      default: 'text-livrili-prussian',
      inverse: 'text-white',
      muted: 'text-gray-600',
      secondary: 'text-livrili-fire',
    }

    return (
      <div className={cn('relative inline-flex', className)}>
        <Package 
          ref={ref}
          size={iconSize} 
          className={cn('drop-shadow-sm', colorClasses[variant])}
          {...props}
        />
        <Check 
          size={iconSize * 0.6} 
          className={cn(
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
            'font-bold stroke-[3]',
            variant === 'inverse' ? 'text-livrili-prussian' : 'text-white'
          )}
        />
      </div>
    )
  }
)
LogoIcon.displayName = 'LogoIcon'

export interface LogoProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logoVariants> {
  showIcon?: boolean
  showText?: boolean
  iconOnly?: boolean
  textOnly?: boolean
  href?: string
  asLink?: boolean
}

// Main logo component
const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ 
    className, 
    variant, 
    size, 
    layout,
    showIcon = true,
    showText = true,
    iconOnly = false,
    textOnly = false,
    href,
    asLink = false,
    ...props 
  }, ref) => {
    // Handle exclusive display options
    const displayIcon = iconOnly || (showIcon && !textOnly)
    const displayText = textOnly || (showText && !iconOnly)
    
    const content = (
      <div
        className={cn(logoVariants({ variant, size, layout, className }))}
        ref={ref}
        {...props}
      >
        {displayIcon && (
          <LogoIcon 
            size={size || 'md'} 
            variant={variant || 'default'}
            className={layout === 'vertical' ? 'mb-0.5' : ''}
          />
        )}
        {displayText && (
          <span 
            className={cn(
              'font-bold tracking-tight select-none',
              textSizeMap[size || 'md'],
              layout === 'vertical' && size && ['xs', 'sm'].includes(size) && 'text-xs'
            )}
          >
            Livrili
          </span>
        )}
      </div>
    )

    if (asLink && href) {
      return (
        <a 
          href={href}
          className="inline-block hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-livrili-prussian focus:ring-offset-2 rounded-sm"
        >
          {content}
        </a>
      )
    }

    return content
  }
)
Logo.displayName = 'Logo'

// Preset logo variants for common use cases
export const LogoHeader = React.forwardRef<HTMLDivElement, Omit<LogoProps, 'size' | 'variant'>>(
  (props, ref) => (
    <Logo ref={ref} size="lg" variant="default" {...props} />
  )
)
LogoHeader.displayName = 'LogoHeader'

export const LogoFooter = React.forwardRef<HTMLDivElement, Omit<LogoProps, 'size' | 'variant'>>(
  (props, ref) => (
    <Logo ref={ref} size="sm" variant="muted" {...props} />
  )
)
LogoFooter.displayName = 'LogoFooter'

export const LogoFavicon = React.forwardRef<HTMLDivElement, Omit<LogoProps, 'size' | 'iconOnly'>>(
  (props, ref) => (
    <Logo ref={ref} size="sm" iconOnly {...props} />
  )
)
LogoFavicon.displayName = 'LogoFavicon'

export const LogoBrand = React.forwardRef<HTMLDivElement, Omit<LogoProps, 'size' | 'variant' | 'layout'>>(
  (props, ref) => (
    <Logo ref={ref} size="2xl" variant="default" layout="vertical" {...props} />
  )
)
LogoBrand.displayName = 'LogoBrand'

export { Logo, logoVariants }