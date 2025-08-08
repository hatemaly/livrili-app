'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button, useLanguage, useRTL } from '@livrili/ui'
import { HapticButton } from '@/components/common/haptic-button'
import { useToastHelpers } from '@/components/common/toast-system'

interface ProductFeature {
  name: string
  value: string | number | boolean
  type: 'text' | 'number' | 'boolean' | 'rating'
  category?: string
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  brand: string
  category: string
  rating?: number
  reviewCount?: number
  stock: number
  features: ProductFeature[]
  tags?: string[]
}

interface ProductComparisonProps {
  products: Product[]
  onAddToCart?: (productId: string) => void
  onRemoveFromComparison?: (productId: string) => void
  onClearAll?: () => void
  isOpen: boolean
  onClose: () => void
  maxProducts?: number
  className?: string
}

export function ProductComparison({
  products,
  onAddToCart,
  onRemoveFromComparison,
  onClearAll,
  isOpen,
  onClose,
  maxProducts = 4,
  className = ''
}: ProductComparisonProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const { success, warning } = useToastHelpers()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'specs'>('overview')
  const [highlightDifferences, setHighlightDifferences] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleAddToCart = (productId: string) => {
    onAddToCart?.(productId)
    success(t('comparison.added_to_cart', 'Added to cart'))
  }

  const handleRemoveProduct = (productId: string) => {
    onRemoveFromComparison?.(productId)
    success(t('comparison.product_removed', 'Product removed from comparison'))
  }

  const handleClearAll = () => {
    onClearAll?.()
    success(t('comparison.cleared', 'Comparison cleared'))
    onClose()
  }

  // Group features by category
  const featureCategories = React.useMemo(() => {
    const categories: { [key: string]: ProductFeature[] } = {}
    
    if (products.length === 0) return categories

    products[0].features.forEach(feature => {
      const category = feature.category || t('comparison.general', 'General')
      if (!categories[category]) {
        categories[category] = []
      }
      
      // Add the feature if it's not already in the category
      if (!categories[category].find(f => f.name === feature.name)) {
        categories[category].push(feature)
      }
    })

    return categories
  }, [products, t])

  // Check if values are different across products for highlighting
  const isValueDifferent = (featureName: string) => {
    if (products.length <= 1) return false
    
    const values = products.map(product => {
      const feature = product.features.find(f => f.name === featureName)
      return feature?.value
    })
    
    return new Set(values).size > 1
  }

  // Get winner for a specific feature (lowest price, highest rating, etc.)
  const getWinner = (featureName: string) => {
    if (products.length <= 1) return null
    
    if (featureName === 'price') {
      return products.reduce((winner, product, index) => 
        product.price < products[winner].price ? index : winner, 0
      )
    }
    
    if (featureName === 'rating') {
      return products.reduce((winner, product, index) => {
        const currentRating = product.rating || 0
        const winnerRating = products[winner].rating || 0
        return currentRating > winnerRating ? index : winner
      }, 0)
    }
    
    const feature = products[0].features.find(f => f.name === featureName)
    if (!feature || feature.type !== 'number') return null
    
    return products.reduce((winner, product, index) => {
      const currentFeature = product.features.find(f => f.name === featureName)
      const winnerFeature = products[winner].features.find(f => f.name === featureName)
      
      if (!currentFeature || !winnerFeature) return winner
      
      const currentValue = Number(currentFeature.value)
      const winnerValue = Number(winnerFeature.value)
      
      return currentValue > winnerValue ? index : winner
    }, 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('comparison.title', 'Product Comparison')}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {products.length} {t('comparison.of', 'of')} {maxProducts} {t('comparison.products', 'products')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Highlight differences toggle */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={highlightDifferences}
                  onChange={(e) => setHighlightDifferences(e.target.checked)}
                  className="rounded border-gray-300 text-livrili-prussian focus:ring-livrili-prussian"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {t('comparison.highlight_differences', 'Highlight differences')}
                </span>
              </label>
              
              {onClearAll && (
                <Button
                  onClick={handleClearAll}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  {t('comparison.clear_all', 'Clear All')}
                </Button>
              )}
              
              <HapticButton
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </HapticButton>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: 'overview', label: t('comparison.tab_overview', 'Overview') },
              { id: 'features', label: t('comparison.tab_features', 'Features') },
              { id: 'specs', label: t('comparison.tab_specifications', 'Specifications') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex-1 py-3 px-4 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'text-livrili-prussian border-b-2 border-livrili-prussian bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {products.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center h-64 p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('comparison.empty_title', 'No products to compare')}
                </h3>
                <p className="text-gray-500 text-center">
                  {t('comparison.empty_message', 'Add products to comparison to see them here')}
                </p>
              </div>
            ) : (
              // Comparison table
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {activeTab === 'overview' && (
                    <div className="p-6">
                      {/* Product cards */}
                      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
                        {products.map((product, index) => {
                          const isPriceWinner = getWinner('price') === index
                          const isRatingWinner = getWinner('rating') === index
                          
                          return (
                            <div key={product.id} className="bg-gray-50 rounded-xl p-4 relative">
                              {/* Winner badges */}
                              {isPriceWinner && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  {t('comparison.best_price', 'Best Price')}
                                </div>
                              )}
                              {isRatingWinner && product.rating && (
                                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                  {t('comparison.top_rated', 'Top Rated')}
                                </div>
                              )}
                              
                              {/* Remove button */}
                              <button
                                onClick={() => handleRemoveProduct(product.id)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                                title={t('comparison.remove_product', 'Remove product')}
                              >
                                ×
                              </button>
                              
                              {/* Product image */}
                              <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-4 mt-8">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                />
                              </div>
                              
                              {/* Product info */}
                              <div className="space-y-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {product.brand} • {product.category}
                                  </p>
                                </div>
                                
                                {/* Rating */}
                                {product.rating && (
                                  <div className="flex items-center">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < Math.floor(product.rating!) 
                                              ? 'text-yellow-400' 
                                              : 'text-gray-300'
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({product.reviewCount || 0})
                                    </span>
                                  </div>
                                )}
                                
                                {/* Price */}
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-lg font-bold ${isPriceWinner ? 'text-green-600' : 'text-livrili-prussian'}`}>
                                      {formatPrice(product.price)}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                      <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(product.originalPrice)}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="text-xs text-green-600">
                                      {t('comparison.save', 'Save')} {formatPrice(product.originalPrice - product.price)}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Stock */}
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    product.stock > 10 ? 'bg-green-500' : 
                                    product.stock > 0 ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                  }`} />
                                  <span className="text-xs text-gray-600">
                                    {product.stock > 0 ? (
                                      `${product.stock} ${t('comparison.in_stock', 'in stock')}`
                                    ) : (
                                      t('comparison.out_of_stock', 'Out of stock')
                                    )}
                                  </span>
                                </div>
                                
                                {/* Add to cart */}
                                <Button
                                  onClick={() => handleAddToCart(product.id)}
                                  disabled={product.stock === 0}
                                  className="w-full"
                                  size="sm"
                                  variant="brand"
                                >
                                  {product.stock === 0 
                                    ? t('comparison.out_of_stock', 'Out of Stock')
                                    : t('comparison.add_to_cart', 'Add to Cart')
                                  }
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'features' && (
                    <div className="p-6">
                      <div className="space-y-6">
                        {Object.entries(featureCategories).map(([category, features]) => (
                          <div key={category}>
                            <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                              {category}
                            </h3>
                            
                            <div className="space-y-2">
                              {features.map(feature => {
                                const isDifferent = isValueDifferent(feature.name)
                                const winner = getWinner(feature.name)
                                
                                return (
                                  <div 
                                    key={feature.name}
                                    className={`
                                      grid gap-4 py-2 px-3 rounded-lg
                                      ${highlightDifferences && isDifferent ? 'bg-yellow-50 border border-yellow-200' : ''}
                                    `}
                                    style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                                  >
                                    <div className="font-medium text-gray-700 text-sm">
                                      {feature.name}
                                    </div>
                                    
                                    {products.map((product, index) => {
                                      const productFeature = product.features.find(f => f.name === feature.name)
                                      const isWinner = winner === index
                                      
                                      return (
                                        <div 
                                          key={`${product.id}-${feature.name}`}
                                          className={`text-sm ${isWinner ? 'font-semibold text-green-600' : 'text-gray-600'}`}
                                        >
                                          {productFeature ? (
                                            feature.type === 'boolean' ? (
                                              productFeature.value ? '✅' : '❌'
                                            ) : feature.type === 'rating' ? (
                                              <div className="flex items-center">
                                                <span>{productFeature.value}</span>
                                                <svg className="h-3 w-3 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                              </div>
                                            ) : (
                                              String(productFeature.value)
                                            )
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                          {isWinner && (
                                            <span className="ml-2 text-xs text-green-600">👑</span>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'specs' && (
                    <div className="p-6">
                      <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                        {/* Header */}
                        <div className="font-semibold text-gray-900">
                          {t('comparison.specification', 'Specification')}
                        </div>
                        {products.map(product => (
                          <div key={product.id} className="text-center">
                            <div className="font-semibold text-gray-900 text-sm">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {product.brand}
                            </div>
                          </div>
                        ))}
                        
                        {/* Specifications rows */}
                        {[
                          { label: t('comparison.price', 'Price'), key: 'price', type: 'price' },
                          { label: t('comparison.brand', 'Brand'), key: 'brand', type: 'text' },
                          { label: t('comparison.category', 'Category'), key: 'category', type: 'text' },
                          { label: t('comparison.rating', 'Rating'), key: 'rating', type: 'rating' },
                          { label: t('comparison.stock', 'Stock'), key: 'stock', type: 'number' },
                        ].map(spec => {
                          const isDifferent = spec.key !== 'category' && isValueDifferent(spec.key)
                          const winner = getWinner(spec.key)
                          
                          return (
                            <React.Fragment key={spec.key}>
                              <div className={`
                                py-3 px-3 font-medium text-gray-700 text-sm
                                ${highlightDifferences && isDifferent ? 'bg-yellow-50' : ''}
                              `}>
                                {spec.label}
                              </div>
                              
                              {products.map((product, index) => {
                                const isWinner = winner === index
                                let value: any
                                
                                switch (spec.key) {
                                  case 'price':
                                    value = formatPrice(product.price)
                                    break
                                  case 'rating':
                                    value = product.rating ? `${product.rating} ⭐` : '-'
                                    break
                                  default:
                                    value = (product as any)[spec.key] || '-'
                                }
                                
                                return (
                                  <div 
                                    key={`${product.id}-${spec.key}`}
                                    className={`
                                      py-3 px-3 text-sm text-center
                                      ${highlightDifferences && isDifferent ? 'bg-yellow-50' : ''}
                                      ${isWinner ? 'font-semibold text-green-600' : 'text-gray-600'}
                                    `}
                                  >
                                    {value}
                                    {isWinner && <span className="ml-1">👑</span>}
                                  </div>
                                )
                              })}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}