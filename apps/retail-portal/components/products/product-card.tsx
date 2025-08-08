'use client'

import { Button , useLanguage, useRTL } from '@livrili/ui'
import React, { useState, useEffect } from 'react'
import { TouchFeedback, useHapticFeedback } from '../common/haptic-button'

interface Product {
  id: string
  name: {
    ar: string
    fr: string
    en: string
  }
  price: number
  originalPrice?: number
  image?: string
  inStock: boolean
  stockCount?: number
  brand?: string
  description?: {
    ar: string
    fr: string
    en: string
  }
  unit?: string
  isPopular?: boolean
  isNew?: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string, quantity: number) => void
  onQuickView?: (productId: string) => void
  cartQuantity?: number
  isAddingToCart?: boolean
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onQuickView,
  cartQuantity = 0,
  isAddingToCart = false
}: ProductCardProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [quantity, setQuantity] = useState(1)
  const [isPressed, setIsPressed] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [showStockWarning, setShowStockWarning] = useState(false)
  const haptic = useHapticFeedback()
  
  // Show stock warning when quantity approaches stock limit
  useEffect(() => {
    if (product.stockCount && quantity > product.stockCount * 0.8) {
      setShowStockWarning(true)
    } else {
      setShowStockWarning(false)
    }
  }, [quantity, product.stockCount])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    setIsPressed(true)
    haptic('success')
    onAddToCart(product.id, quantity)
    
    // Show success feedback
    setIsAddedToCart(true)
    setTimeout(() => {
      setIsAddedToCart(false)
    }, 2000)
    
    // Reset visual feedback
    setTimeout(() => {
      setIsPressed(false)
    }, 200)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(product.stockCount || 999, quantity + change))
    if (newQuantity !== quantity) {
      haptic('light')
      setQuantity(newQuantity)
    }
  }

  const isOnSale = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = isOnSale 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className={`
      bg-white rounded-2xl shadow-sm border border-gray-200 p-4 transition-all duration-200 product-card
      ${isPressed ? 'scale-95' : 'hover:scale-105 hover:shadow-lg'}
      ${!product.inStock ? 'opacity-60 grayscale' : ''}
      ${isAddedToCart ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
    `}>
      {/* Badge Row */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-1">
          {product.isNew && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              🆕 {t('product.new', 'New')}
            </span>
          )}
          {product.isPopular && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
              🔥 {t('product.popular', 'Most Popular')}
            </span>
          )}
          {isOnSale && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              🏷️ -{discountPercentage}%
            </span>
          )}
        </div>
        
        {cartQuantity > 0 && (
          <div className="bg-livrili-prussian text-white px-2 py-1 rounded-full text-xs font-bold">
            {cartQuantity} {t('product.in_cart', 'In Cart')}
          </div>
        )}
      </div>

      {/* Enhanced Product Image */}
      <TouchFeedback
        onPress={onQuickView ? () => onQuickView(product.id) : undefined}
        hapticType="light"
      >
        <div className="relative mb-4 group">
          <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden">
            {product.image && !imageError ? (
              <img
                src={product.image}
                alt={product.name[language]}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-4xl text-gray-400">📦</span>
              </div>
            )}
          </div>
          
          {/* Enhanced Stock indicator */}
          <div className={`
            absolute top-2 right-2 rtl:right-auto rtl:left-2 w-4 h-4 rounded-full border-2 border-white shadow-sm
            ${product.inStock ? 'bg-green-400 animate-pulse' : 'bg-red-400'}
          `}>
            <div className={`absolute inset-0 rounded-full animate-ping ${
              product.inStock ? 'bg-green-400' : 'bg-red-400'
            } opacity-75`} />
          </div>
          
          {/* Enhanced Quick view button */}
          {onQuickView && (
            <div className="absolute bottom-2 right-2 rtl:right-auto rtl:left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200">
                <span className="text-lg">👁️</span>
              </div>
            </div>
          )}
          
          {/* Product status overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <div className="bg-white px-3 py-1 rounded-lg text-sm font-bold text-gray-700">
                {t('product.out_of_stock', 'Out of Stock')}
              </div>
            </div>
          )}
          
          {onQuickView && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {t('product.tap_to_view', 'Tap to view details')}
              </div>
            </div>
          )}
        </div>
      </TouchFeedback>

      {/* Product Info */}
      <div className="space-y-3">
        {/* Product Name */}
        <div>
          <h3 className={`font-bold text-gray-900 leading-tight ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
            {product.name[language]}
          </h3>
          {product.brand && (
            <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 rtl:space-x-reverse ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-lg font-bold text-livrili-prussian">
              {formatPrice(product.price)}
            </span>
            {isOnSale && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          
          {product.unit && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {product.unit}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
            {product.inStock ? '✅' : '❌'}
          </span>
          <span className="text-sm text-gray-600">
            {product.inStock 
              ? product.stockCount 
                ? `${product.stockCount} ${t('product.available', 'available')}`
                : t('product.in_stock', 'In Stock')
              : t('product.out_of_stock', 'Out of Stock')
            }
          </span>
        </div>

        {/* Quantity Selector & Add to Cart */}
        {product.inStock && (
          <div className="space-y-3">
            {/* Enhanced Quantity Selector */}
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-medium text-gray-700">
                {t('product.quantity', 'Quantity')}:
              </span>
              
              <div className="flex items-center bg-gray-100 rounded-xl shadow-inner">
                <TouchFeedback
                  onPress={() => handleQuantityChange(-1)}
                  hapticType="light"
                  disabled={quantity <= 1}
                >
                  <button
                    className={`
                      w-12 h-12 flex items-center justify-center text-xl font-bold rounded-l-xl rtl:rounded-l-none rtl:rounded-r-xl transition-all duration-200
                      ${quantity <= 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-livrili-prussian hover:bg-gray-200 active:bg-gray-300'
                      }
                    `}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                </TouchFeedback>
                
                <div className="w-16 h-12 flex items-center justify-center text-lg font-bold bg-white border-x border-gray-200">
                  <span className={showStockWarning ? 'text-orange-600 animate-pulse' : 'text-gray-900'}>
                    {quantity}
                  </span>
                </div>
                
                <TouchFeedback
                  onPress={() => handleQuantityChange(1)}
                  hapticType="light"
                  disabled={product.stockCount ? quantity >= product.stockCount : false}
                >
                  <button
                    className={`
                      w-12 h-12 flex items-center justify-center text-xl font-bold rounded-r-xl rtl:rounded-r-none rtl:rounded-l-xl transition-all duration-200
                      ${(product.stockCount && quantity >= product.stockCount)
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-livrili-prussian hover:bg-gray-200 active:bg-gray-300'
                      }
                    `}
                    disabled={product.stockCount ? quantity >= product.stockCount : false}
                  >
                    +
                  </button>
                </TouchFeedback>
              </div>
              
              {showStockWarning && (
                <div className="text-xs text-orange-600 animate-pulse">
                  ⚠️ {t('product.low_stock', 'Low stock')}
                </div>
              )}
            </div>

            {/* Enhanced Add to Cart Button */}
            <div className="relative">
              <Button
                onClick={handleAddToCart}
                variant="brand"
                size="sm"
                className={`
                  w-full h-14 font-bold rounded-xl transition-all duration-200 touch-feedback
                  ${isAddingToCart ? 'animate-pulse' : 'hover:scale-105 active:scale-95'}
                  ${isAddedToCart ? 'cart-success' : ''}
                `}
                disabled={isAddingToCart}
              >
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  {isAddingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('product.adding', 'Adding...')}</span>
                    </>
                  ) : isAddedToCart ? (
                    <>
                      <span className="text-xl animate-bounce">✅</span>
                      <span>{t('product.added', 'Added!')}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🛒</span>
                      <span>{t('product.add_to_cart', 'Add to Cart')}</span>
                      <div className="text-sm opacity-90 ml-2 rtl:ml-0 rtl:mr-2 px-2 py-1 bg-white/20 rounded-lg">
                        {formatPrice(product.price * quantity)}
                      </div>
                    </>
                  )}
                </div>
              </Button>
              
              {cartQuantity > 0 && (
                <div className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {cartQuantity}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Out of Stock Section */}
        {!product.inStock && (
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl animate-pulse">⏰</span>
              <span className="font-medium text-gray-700">{t('product.out_of_stock', 'Out of Stock')}</span>
              
              <TouchFeedback
                onPress={() => {
                  // In a real app, this would trigger a notification signup
                  haptic('success')
                  // Show toast or modal for notification signup
                }}
                hapticType="light"
              >
                <div className="mt-2 px-4 py-2 bg-livrili-prussian/10 text-livrili-prussian text-sm font-medium rounded-lg hover:bg-livrili-prussian/20 transition-colors">
                  {t('product.notify_available', 'Notify When Available')}
                </div>
              </TouchFeedback>
              
              <TouchFeedback
                onPress={() => {
                  const message = t('product.request_stock', 'Hi, I\'m interested in this product: {name}').replace('{name}', product.name[language])
                  window.open(`https://wa.me/213XXXXXXXXX?text=${encodeURIComponent(message)}`, '_blank')
                }}
                hapticType="light"
              >
                <div className="text-xs text-green-600 hover:text-green-700 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors">
                  📱 {t('product.request_whatsapp', 'Request via WhatsApp')}
                </div>
              </TouchFeedback>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}