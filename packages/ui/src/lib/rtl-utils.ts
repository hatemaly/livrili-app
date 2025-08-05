import { clsx, type ClassValue } from 'clsx'

/**
 * RTL-aware class name utilities for consistent directional styling
 */

export interface RTLClassNames {
  marginStart: string
  marginEnd: string
  paddingStart: string
  paddingEnd: string
  textAlign: string
  borderStart: string
  borderEnd: string
  roundedStart: string
  roundedEnd: string
  left: string
  right: string
}

/**
 * Generate RTL-aware class names based on direction
 */
export function getRTLClasses(isRTL: boolean): RTLClassNames {
  return {
    marginStart: isRTL ? 'mr-' : 'ml-',
    marginEnd: isRTL ? 'ml-' : 'mr-',
    paddingStart: isRTL ? 'pr-' : 'pl-',
    paddingEnd: isRTL ? 'pl-' : 'pr-',
    textAlign: isRTL ? 'text-right' : 'text-left',
    borderStart: isRTL ? 'border-r' : 'border-l',
    borderEnd: isRTL ? 'border-l' : 'border-r',
    roundedStart: isRTL ? 'rounded-r' : 'rounded-l',
    roundedEnd: isRTL ? 'rounded-l' : 'rounded-r',
    left: isRTL ? 'right' : 'left',
    right: isRTL ? 'left' : 'right',
  }
}

/**
 * RTL-aware spacing utilities
 */
export const rtlSpacing = {
  marginStart: (size: string, isRTL: boolean) => isRTL ? `mr-${size}` : `ml-${size}`,
  marginEnd: (size: string, isRTL: boolean) => isRTL ? `ml-${size}` : `mr-${size}`,
  paddingStart: (size: string, isRTL: boolean) => isRTL ? `pr-${size}` : `pl-${size}`,
  paddingEnd: (size: string, isRTL: boolean) => isRTL ? `pl-${size}` : `pr-${size}`,
}

/**
 * RTL-aware border utilities
 */
export const rtlBorder = {
  start: (isRTL: boolean) => isRTL ? 'border-r' : 'border-l',
  end: (isRTL: boolean) => isRTL ? 'border-l' : 'border-r',
  startWidth: (width: string, isRTL: boolean) => isRTL ? `border-r-${width}` : `border-l-${width}`,
  endWidth: (width: string, isRTL: boolean) => isRTL ? `border-l-${width}` : `border-r-${width}`,
}

/**
 * RTL-aware border radius utilities
 */
export const rtlRadius = {
  start: (size: string, isRTL: boolean) => isRTL ? `rounded-r-${size}` : `rounded-l-${size}`,
  end: (size: string, isRTL: boolean) => isRTL ? `rounded-l-${size}` : `rounded-r-${size}`,
  topStart: (size: string, isRTL: boolean) => isRTL ? `rounded-tr-${size}` : `rounded-tl-${size}`,
  topEnd: (size: string, isRTL: boolean) => isRTL ? `rounded-tl-${size}` : `rounded-tr-${size}`,
  bottomStart: (size: string, isRTL: boolean) => isRTL ? `rounded-br-${size}` : `rounded-bl-${size}`,
  bottomEnd: (size: string, isRTL: boolean) => isRTL ? `rounded-bl-${size}` : `rounded-br-${size}`,
}

/**
 * RTL-aware positioning utilities
 */
export const rtlPosition = {
  start: (value: string, isRTL: boolean) => isRTL ? { right: value } : { left: value },
  end: (value: string, isRTL: boolean) => isRTL ? { left: value } : { right: value },
  startClass: (value: string, isRTL: boolean) => isRTL ? `right-${value}` : `left-${value}`,
  endClass: (value: string, isRTL: boolean) => isRTL ? `left-${value}` : `right-${value}`,
}

/**
 * RTL-aware text alignment
 */
export const rtlText = {
  start: (isRTL: boolean) => isRTL ? 'text-right' : 'text-left',
  end: (isRTL: boolean) => isRTL ? 'text-left' : 'text-right',
}

/**
 * RTL-aware flexbox utilities
 */
export const rtlFlex = {
  rowReverse: (isRTL: boolean) => isRTL ? 'flex-row-reverse' : 'flex-row',
  justifyStart: (isRTL: boolean) => isRTL ? 'justify-end' : 'justify-start',
  justifyEnd: (isRTL: boolean) => isRTL ? 'justify-start' : 'justify-end',
}

/**
 * Combine classes with RTL awareness
 * This function helps create conditional classes based on RTL direction
 */
export function rtlClsx(
  baseClasses: ClassValue,
  rtlClasses: ClassValue,
  ltrClasses: ClassValue,
  isRTL: boolean
) {
  return clsx(baseClasses, isRTL ? rtlClasses : ltrClasses)
}

/**
 * Transform CSS custom properties for RTL
 * Useful when working with CSS-in-JS or inline styles
 */
export function rtlTransform(styles: Record<string, any>, isRTL: boolean): Record<string, any> {
  if (!isRTL) return styles

  const transformed = { ...styles }

  // Transform directional properties
  if (transformed.marginLeft !== undefined) {
    transformed.marginRight = transformed.marginLeft
    delete transformed.marginLeft
  }
  if (transformed.marginRight !== undefined) {
    transformed.marginLeft = transformed.marginRight
    delete transformed.marginRight
  }
  if (transformed.paddingLeft !== undefined) {
    transformed.paddingRight = transformed.paddingLeft
    delete transformed.paddingLeft
  }
  if (transformed.paddingRight !== undefined) {
    transformed.paddingLeft = transformed.paddingRight
    delete transformed.paddingRight
  }
  if (transformed.left !== undefined) {
    transformed.right = transformed.left
    delete transformed.left
  }
  if (transformed.right !== undefined) {
    transformed.left = transformed.right
    delete transformed.right
  }
  if (transformed.textAlign === 'left') {
    transformed.textAlign = 'right'
  } else if (transformed.textAlign === 'right') {
    transformed.textAlign = 'left'
  }

  return transformed
}

/**
 * Get appropriate font class based on language
 */
export function getFontClass(language: 'ar' | 'fr' | 'en'): string {
  switch (language) {
    case 'ar':
      return 'font-arabic'
    case 'fr':
    case 'en':
    default:
      return 'font-inter'
  }
}

/**
 * Check if text contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  return arabicRegex.test(text)
}

/**
 * Auto-detect text direction based on content
 */
export function detectTextDirection(text: string): 'rtl' | 'ltr' {
  return containsArabic(text) ? 'rtl' : 'ltr'
}