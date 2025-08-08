'use client'

import { useLanguage, useRTL } from '@livrili/ui'
import { Trash2, ShoppingCart, Package, AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { api } from '../../../lib/trpc'


interface CartItem {
  id: string
  productId: string
  name: { ar: string; fr: string; en: string }
  price: number
  quantity: number
  stock: number
  image?: string
  unit?: string
}

// SwipeToDelete Component for mobile swipe-to-delete functionality
interface SwipeToDeleteProps {
  children: React.ReactNode
  onDelete: () => void
  isDeleting: boolean
}

function SwipeToDelete({ children, onDelete, isDeleting }: SwipeToDeleteProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    const currentX = e.touches[0].clientX
    const diffX = startX - currentX
    
    if (diffX > 0 && diffX < 100) {
      setCurrentX(diffX)
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (currentX > 50) {
      setShowDelete(true)
    } else {
      setCurrentX(0)
      setShowDelete(false)
    }
  }

  const handleDelete = () => {
    setShowDelete(false)
    setCurrentX(0)
    onDelete()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete button background */}
      <div 
        className={`absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center transition-all duration-200 ${
          showDelete ? 'w-20' : 'w-0'
        }`}
      >
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-white p-2 disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Main content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateX(-${showDelete ? 80 : currentX}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
      
      {/* Reset swipe overlay */}
      {showDelete && (
        <div 
          className="absolute inset-0 bg-transparent"
          onClick={() => {
            setShowDelete(false)
            setCurrentX(0)
          }}
        />
      )}
    </div>
  )
}

export default function CartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const { isRTL } = useRTL()
  
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const isReorder = searchParams.get('reorder') === 'true'

  // Fetch cart data
  const { data: cartItems, isLoading, refetch } = api.retailer.cart.get.useQuery()
  const { data: retailerInfo } = api.retailer.profile.get.useQuery()
  
  // Mutations
  const updateQuantityMutation = api.retailer.cart.updateQuantity.useMutation({
    onSuccess: () => {
      refetch()
      toast.success(t('cart.quantity_updated', 'Quantity updated'), {
        icon: <CheckCircle className="w-4 h-4" />
      })
    },
    onError: (error) => {
      toast.error(error.message || t('cart.update_error', 'Error updating quantity'), {
        icon: <AlertTriangle className="w-4 h-4" />
      })
    }
  })
  
  const removeItemMutation = api.retailer.cart.removeItem.useMutation({
    onSuccess: () => {
      refetch()
      toast.success(t('cart.item_removed', 'Item removed'), {
        icon: <CheckCircle className="w-4 h-4" />
      })
    },
    onError: (error) => {
      toast.error(error.message || t('cart.remove_error', 'Error removing item'), {
        icon: <AlertTriangle className="w-4 h-4" />
      })
    }
  })
  
  const checkoutMutation = api.retailer.orders.create.useMutation({
    onSuccess: (order) => {
      router.push(`/orders/${order.id}?success=true`)
    },
    onError: (error) => {
      alert(error.message || t('cart.checkout.error', 'An error occurred during checkout'))
    }
  })

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
  const tax = Math.round(subtotal * 0.19) // 19% VAT
  const deliveryFee = subtotal > 5000 ? 0 : 300 // Free delivery over 5000 DZD
  const total = subtotal + tax + deliveryFee
  
  const minimumOrderAmount = 1000
  const isMinimumMet = subtotal >= minimumOrderAmount

  useEffect(() => {
    if (isReorder) {
      // Logic to load last order items into cart would go here
      // For now, just remove the query param
      router.replace('/cart')
    }
  }, [isReorder, router])

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItemMutation.mutateAsync({ itemId })
    } else {
      await updateQuantityMutation.mutateAsync({ itemId, quantity: newQuantity })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    await removeItemMutation.mutateAsync({ itemId })
  }

  const handleCheckout = async () => {
    if (!isMinimumMet || !cartItems || cartItems.length === 0) return
    
    setIsCheckingOut(true)
    try {
      await checkoutMutation.mutateAsync({
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryFee,
        total
      })
    } catch (error) {
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-livrili-prussian border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-livrili-prussian font-medium">
            {t('cart.loading', 'Loading cart...')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="text-xl">{isRTL ? '←' : '→'}</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-livrili-prussian flex items-center space-x-2 rtl:space-x-reverse">
                <ShoppingCart className="w-6 h-6" />
                <span>{t('cart.title', 'Shopping Cart')}</span>
              </h1>
              <p className="text-sm text-gray-600">
                {cartItems?.length || 0} {t('cart.items', 'items')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-32">
        {cartItems && cartItems.length > 0 ? (
          <>
            {/* Minimum Order Warning with Quick Add Suggestions */}
            {!isMinimumMet && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5 mb-6 shadow-sm">
                <div className="flex items-start space-x-3 rtl:space-x-reverse mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-yellow-800 text-lg">
                      {t('cart.minimum_order_title', 'Minimum Order')}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {t('cart.minimum_order_message', 'Add products worth')} 
                      <span className="font-bold text-yellow-800"> {(minimumOrderAmount - subtotal).toLocaleString()} {t('currency.dzd', 'DZD')} </span>
                      {t('cart.minimum_order_more', 'more')}
                    </p>
                  </div>
                </div>
                
                {/* Quick Add Suggestions */}
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/categories?suggested=true')}
                    className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl py-3 px-4 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="font-medium">{t('cart.browse_suggestions', 'Browse Suggested Products')}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => window.open('https://wa.me/213XXXXXXXXX?text=' + encodeURIComponent(t('whatsapp.help_minimum', 'I need help completing the minimum order')), '_blank')}
                    className="w-full bg-green-100 hover:bg-green-200 text-green-800 rounded-xl py-3 px-4 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{t('cart.whatsapp_help', 'WhatsApp Help')}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Cart Items with Swipe Support */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <SwipeToDelete
                  key={item.id}
                  onDelete={() => handleRemoveItem(item.id)}
                  isDeleting={removeItemMutation.isLoading}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name[language]}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-livrili-prussian truncate">
                        {item.name[language]}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.price.toLocaleString()} {t('currency.dzd', 'DZD')} / {item.unit || t('cart.unit', 'unit')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('cart.stock_available', 'Available')}: {item.stock} {item.unit || t('cart.unit', 'unit')}
                      </p>
                    </div>

                    {/* Quantity Controls - Large buttons for thumb reach */}
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updateQuantityMutation.isLoading}
                        className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 active:scale-95 hover:scale-105 shadow-sm"
                      >
                        <span className="text-xl font-bold text-gray-700">−</span>
                      </button>
                      
                      <div className="w-14 text-center">
                        <span className="text-lg font-bold text-livrili-prussian block">
                          {item.quantity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.unit || t('cart.unit', 'unit')}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updateQuantityMutation.isLoading || item.quantity >= item.stock}
                        className="w-12 h-12 bg-livrili-prussian text-white rounded-xl flex items-center justify-center hover:bg-livrili-prussian/90 transition-all duration-200 disabled:opacity-50 active:scale-95 hover:scale-105 shadow-lg"
                      >
                        <span className="text-xl font-bold">+</span>
                      </button>
                    </div>

                    {/* Remove Button - Smaller for swipe-to-delete */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeItemMutation.isLoading}
                      className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all duration-200 disabled:opacity-50 active:scale-95 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item Total - More prominent */}
                  <div className={`mt-4 pt-3 border-t border-gray-100 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {item.quantity} × {item.price.toLocaleString()} {t('currency.dzd', 'DZD')}
                      </span>
                      <span className="text-lg font-bold text-livrili-prussian">
                        {(item.price * item.quantity).toLocaleString()} {t('currency.dzd', 'DZD')}
                      </span>
                    </div>
                  </div>
                  </div>
                </SwipeToDelete>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-livrili-prussian mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5" />
                <span>{t('cart.order_summary', 'Order Summary')}</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('cart.subtotal', 'Subtotal')}</span>
                  <span className="font-medium">{subtotal.toLocaleString()} {t('currency.dzd', 'DZD')}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('cart.tax', 'Tax')} (19%)</span>
                  <span className="font-medium">{tax.toLocaleString()} {t('currency.dzd', 'DZD')}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center space-x-1 rtl:space-x-reverse">
                    <span>{t('cart.delivery', 'Delivery')}</span>
                    {deliveryFee === 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {t('cart.free', 'Free')}
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    {deliveryFee > 0 ? `${deliveryFee.toLocaleString()} ${t('currency.dzd', 'DZD')}` : t('cart.free', 'Free')}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-livrili-prussian">{t('cart.total', 'Total')}</span>
                    <span className="text-2xl font-bold text-livrili-prussian">{total.toLocaleString()} {t('currency.dzd', 'DZD')}</span>
                  </div>
                </div>
              </div>

              {/* Credit Balance Info */}
              {retailerInfo && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t('cart.current_balance', 'Current Balance')}</span>
                    <span className={`font-medium ${retailerInfo.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {retailerInfo.balance.toLocaleString()} {t('currency.dzd', 'DZD')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">{t('cart.after_order', 'Balance After Order')}</span>
                    <span className={`font-medium ${(retailerInfo.balance - total) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(retailerInfo.balance - total).toLocaleString()} {t('currency.dzd', 'DZD')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty Cart */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('cart.empty_title', 'Cart is Empty')}
            </h3>
            <p className="text-gray-600 mb-8">
              {t('cart.empty_message', 'Add products to start shopping')}
            </p>
            <button
              onClick={() => router.push('/categories')}
              className="px-8 py-4 bg-gradient-to-r from-livrili-prussian to-livrili-prussian/90 text-white rounded-2xl hover:from-livrili-prussian/90 hover:to-livrili-prussian transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <ShoppingCart className="w-6 h-6" />
                <span className="font-medium">{t('cart.start_shopping', 'Start Shopping')}</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Sticky Checkout Button - Enhanced for mobile */}
      {cartItems && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20 shadow-2xl">
          {/* Progress bar for minimum order */}
          {!isMinimumMet && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{t('cart.progress', 'Progress')}</span>
                <span>{Math.round((subtotal / minimumOrderAmount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-livrili-prussian to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((subtotal / minimumOrderAmount) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          
          <button
            onClick={handleCheckout}
            disabled={!isMinimumMet || isCheckingOut || checkoutMutation.isLoading}
            className={`
              w-full h-16 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg
              ${isMinimumMet && !isCheckingOut
                ? 'bg-gradient-to-r from-livrili-prussian to-blue-600 text-white hover:from-livrili-prussian/90 hover:to-blue-500 hover:scale-105 active:scale-95 hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
              {isCheckingOut || checkoutMutation.isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('cart.processing', 'Processing order...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>
                    {t('cart.checkout', 'Checkout')} • {total.toLocaleString()} {t('currency.dzd', 'DZD')}
                  </span>
                </>
              )}
            </div>
          </button>
          
          {!isMinimumMet && (
            <div className="text-center mt-3">
              <p className="text-xs text-red-600 mb-2">
                {t('cart.minimum_required', 'Minimum order')} {minimumOrderAmount.toLocaleString()} {t('currency.dzd', 'DZD')}
              </p>
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => router.push('/categories?suggested=true')}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {t('cart.add_more', 'Add More')}
                </button>
                <button
                  onClick={() => window.open('https://wa.me/213XXXXXXXXX?text=' + encodeURIComponent(t('whatsapp.help_minimum', 'I need help completing the minimum order')), '_blank')}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                >
                  {t('cart.help', 'Help')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Toast notifications area */}
      <div className="fixed top-20 left-4 right-4 z-30 pointer-events-none">
        {/* Toast messages will appear here via Sonner */}
      </div>
    </div>
  )
}