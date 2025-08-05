'use client'

import React, { useState } from 'react'
import { Button } from '@livrili/ui'
import { useLanguage, useRTL } from '@livrili/ui'

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    setIsPressed(true)
    onAddToCart(product.id, quantity)
    
    // Reset visual feedback
    setTimeout(() => {
      setIsPressed(false)
    }, 200)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change)
    setQuantity(newQuantity)
  }

  const isOnSale = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = isOnSale 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className={`
      bg-white rounded-2xl shadow-sm border border-gray-200 p-4 transition-all duration-200
      ${isPressed ? 'scale-95' : 'hover:scale-105 hover:shadow-lg'}
      ${!product.inStock ? 'opacity-60' : ''}
    `}>
      {/* Badge Row */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-1">
          {product.isNew && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              🆕 {t('product.new', 'جديد')}
            </span>
          )}
          {product.isPopular && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
              🔥 {t('product.popular', 'الأكثر طلباً')}
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
            {cartQuantity} {t('product.in_cart', 'في السلة')}
          </div>
        )}
      </div>

      {/* Product Image */}
      <div className="relative mb-4">
        <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden">
          {product.image && !imageError ? (
            <img
              src={product.image}
              alt={product.name[language]}
              className="w-full h-full object-cover transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-4xl text-gray-400">📦</span>
            </div>
          )}
        </div>
        
        {/* Stock indicator */}
        <div className={`
          absolute top-2 right-2 rtl:right-auto rtl:left-2 w-3 h-3 rounded-full
          ${product.inStock ? 'bg-green-400' : 'bg-red-400'}
        `} />
        
        {/* Quick view button */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product.id)}
            className="absolute bottom-2 right-2 rtl:right-auto rtl:left-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm">👁️</span>
          </button>
        )}
      </div>

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
                ? `${product.stockCount} ${t('product.available', 'متوفر')}`
                : t('product.in_stock', 'متوفر')
              : t('product.out_of_stock', 'غير متوفر')
            }
          </span>
        </div>

        {/* Quantity Selector & Add to Cart */}
        {product.inStock && (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
              <span className="text-sm font-medium text-gray-700 px-2">
                {t('product.quantity', 'الكمية')}:
              </span>
              
              <div className="flex items-center bg-gray-100 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 flex items-center justify-center text-lg font-bold text-livrili-prussian hover:bg-gray-200 rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                
                <span className="w-12 h-10 flex items-center justify-center text-lg font-bold bg-white">
                  {quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 flex items-center justify-center text-lg font-bold text-livrili-prussian hover:bg-gray-200 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              variant="brand"
              size="sm"
              className={`
                w-full h-12 font-bold rounded-xl transition-all duration-200
                ${isAddingToCart ? 'animate-pulse' : 'hover:scale-105 active:scale-95'}
              `}
              disabled={isAddingToCart}
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                {isAddingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('product.adding', 'جاري الإضافة...')}</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">🛒</span>
                    <span>{t('product.add_to_cart', 'أضف للسلة')}</span>
                    <span className="text-sm opacity-80">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </>
                )}
              </div>
            </Button>
          </div>
        )}

        {/* Out of Stock Button */}
        {!product.inStock && (
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-gray-500">
              <span className="text-lg">⏰</span>
              <span className="font-medium">{t('product.notify_available', 'أعلمني عند التوفر')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}