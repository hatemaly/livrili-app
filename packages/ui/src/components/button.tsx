import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'

/**
 * Button component with Livrili brand variants
 * 
 * Brand Colors:
 * - Prussian Blue (#003049): Primary brand color
 * - Fire Brick (#C1121F): Secondary brand color
 * - Air Blue (#669BBC): Accent color for dark mode
 * - Papaya Whip (#FDF0D5): Light background color
 * 
 * Available brand variants:
 * - brand: Solid Prussian Blue button
 * - brand-secondary: Solid Fire Brick button
 * - brand-outline: Outlined Prussian Blue button
 * - brand-secondary-outline: Outlined Fire Brick button
 * - brand-ghost: Ghost Prussian Blue button with subtle hover
 * - brand-subtle: Subtle button with Papaya Whip background
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Livrili brand variants
        brand: 'bg-livrili-prussian text-white hover:bg-livrili-prussian/90 focus:ring-livrili-prussian/20 dark:bg-livrili-prussian dark:hover:bg-livrili-prussian/80',
        'brand-secondary': 'bg-livrili-fire text-white hover:bg-livrili-fire/90 focus:ring-livrili-fire/20 dark:bg-livrili-fire dark:hover:bg-livrili-fire/80',
        'brand-outline': 'border border-livrili-prussian text-livrili-prussian hover:bg-livrili-prussian hover:text-white focus:ring-livrili-prussian/20 dark:border-livrili-prussian dark:text-livrili-prussian dark:hover:bg-livrili-prussian dark:hover:text-white',
        'brand-secondary-outline': 'border border-livrili-fire text-livrili-fire hover:bg-livrili-fire hover:text-white focus:ring-livrili-fire/20 dark:border-livrili-fire dark:text-livrili-fire dark:hover:bg-livrili-fire dark:hover:text-white',
        'brand-ghost': 'text-livrili-prussian hover:bg-livrili-prussian/10 hover:text-livrili-prussian focus:ring-livrili-prussian/20 dark:text-livrili-air dark:hover:bg-livrili-air/10 dark:hover:text-livrili-air',
        'brand-subtle': 'bg-livrili-papaya text-livrili-prussian hover:bg-livrili-papaya/80 focus:ring-livrili-prussian/20 dark:bg-livrili-prussian/10 dark:text-livrili-air dark:hover:bg-livrili-prussian/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }