'use client'

import { useLanguage, useRTL } from '@livrili/ui'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { CartButton } from '../../../components/cart/cart-button'
import { PullToRefresh } from '../../../components/common/pull-to-refresh'
import { HapticButton, TouchFeedback, useHapticFeedback } from '../../../components/common/haptic-button'
import { OnlineStatus } from '../../../components/common/offline-indicator'
import { BrandHeading, FeatureCard, StatCard, BrandSpinner, StatusBadge, BrandButton } from '../../../components/common/brand-system'
import { LivriliIcon, BrandCard } from '../../../components/common/livrili-logo'
import { api } from '../../../lib/trpc'



export default function HomePage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const { isRTL } = useRTL()
  const haptic = useHapticFeedback()
  
  // Get retailer info and recent orders with error handling
  const { data: retailerInfo, isLoading: isLoadingRetailer, refetch: refetchProfile } = api.retailer.profile.get.useQuery()
  const { data: recentOrders, isLoading: isLoadingOrders, refetch: refetchOrders } = api.retailer.orders.getRecent.useQuery({
    limit: 3,
  })
  // Get cart data for the floating cart button
  const { data: cartData, refetch: refetchCart } = api.retailer.cart.get.useQuery()
  
  const [touchedButton, setTouchedButton] = useState<string | null>(null)
  const [timeOfDay, setTimeOfDay] = useState('')
  
  // Determine time of day greeting
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setTimeOfDay(t('home.good_morning', 'Good Morning'))
    } else if (hour < 17) {
      setTimeOfDay(t('home.good_afternoon', 'Good Afternoon'))
    } else {
      setTimeOfDay(t('home.good_evening', 'Good Evening'))
    }
  }, [t])

  const handleButtonPress = (buttonId: string, action: () => void) => {
    setTouchedButton(buttonId)
    haptic('medium')
    setTimeout(() => {
      action()
      setTouchedButton(null)
    }, 150)
  }
  
  const handleRefresh = async () => {
    await Promise.all([refetchProfile(), refetchOrders(), refetchCart()])
    haptic('success')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoadingRetailer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <LivriliIcon size={64} className="mx-auto" />
          <BrandSpinner size="lg" />
          <BrandHeading level={3} className="animate-pulse">
            {t('home.loading', 'Loading...')}
          </BrandHeading>
        </div>
      </div>
    )
  }

  return (
    <OnlineStatus>
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-gray-50">
        <div className="p-4 safe-top">
      {/* Header with Welcome & Credit Balance */}
      <BrandCard variant="primary" className="mb-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
          <LivriliIcon size={64} className="shadow-xl" />
          <div className="flex-1">
            <BrandHeading level={2} className="mb-2">
              {timeOfDay} {retailerInfo?.businessName || t('home.retailer', 'Retailer')}!
            </BrandHeading>
            <p className="text-gray-600">
              {t('home.subtitle', 'Order your products and manage your store with ease')}
            </p>
          </div>
        </div>
        
        {/* Prominent Credit Balance */}
        <div className="bg-gradient-to-r from-livrili-papaya/30 to-livrili-papaya/50 rounded-xl p-5 border-2 border-livrili-papaya">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-livrili-prussian font-semibold mb-1">{t('home.current_balance', 'Current Balance')}</p>
                <p className={`text-3xl font-bold ${
                  (retailerInfo?.balance || 0) >= 0 ? 'text-green-600' : 'text-livrili-fire'
                }`}>
                  {formatCurrency(retailerInfo?.balance || 0)}
                </p>
              </div>
            </div>
            <div className="text-right rtl:text-left bg-white/70 rounded-lg p-3">
              <div className="text-xs text-livrili-prussian/70 font-medium">{t('home.credit_limit', 'Credit Limit')}</div>
              <div className="text-lg font-bold text-livrili-prussian">
                {formatCurrency(retailerInfo?.creditLimit || 0)}
              </div>
            </div>
          </div>
        </div>
      </BrandCard>

      {/* Main Actions - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Browse Products */}
        <button
          onClick={() => handleButtonPress('browse', () => router.push('/categories'))}
          className={`
            bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100
            hover:border-livrili-prussian hover:shadow-lg transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20
            min-h-[120px] flex flex-col items-center justify-center space-y-3
            ${touchedButton === 'browse' ? 'scale-95' : 'hover:scale-105 active:scale-95'}
          `}
        >
          <div className="w-12 h-12 bg-livrili-prussian/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-livrili-prussian">
              {t('home.browse_products', 'Browse Products')}
            </h3>
          </div>
        </button>

        {/* Quick Reorder */}
        <button
          onClick={() => handleButtonPress('reorder', () => router.push('/cart?reorder=true'))}
          className={`
            bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100
            hover:border-livrili-fire hover:shadow-lg transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-livrili-fire/20
            min-h-[120px] flex flex-col items-center justify-center space-y-3
            ${touchedButton === 'reorder' ? 'scale-95' : 'hover:scale-105 active:scale-95'}
          `}
        >
          <div className="w-12 h-12 bg-livrili-fire/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🔄</span>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-livrili-fire">
              {t('home.quick_reorder', 'Quick Reorder')}
            </h3>
          </div>
        </button>

        {/* My Orders */}
        <button
          onClick={() => handleButtonPress('orders', () => router.push('/orders'))}
          className={`
            bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100
            hover:border-livrili-air hover:shadow-lg transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-livrili-air/20
            min-h-[120px] flex flex-col items-center justify-center space-y-3
            ${touchedButton === 'orders' ? 'scale-95' : 'hover:scale-105 active:scale-95'}
          `}
        >
          <div className="w-12 h-12 bg-livrili-air/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-livrili-air">
              {t('home.my_orders', 'My Orders')}
            </h3>
          </div>
        </button>

        {/* My Profile */}
        <button
          onClick={() => handleButtonPress('profile', () => router.push('/profile'))}
          className={`
            bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100
            hover:border-purple-500 hover:shadow-lg transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-purple-500/20
            min-h-[120px] flex flex-col items-center justify-center space-y-3
            ${touchedButton === 'profile' ? 'scale-95' : 'hover:scale-105 active:scale-95'}
          `}
        >
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-purple-600">
              {t('home.my_profile', 'My Profile')}
            </h3>
          </div>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-livrili-prussian flex items-center space-x-2 rtl:space-x-reverse">
            <span>📋</span>
            <span>{t('home.recent_orders', 'Recent Orders')}</span>
          </h3>
          <button
            onClick={() => router.push('/orders')}
            className="text-livrili-prussian text-sm font-medium hover:text-livrili-fire transition-colors"
          >
            {t('home.view_all', 'View All')} {isRTL ? '←' : '→'}
          </button>
        </div>

        {isLoadingOrders ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-medium text-livrili-prussian">
                      #{order.id.slice(-6)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {t(`order.status.${order.status}`, order.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-DZ')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.items.length} {t('home.items', 'items')} • {formatCurrency(order.total)}
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="px-3 py-1 bg-livrili-air/10 text-livrili-air text-xs font-medium rounded-lg hover:bg-livrili-air/20 transition-colors"
                    >
                      {t('home.view', 'View')} 👁️
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => router.push(`/cart?reorder=${order.id}`)}
                        className="px-3 py-1 bg-livrili-fire/10 text-livrili-fire text-xs font-medium rounded-lg hover:bg-livrili-fire/20 transition-colors"
                      >
                        {t('home.reorder', 'Reorder')} 🔄
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">📋</span>
            </div>
            <p className="text-gray-500 mb-4">
              {t('home.no_orders', 'No orders placed yet')}
            </p>
            <button
              onClick={() => router.push('/categories')}
              className="px-6 py-3 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 transition-colors hover:scale-105 active:scale-95"
            >
              {t('home.start_shopping', 'Start Shopping')}
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 mb-24">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-xs text-gray-500">{t('home.this_month', 'This Month')}</div>
          <div className="text-lg font-bold text-livrili-prussian">
            {retailerInfo?.monthlyOrders || 0}
          </div>
          <div className="text-xs text-gray-600">{t('home.orders', 'Orders')}</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-xs text-gray-500">{t('home.total_spent', 'Total Spent')}</div>
          <div className="text-sm font-bold text-livrili-prussian">
            {formatCurrency(retailerInfo?.totalSpent || 0)}
          </div>
        </div>
      </div>

          {/* Floating Cart Button */}
          <CartButton
            items={cartData?.items || []}
            totalAmount={cartData?.total || 0}
            itemCount={cartData?.itemCount || 0}
            onCartClick={() => router.push('/cart')}
            onCheckout={() => router.push('/checkout')}
            isFloating={true}
            showQuickActions={true}
          />
        </div>
      </PullToRefresh>
    </OnlineStatus>
  )
}