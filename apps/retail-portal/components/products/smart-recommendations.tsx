'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button, useLanguage, useRTL } from '@livrili/ui'
import { HapticButton } from '@/components/common/haptic-button'
import { EnhancedProductCard } from './enhanced-product-card'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: Array<{
    id: string
    url: string
    alt: string
  }>
  category: string
  brand?: string
  stock: number
  rating?: number
  reviewCount?: number
  tags?: string[]
  isNew?: boolean
  isOnSale?: boolean
  discount?: number
}

interface RecommendationSection {
  id: string
  title: string
  description?: string
  type: 'trending' | 'personalized' | 'similar' | 'recently_viewed' | 'best_sellers' | 'new_arrivals' | 'deals'
  products: Product[]
  algorithm?: string
  confidence?: number
  reason?: string
}

interface SmartRecommendationsProps {
  sections: RecommendationSection[]
  onAddToCart?: (productId: string, quantity?: number) => void
  onProductClick?: (product: Product) => void
  onQuickView?: (product: Product) => void
  onWishlistToggle?: (productId: string) => void
  cartItems?: string[]
  wishlistItems?: string[]
  isLoading?: boolean
  error?: string
  onRefresh?: () => void
  className?: string
}

export function SmartRecommendations({
  sections,
  onAddToCart,
  onProductClick,
  onQuickView,
  onWishlistToggle,
  cartItems = [],
  wishlistItems = [],
  isLoading = false,
  error,
  onRefresh,
  className = ''
}: SmartRecommendationsProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [activeSection, setActiveSection] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel')
  const scrollContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const sectionIcons = {
    trending: '📈',
    personalized: '🎯',
    similar: '🔄',
    recently_viewed: '👁️',
    best_sellers: '🏆',
    new_arrivals: '✨',
    deals: '🏷️'
  }

  const sectionColors = {
    trending: 'text-orange-600 bg-orange-50 border-orange-200',
    personalized: 'text-purple-600 bg-purple-50 border-purple-200',
    similar: 'text-blue-600 bg-blue-50 border-blue-200',
    recently_viewed: 'text-gray-600 bg-gray-50 border-gray-200',
    best_sellers: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    new_arrivals: 'text-green-600 bg-green-50 border-green-200',
    deals: 'text-red-600 bg-red-50 border-red-200'
  }

  const scrollLeft = (sectionId: string) => {
    const container = scrollContainerRefs.current[sectionId]
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = (sectionId: string) => {
    const container = scrollContainerRefs.current[sectionId]
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const handleProductClick = (product: Product) => {
    onProductClick?.(product)
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('recommendations.error_title', 'Failed to load recommendations')}
        </h3>
        <p className="text-gray-600 mb-4">
          {error}
        </p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="brand" size="sm">
            {t('recommendations.try_again', 'Try Again')}
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          {/* Section headers */}
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="h-6 bg-gray-200 rounded w-32" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
              
              {/* Product cards skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="space-y-3">
                    <div className="aspect-square bg-gray-200 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!sections || sections.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('recommendations.no_recommendations', 'No recommendations available')}
        </h3>
        <p className="text-gray-600">
          {t('recommendations.no_recommendations_desc', 'Browse products to get personalized recommendations')}
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {sections.map((section, sectionIndex) => {
        if (!section.products || section.products.length === 0) return null

        return (
          <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-lg border flex items-center justify-center text-lg
                    ${sectionColors[section.type] || 'text-gray-600 bg-gray-50 border-gray-200'}
                  `}>
                    {sectionIcons[section.type] || '📦'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Algorithm info */}
                  {section.algorithm && section.confidence && (
                    <div className="text-xs text-gray-500 text-right">
                      <div>{section.algorithm}</div>
                      <div>{Math.round(section.confidence * 100)}% confidence</div>
                    </div>
                  )}
                  
                  {/* View mode toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('carousel')}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === 'carousel' 
                          ? 'bg-white text-livrili-prussian shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title={t('recommendations.carousel_view', 'Carousel view')}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-livrili-prussian shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title={t('recommendations.grid_view', 'Grid view')}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Reason for recommendation */}
              {section.reason && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 text-blue-600 mt-0.5">
                      💡
                    </div>
                    <p className="text-sm text-blue-800">
                      {section.reason}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Products */}
            <div className="p-6">
              {viewMode === 'carousel' ? (
                <div className="relative">
                  {/* Navigation buttons */}
                  <button
                    onClick={() => scrollLeft(section.id)}
                    className={`
                      absolute ${isRTL ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2 z-10
                      w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg
                      flex items-center justify-center transition-all duration-200
                      hover:scale-105 active:scale-95
                    `}
                  >
                    <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => scrollRight(section.id)}
                    className={`
                      absolute ${isRTL ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 z-10
                      w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg
                      flex items-center justify-center transition-all duration-200
                      hover:scale-105 active:scale-95
                    `}
                  >
                    <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                    </svg>
                  </button>

                  {/* Carousel container */}
                  <div
                    ref={(el) => (scrollContainerRefs.current[section.id] = el)}
                    className="flex space-x-4 overflow-x-auto scrollbar-hide py-2 px-12"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {section.products.map(product => (
                      <div key={product.id} className="flex-shrink-0 w-64">
                        <EnhancedProductCard
                          product={product}
                          onAddToCart={onAddToCart}
                          onQuickView={onQuickView}
                          onWishlistToggle={onWishlistToggle}
                          isInCart={cartItems.includes(product.id)}
                          isInWishlist={wishlistItems.includes(product.id)}
                          variant="grid"
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Grid view
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {section.products.map(product => (
                    <EnhancedProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onQuickView={onQuickView}
                      onWishlistToggle={onWishlistToggle}
                      isInCart={cartItems.includes(product.id)}
                      isInWishlist={wishlistItems.includes(product.id)}
                      variant="grid"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* View all button */}
            {section.products.length > (viewMode === 'carousel' ? 5 : 10) && (
              <div className="px-6 pb-6">
                <Button
                  onClick={() => {
                    // Handle view all - could navigate to a filtered products page
                    console.log(`View all ${section.type} products`)
                  }}
                  variant="ghost"
                  className="w-full border border-gray-200 hover:bg-gray-50"
                >
                  {t('recommendations.view_all', 'View All')} {section.title}
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}