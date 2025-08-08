'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  specifications?: { [key: string]: string }
  features?: string[]
}

interface ProductQuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (productId: string, quantity: number) => void
  onWishlistToggle?: (productId: string) => void
  isInWishlist?: boolean
  isInCart?: boolean
}

export function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onWishlistToggle,
  isInWishlist = false,
  isInCart = false
}: ProductQuickViewModalProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0)
      setQuantity(1)
      setIsZoomed(false)
    }
  }, [product])

  const handleAddToCart = () => {
    if (product) {
      onAddToCart?.(product.id, quantity)
    }
  }

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  if (!isOpen || !product) return null

  const currentImage = product.images[currentImageIndex] || product.images[0]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {t('product.quick_view', 'Quick View')}
            </h2>
            <HapticButton
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </HapticButton>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                <div
                  className="relative w-full h-full cursor-zoom-in"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleImageHover}
                >
                  <Image
                    src={currentImage?.url || '/placeholder-product.jpg'}
                    alt={currentImage?.alt || product.name}
                    fill
                    className={`object-cover transition-transform duration-300 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }
                        : {}
                    }
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Navigation arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      className={`
                        absolute top-1/2 transform -translate-y-1/2 z-10 p-3 
                        bg-white/90 hover:bg-white rounded-full shadow-lg
                        transition-all duration-200 opacity-0 group-hover:opacity-100
                        ${isRTL ? 'right-4' : 'left-4'}
                      `}
                    >
                      <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                      className={`
                        absolute top-1/2 transform -translate-y-1/2 z-10 p-3 
                        bg-white/90 hover:bg-white rounded-full shadow-lg
                        transition-all duration-200 opacity-0 group-hover:opacity-100
                        ${isRTL ? 'left-4' : 'right-4'}
                      `}
                    >
                      <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Zoom indicator */}
                {isZoomed && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {t('product.zoom_active', 'Zoom Active')}
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`
                        relative flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden
                        border-2 transition-all duration-200
                        ${index === currentImageIndex 
                          ? 'border-livrili-prussian ring-2 ring-livrili-prussian/20' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                    {product.category}
                  </span>
                  <HapticButton
                    onClick={() => onWishlistToggle?.(product.id)}
                    className={`
                      p-2 rounded-full transition-all duration-200
                      ${isInWishlist 
                        ? 'bg-livrili-fire/10 text-livrili-fire' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-livrili-fire'
                      }
                    `}
                  >
                    <svg className="h-5 w-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </HapticButton>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>

                {product.brand && (
                  <p className="text-gray-600 mb-4">by {product.brand}</p>
                )}

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
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
                    <span className="text-gray-600 ml-2">
                      {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-3xl font-bold text-livrili-prussian">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="bg-livrili-fire text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className={`w-3 h-3 rounded-full ${
                  product.stock > 10 ? 'bg-green-500' : 
                  product.stock > 0 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`} />
                <span className="text-gray-600">
                  {product.stock > 0 ? (
                    <>
                      <span className="font-semibold text-green-700">{product.stock} in stock</span>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="text-orange-600 ml-1">- Only {product.stock} left!</span>
                      )}
                    </>
                  ) : (
                    <span className="font-semibold text-red-700">Out of stock</span>
                  )}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('product.description', 'Description')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('product.features', 'Features')}
                  </h3>
                  <ul className="space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('product.specifications', 'Specifications')}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-900">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <label className="text-sm font-medium text-gray-900">
                    {t('product.quantity', 'Quantity')}:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-16 py-2 text-center border-0 focus:ring-0 focus:outline-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <HapticButton
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isInCart}
                  className={`
                    w-full py-4 px-6 text-base font-semibold rounded-xl
                    transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2
                    ${isInCart
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-livrili-prussian text-white hover:bg-livrili-prussian/90 shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isInCart ? (
                    <>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{t('product.added_to_cart', 'Added to Cart')}</span>
                    </>
                  ) : product.stock === 0 ? (
                    t('product.out_of_stock', 'Out of Stock')
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2-2v6.01" />
                      </svg>
                      <span>
                        {t('product.add_to_cart', 'Add to Cart')} - {formatPrice(product.price * quantity)}
                      </span>
                    </>
                  )}
                </HapticButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}