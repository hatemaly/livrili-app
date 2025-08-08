'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button, useLanguage, useRTL } from '@livrili/ui'
import { HapticButton } from '@/components/common/haptic-button'

interface ProductImage {
  id: string
  url: string
  alt: string
  isMain?: boolean
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  images: ProductImage[]
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

interface EnhancedProductCardProps {
  product: Product
  onAddToCart?: (productId: string, quantity?: number) => void
  onQuickView?: (product: Product) => void
  onCompare?: (product: Product) => void
  isInCart?: boolean
  isInCompare?: boolean
  isInWishlist?: boolean
  onWishlistToggle?: (productId: string) => void
  className?: string
  variant?: 'grid' | 'list'
}

export function EnhancedProductCard({
  product,
  onAddToCart,
  onQuickView,
  onCompare,
  isInCart = false,
  isInCompare = false,
  isInWishlist = false,
  onWishlistToggle,
  className = '',
  variant = 'grid'
}: EnhancedProductCardProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showActions, setShowActions] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = useCallback(() => {
    onAddToCart?.(product.id, quantity)
  }, [onAddToCart, product.id, quantity])

  const handleImageLoad = () => {
    setIsImageLoading(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    )
  }

  const currentImage = product.images[currentImageIndex] || product.images[0]

  if (variant === 'list') {
    return (
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
        <div className="flex p-4 space-x-4 rtl:space-x-reverse">
          {/* Image Gallery */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
              {isImageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              <Image
                src={currentImage?.url || '/placeholder-product.jpg'}
                alt={currentImage?.alt || product.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                onLoad={handleImageLoad}
                sizes="96px"
              />
              
              {/* Image indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>
                )}
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mt-1">
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
                      ({product.reviewCount})
                    </span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                  <span className="text-lg font-bold text-livrili-prussian">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.discount && (
                    <span className="text-xs bg-livrili-fire text-white px-2 py-0.5 rounded-full">
                      -{product.discount}%
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end space-y-1 ml-2">
                <HapticButton
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isInCart}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    isInCart
                      ? 'bg-green-100 text-green-800'
                      : product.stock === 0
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-livrili-prussian text-white hover:bg-livrili-prussian/90'
                  }`}
                >
                  {isInCart ? '✓ Added' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </HapticButton>
                
                <div className="flex items-center space-x-1">
                  <HapticButton
                    onClick={() => onQuickView?.(product)}
                    className="p-1.5 text-gray-500 hover:text-livrili-prussian hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </HapticButton>
                  
                  <HapticButton
                    onClick={() => onWishlistToggle?.(product.id)}
                    className="p-1.5 text-gray-500 hover:text-livrili-fire hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </HapticButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid variant (default)
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 
        transform hover:-translate-y-1 group ${className}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
        {product.isNew && (
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {t('product.new', 'New')}
          </span>
        )}
        {product.isOnSale && (
          <span className="bg-livrili-fire text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {t('product.sale', 'Sale')}
          </span>
        )}
        {product.discount && (
          <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <div className="absolute top-2 right-2 z-10">
        <HapticButton
          onClick={() => onWishlistToggle?.(product.id)}
          className={`
            p-2 rounded-full transition-all duration-200
            ${isInWishlist 
              ? 'bg-livrili-fire/10 text-livrili-fire' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-livrili-fire'
            }
          `}
        >
          <svg className="h-5 w-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </HapticButton>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <Image
          src={currentImage?.url || '/placeholder-product.jpg'}
          alt={currentImage?.alt || product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Image Navigation */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className={`
                absolute top-1/2 transform -translate-y-1/2 z-10 p-2 
                bg-white/80 hover:bg-white rounded-full shadow-md
                transition-all duration-200 opacity-0 group-hover:opacity-100
                ${isRTL ? 'right-2' : 'left-2'}
              `}
            >
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextImage}
              className={`
                absolute top-1/2 transform -translate-y-1/2 z-10 p-2 
                bg-white/80 hover:bg-white rounded-full shadow-md
                transition-all duration-200 opacity-0 group-hover:opacity-100
                ${isRTL ? 'left-2' : 'right-2'}
              `}
            >
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-200
                    ${index === currentImageIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/60 hover:bg-white/80'
                    }
                  `}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick Actions Overlay */}
        <div className={`
          absolute inset-0 bg-black/20 flex items-center justify-center
          transition-all duration-300 ${showActions ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="flex space-x-2">
            <HapticButton
              onClick={() => onQuickView?.(product)}
              className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-105"
            >
              <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </HapticButton>
            
            <HapticButton
              onClick={() => onCompare?.(product)}
              className={`
                p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105
                ${isInCompare 
                  ? 'bg-livrili-prussian text-white' 
                  : 'bg-white/90 hover:bg-white text-gray-700'
                }
              `}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </HapticButton>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {product.category}
          </span>
          {product.brand && (
            <span className="text-xs text-gray-600 font-medium">
              {product.brand}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-livrili-prussian transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-3.5 w-3.5 ${
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-lg font-bold text-livrili-prussian">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Stock indicator */}
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1 ${
              product.stock > 10 ? 'bg-green-500' : 
              product.stock > 0 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`} />
            <span className="text-xs text-gray-500">
              {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
            </span>
          </div>
        </div>

        {/* Add to Cart */}
        <HapticButton
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isInCart}
          className={`
            w-full py-2.5 px-4 text-sm font-semibold rounded-lg
            transition-all duration-200 active:scale-95
            ${isInCart
              ? 'bg-green-100 text-green-800 border border-green-200'
              : product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-livrili-prussian text-white hover:bg-livrili-prussian/90 active:bg-livrili-prussian/95'
            }
          `}
        >
          {isInCart ? (
            <div className="flex items-center justify-center space-x-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t('product.added_to_cart', 'Added to Cart')}</span>
            </div>
          ) : product.stock === 0 ? (
            t('product.out_of_stock', 'Out of Stock')
          ) : (
            <div className="flex items-center justify-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2-2v6.01" />
              </svg>
              <span>{t('product.add_to_cart', 'Add to Cart')}</span>
            </div>
          )}
        </HapticButton>
      </div>
    </div>
  )
}