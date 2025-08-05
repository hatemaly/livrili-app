'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@livrili/ui'
import { useLanguage, useRTL } from '@livrili/ui'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartButtonProps {
  items?: CartItem[]
  totalAmount?: number
  itemCount?: number
  onCartClick: () => void
  onCheckout?: () => void
  isFloating?: boolean
  showQuickActions?: boolean
  isProcessing?: boolean
}

export function CartButton({ 
  items = [],
  totalAmount = 0,
  itemCount = 0,
  onCartClick,
  onCheckout,
  isFloating = true,
  showQuickActions = true,
  isProcessing = false
}: CartButtonProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [lastItemCount, setLastItemCount] = useState(itemCount)

  // Animate when items are added
  useEffect(() => {
    if (itemCount > lastItemCount) {
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 600)
    }
    setLastItemCount(itemCount)
  }, [itemCount, lastItemCount])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const isEmpty = itemCount === 0

  if (isFloating) {
    return (
      <div className={`fixed bottom-6 z-50 transition-all duration-300 ${isRTL ? 'left-4 right-4' : 'left-4 right-4'}`}>
        {/* Expanded Cart Preview */}
        {isExpanded && !isEmpty && showQuickActions && (
          <div className="bg-white rounded-t-2xl shadow-2xl border border-gray-200 mb-2 animate-slide-up">
            <div className="p-4 max-h-64 overflow-y-auto">
              <h3 className="font-bold text-livrili-prussian mb-3 flex items-center space-x-2 rtl:space-x-reverse">
                <span>🛒</span>
                <span>{t('cart.preview.title', 'سلة التسوق')}</span>
              </h3>
              
              {items.slice(0, 3).map((item, index) => (
                <div key={item.id} className="flex items-center space-x-3 rtl:space-x-reverse py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <span className="text-lg">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-livrili-prussian">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              
              {items.length > 3 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  +{items.length - 3} {t('cart.preview.more_items', 'منتجات أخرى')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Cart Button */}
        <div className="relative">
          <Button
            onClick={() => {
              if (isEmpty) {
                onCartClick()
              } else {
                setIsExpanded(!isExpanded)
              }
            }}
            variant="brand"
            size="lg"
            className={`
              w-full h-16 font-bold rounded-2xl shadow-xl transition-all duration-300
              ${showAnimation ? 'animate-bounce' : 'hover:scale-105 active:scale-95'}
              ${isEmpty ? 'bg-gray-400 hover:bg-gray-500' : ''}
              ${isProcessing ? 'animate-pulse' : ''}
            `}
            disabled={isProcessing}
          >
            <div className="flex items-center justify-between w-full px-2">
              {/* Left: Cart Icon & Count */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="relative">
                  <span className="text-2xl">🛒</span>
                  {itemCount > 0 && (
                    <div className={`
                      absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 
                      w-6 h-6 bg-livrili-fire text-white text-xs font-bold 
                      rounded-full flex items-center justify-center
                      ${showAnimation ? 'animate-ping' : ''}
                    `}>
                      {itemCount > 99 ? '99+' : itemCount}
                    </div>
                  )}
                </div>
                <span className="text-lg">
                  {isEmpty 
                    ? t('cart.empty', 'السلة فارغة') 
                    : t('cart.view', 'عرض السلة')
                  }
                </span>
              </div>

              {/* Right: Total & Action */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {!isEmpty && (
                  <div className="text-right rtl:text-left">
                    <div className="text-lg font-bold">
                      {formatPrice(totalAmount)}
                    </div>
                    <div className="text-xs opacity-80">
                      {itemCount} {t('cart.items', 'منتج')}
                    </div>
                  </div>
                )}
                
                {!isEmpty && !isExpanded && (
                  <span className="text-lg">⬆️</span>
                )}
                {!isEmpty && isExpanded && (
                  <span className="text-lg">⬇️</span>
                )}
              </div>
            </div>
          </Button>

          {/* Quick Checkout Button */}
          {!isEmpty && isExpanded && onCheckout && (
            <div className="mt-3">
              <Button
                onClick={onCheckout}
                variant="brand-secondary"
                size="lg"
                className="w-full h-14 font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isProcessing}
              >
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('cart.processing', 'جاري المعالجة...')}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">⚡</span>
                      <span>{t('cart.quick_checkout', 'دفع سريع')}</span>
                      <span className="text-sm opacity-80">
                        {formatPrice(totalAmount)}
                      </span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Non-floating version for headers/toolbars
  return (
    <Button
      onClick={onCartClick}
      variant={isEmpty ? "ghost" : "brand"}
      size="default"
      className={`
        relative transition-all duration-200
        ${showAnimation ? 'animate-pulse' : 'hover:scale-105 active:scale-95'}
      `}
    >
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div className="relative">
          <span className="text-xl">🛒</span>
          {itemCount > 0 && (
            <div className={`
              absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 
              w-5 h-5 bg-livrili-fire text-white text-xs font-bold 
              rounded-full flex items-center justify-center
              ${showAnimation ? 'animate-bounce' : ''}
            `}>
              {itemCount > 99 ? '99+' : itemCount}
            </div>
          )}
        </div>
        
        {!isEmpty && (
          <>
            <span className="font-medium">
              {formatPrice(totalAmount)}
            </span>
            <span className="text-sm opacity-80">
              ({itemCount})
            </span>
          </>
        )}
      </div>
    </Button>
  )
}