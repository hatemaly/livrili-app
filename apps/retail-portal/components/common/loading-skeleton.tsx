'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'rectangular' | 'circular' | 'text'
  width?: string | number
  height?: string | number
  count?: number
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1 
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'text':
        return 'rounded h-4'
      default:
        return 'rounded-xl'
    }
  }

  const skeletonElement = (
    <div 
      className={`
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
        animate-pulse
        ${getVariantClasses()}
        ${className}
      `}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%')
      }}
    />
  )

  if (count === 1) {
    return skeletonElement
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {skeletonElement}
        </div>
      ))}
    </div>
  )
}

// Pre-built skeleton components for common use cases
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 animate-pulse">
      {/* Badge area */}
      <div className="flex justify-between items-start mb-3">
        <Skeleton variant="rectangular" width={60} height={20} />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      
      {/* Image */}
      <Skeleton variant="rectangular" className="w-full h-32 mb-4" />
      
      {/* Product info */}
      <div className="space-y-3">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={40} />
        </div>
        
        {/* Stock */}
        <Skeleton variant="text" className="w-1/2" />
        
        {/* Buttons */}
        <div className="space-y-2">
          <Skeleton variant="rectangular" className="w-full h-10" />
          <Skeleton variant="rectangular" className="w-full h-12" />
        </div>
      </div>
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* Image */}
        <Skeleton variant="rectangular" className="w-16 h-16 flex-shrink-0" />
        
        {/* Info */}
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Skeleton variant="rectangular" width={40} height={40} />
          <Skeleton variant="text" width={30} />
          <Skeleton variant="rectangular" width={40} height={40} />
        </div>
      </div>
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <div className="h-24 p-4 rounded-xl border-2 border-gray-200 animate-pulse">
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={80} />
        <Skeleton variant="text" width={60} />
      </div>
    </div>
  )
}

export function OrderItemSkeleton() {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Skeleton variant="text" width={60} />
          <Skeleton variant="rectangular" width={50} height={20} />
        </div>
        <Skeleton variant="text" width={80} />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={120} />
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Skeleton variant="rectangular" width={50} height={24} />
          <Skeleton variant="rectangular" width={50} height={24} />
        </div>
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="bg-white shadow-sm p-4 animate-pulse">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
      </div>
    </div>
  )
}