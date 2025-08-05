import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import Image from 'next/image'

import { cn } from '../../lib/utils'

const imageLogoVariants = cva(
  'inline-flex items-center gap-2 transition-opacity hover:opacity-80',
  {
    variants: {
      variant: {
        default: '',
        inverse: '',
        muted: 'opacity-70',
        secondary: '',
      },
      size: {
        xs: 'h-6',
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
        xl: 'h-16',
        '2xl': 'h-20',
        '3xl': 'h-24',
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

const heightMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
  '3xl': 96,
} as const

export interface ImageLogoProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof imageLogoVariants> {
  showText?: boolean
  iconOnly?: boolean
  textOnly?: boolean
  href?: string
  asLink?: boolean
  priority?: boolean
}

// Image-based logo component using official brand assets
const ImageLogo = React.forwardRef<HTMLDivElement, ImageLogoProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    layout = 'horizontal',
    showText = true,
    iconOnly = false,
    textOnly = false,
    href,
    asLink = false,
    priority = false,
    ...props 
  }, ref) => {
    // Handle exclusive display options
    const displayIcon = iconOnly || (!textOnly && !iconOnly)
    const displayText = textOnly || (showText && !iconOnly)
    
    const logoHeight = heightMap[size]
    
    // Choose the appropriate logo based on variant and text display
    const getLogoSrc = () => {
      if (variant === 'inverse') {
        return '/livrili-logo-white.png'
      }
      
      if (iconOnly || !displayText) {
        return '/livrili-icon-square.png'
      }
      
      if (size === 'xs' || size === 'sm') {
        return '/livrili-logo-small.png'
      }
      
      return '/livrili-logo-primary.png'
    }

    const content = (
      <div
        className={cn(imageLogoVariants({ variant, size, layout, className }))}
        ref={ref}
        {...props}
      >
        {displayIcon && (
          <Image
            src={getLogoSrc()}
            alt="Livrili"
            height={logoHeight}
            width={displayText && !iconOnly ? logoHeight * 3 : logoHeight}
            priority={priority}
            className={cn(
              'object-contain',
              layout === 'vertical' ? 'mb-0.5' : ''
            )}
          />
        )}
        {displayText && !iconOnly && getLogoSrc().includes('icon-square') && (
          <span 
            className={cn(
              'font-bold tracking-tight select-none',
              size === 'xs' && 'text-sm',
              size === 'sm' && 'text-base',
              size === 'md' && 'text-lg',
              size === 'lg' && 'text-xl',
              size === 'xl' && 'text-2xl',
              size === '2xl' && 'text-3xl',
              size === '3xl' && 'text-4xl',
              variant === 'inverse' ? 'text-white' : 'text-livrili-prussian',
              variant === 'muted' && 'text-gray-600',
              variant === 'secondary' && 'text-livrili-fire',
              layout === 'vertical' && ['xs', 'sm'].includes(size) && 'text-xs'
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
ImageLogo.displayName = 'ImageLogo'

// Preset logo variants for common use cases using brand assets
export const ImageLogoHeader = React.forwardRef<HTMLDivElement, Omit<ImageLogoProps, 'size' | 'variant'>>(
  (props, ref) => (
    <ImageLogo ref={ref} size="lg" variant="default" priority {...props} />
  )
)
ImageLogoHeader.displayName = 'ImageLogoHeader'

export const ImageLogoFooter = React.forwardRef<HTMLDivElement, Omit<ImageLogoProps, 'size' | 'variant'>>(
  (props, ref) => (
    <ImageLogo ref={ref} size="sm" variant="muted" {...props} />
  )
)
ImageLogoFooter.displayName = 'ImageLogoFooter'

export const ImageLogoFavicon = React.forwardRef<HTMLDivElement, Omit<ImageLogoProps, 'size' | 'iconOnly'>>(
  (props, ref) => (
    <ImageLogo ref={ref} size="sm" iconOnly {...props} />
  )
)
ImageLogoFavicon.displayName = 'ImageLogoFavicon'

export const ImageLogoBrand = React.forwardRef<HTMLDivElement, Omit<ImageLogoProps, 'size' | 'variant' | 'layout'>>(
  (props, ref) => (
    <ImageLogo ref={ref} size="2xl" variant="default" layout="vertical" priority {...props} />
  )
)
ImageLogoBrand.displayName = 'ImageLogoBrand'

export { ImageLogo, imageLogoVariants }