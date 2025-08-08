'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button, useLanguage, useRTL } from '@livrili/ui'
import { HapticButton } from '@/components/common/haptic-button'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  category?: string
  brand?: string
  originalPrice?: number
  maxQuantity?: number
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  onRemoveItem?: (itemId: string) => void
  onClearCart?: () => void
  onCheckout?: () => void
  onSaveForLater?: (itemId: string) => void
  savedItems?: CartItem[]
  onRestoreItem?: (itemId: string) => void
  isLoading?: boolean
  className?: string
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onSaveForLater,
  savedItems = [],
  onRestoreItem,
  isLoading = false,
  className = ''
}: CartDrawerProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [activeTab, setActiveTab] = useState<'cart' | 'saved'>('cart')
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const drawerRef = useRef<HTMLDivElement>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalSavings = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity)
    }
    return sum
  }, 0)

  // Close drawer on escape key
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

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev.add(itemId)))
    await new Promise(resolve => setTimeout(resolve, 300)) // Animation delay
    onRemoveItem?.(itemId)
    setRemovingItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(itemId)
    } else {
      onUpdateQuantity?.(itemId, newQuantity)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isRTL ? 'left-0' : 'right-0'}
          ${isOpen 
            ? 'translate-x-0' 
            : isRTL 
              ? '-translate-x-full' 
              : 'translate-x-full'
          }
          ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <h2 className="text-xl font-bold text-gray-900">
                {t('cart.title', 'Shopping Cart')}
              </h2>
              {totalItems > 0 && (
                <span className="bg-livrili-prussian text-white text-sm px-2.5 py-0.5 rounded-full font-medium">
                  {totalItems}
                </span>
              )}
            </div>
            
            <HapticButton
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </HapticButton>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('cart')}
              className={`
                flex-1 py-3 px-4 text-sm font-medium transition-colors
                ${activeTab === 'cart'
                  ? 'text-livrili-prussian border-b-2 border-livrili-prussian bg-white'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {t('cart.tab_cart', 'Cart')} ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`
                flex-1 py-3 px-4 text-sm font-medium transition-colors
                ${activeTab === 'saved'
                  ? 'text-livrili-prussian border-b-2 border-livrili-prussian bg-white'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {t('cart.tab_saved', 'Saved')} ({savedItems.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'cart' ? (
              // Cart Items
              items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2-2v6.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('cart.empty_title', 'Your cart is empty')}
                  </h3>
                  <p className="text-gray-500 text-center mb-6">
                    {t('cart.empty_message', 'Add some products to get started!')}
                  </p>
                  <Button 
                    onClick={onClose}
                    variant="brand"
                    className="px-6 py-2"
                  >
                    {t('cart.start_shopping', 'Start Shopping')}
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`
                        bg-white rounded-lg border border-gray-200 p-4 transition-all duration-300
                        ${removingItems.has(item.id) ? 'opacity-0 scale-95 transform' : 'opacity-100 scale-100'}
                      `}
                    >
                      <div className="flex space-x-4 rtl:space-x-reverse">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {item.name}
                              </h3>
                              {item.brand && (
                                <p className="text-xs text-gray-500">{item.brand}</p>
                              )}
                              {item.category && (
                                <p className="text-xs text-gray-400">{item.category}</p>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-1">
                              {onSaveForLater && (
                                <HapticButton
                                  onClick={() => onSaveForLater(item.id)}
                                  className="p-1.5 text-gray-400 hover:text-livrili-prussian hover:bg-gray-100 rounded transition-colors"
                                  title={t('cart.save_for_later', 'Save for later')}
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </HapticButton>
                              )}
                              
                              <HapticButton
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title={t('cart.remove_item', 'Remove item')}
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </HapticButton>
                            </div>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <span className="text-sm font-semibold text-livrili-prussian">
                                  {formatPrice(item.price)}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-xs text-gray-500 line-through">
                                    {formatPrice(item.originalPrice)}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-600">
                                {t('cart.total', 'Total')}: {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              
                              <span className="px-3 py-1.5 text-sm font-medium min-w-[40px] text-center">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Saved Items
              savedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('cart.no_saved_title', 'No saved items')}
                  </h3>
                  <p className="text-gray-500 text-center">
                    {t('cart.no_saved_message', 'Items you save for later will appear here')}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex space-x-4 rtl:space-x-reverse">
                        {/* Product Image */}
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-livrili-prussian font-medium mb-2">
                            {formatPrice(item.price)}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => onRestoreItem?.(item.id)}
                              size="sm"
                              variant="brand"
                              className="text-xs"
                            >
                              {t('cart.move_to_cart', 'Move to Cart')}
                            </Button>
                            <Button
                              onClick={() => handleRemoveItem(item.id)}
                              size="sm"
                              variant="ghost"
                              className="text-xs text-gray-500"
                            >
                              {t('cart.remove', 'Remove')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer - Cart Summary and Actions */}
          {activeTab === 'cart' && items.length > 0 && (
            <div className="border-t border-gray-200 bg-white p-6 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t('cart.subtotal', 'Subtotal')} ({totalItems} items):
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      {t('cart.savings', 'You save')}:
                    </span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(totalSavings)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>{t('cart.total', 'Total')}:</span>
                  <span className="text-livrili-prussian">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={onCheckout}
                  disabled={isLoading}
                  className="w-full py-3 font-semibold"
                  variant="brand"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('cart.processing', 'Processing...')}</span>
                    </div>
                  ) : (
                    t('cart.checkout', 'Proceed to Checkout')
                  )}
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="flex-1 py-2"
                  >
                    {t('cart.continue_shopping', 'Continue Shopping')}
                  </Button>
                  
                  {onClearCart && (
                    <Button
                      onClick={onClearCart}
                      variant="ghost"
                      className="px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      {t('cart.clear', 'Clear')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}