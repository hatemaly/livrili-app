'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../../lib/trpc'
import { useLanguage, useRTL } from '@livrili/ui'
import { CartButton } from '../../../components/cart/cart-button'

export default function HomePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { isRTL } = useRTL()
  
  // Get retailer info and recent orders
  const { data: retailerInfo, isLoading: isLoadingRetailer } = api.retailer.profile.get.useQuery()
  const { data: recentOrders, isLoading: isLoadingOrders } = api.retailer.orders.getRecent.useQuery({
    limit: 3,
  })
  // Get cart data for the floating cart button
  const { data: cartData } = api.retailer.cart.get.useQuery()
  
  const [touchedButton, setTouchedButton] = useState<string | null>(null)

  const handleButtonPress = (buttonId: string, action: () => void) => {
    setTouchedButton(buttonId)
    setTimeout(() => {
      action()
      setTouchedButton(null)
    }, 150)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoadingRetailer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-livrili-prussian border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-livrili-prussian font-medium">
            {t('home.loading', 'جاري التحميل...')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header with Welcome & Credit Balance */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-livrili-prussian to-livrili-prussian/80 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl text-white">🏪</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-livrili-prussian">
              {t('home.welcome', 'مرحبا')} {retailerInfo?.businessName || t('home.retailer', 'تاجر')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('home.subtitle', 'اطلب منتجاتك وادر متجرك بسهولة')}
            </p>
          </div>
        </div>
        
        {/* Prominent Credit Balance */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{t('home.current_balance', 'الرصيد الحالي')}</p>
                <p className={`text-2xl font-bold ${
                  (retailerInfo?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(retailerInfo?.balance || 0)}
                </p>
              </div>
            </div>
            <div className="text-right rtl:text-left">
              <div className="text-xs text-gray-500">{t('home.credit_limit', 'الحد الائتماني')}</div>
              <div className="text-sm font-semibold text-livrili-prussian">
                {formatCurrency(retailerInfo?.creditLimit || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

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
              {t('home.browse_products', 'تصفح المنتجات')}
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
              {t('home.quick_reorder', 'إعادة طلب سريع')}
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
              {t('home.my_orders', 'طلباتي')}
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
              {t('home.my_profile', 'ملفي الشخصي')}
            </h3>
          </div>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-livrili-prussian flex items-center space-x-2 rtl:space-x-reverse">
            <span>📋</span>
            <span>{t('home.recent_orders', 'الطلبات الأخيرة')}</span>
          </h3>
          <button
            onClick={() => router.push('/orders')}
            className="text-livrili-prussian text-sm font-medium hover:text-livrili-fire transition-colors"
          >
            {t('home.view_all', 'عرض الكل')} {isRTL ? '←' : '→'}
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
                    {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.items.length} {t('home.items', 'منتج')} • {formatCurrency(order.total)}
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="px-3 py-1 bg-livrili-air/10 text-livrili-air text-xs font-medium rounded-lg hover:bg-livrili-air/20 transition-colors"
                    >
                      {t('home.view', 'عرض')} 👁️
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => router.push(`/cart?reorder=${order.id}`)}
                        className="px-3 py-1 bg-livrili-fire/10 text-livrili-fire text-xs font-medium rounded-lg hover:bg-livrili-fire/20 transition-colors"
                      >
                        {t('home.reorder', 'إعادة طلب')} 🔄
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
              {t('home.no_orders', 'لم تقم بأي طلبات بعد')}
            </p>
            <button
              onClick={() => router.push('/categories')}
              className="px-6 py-3 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 transition-colors hover:scale-105 active:scale-95"
            >
              {t('home.start_shopping', 'ابدأ التسوق')}
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 mb-24">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-xs text-gray-500">{t('home.this_month', 'هذا الشهر')}</div>
          <div className="text-lg font-bold text-livrili-prussian">
            {retailerInfo?.monthlyOrders || 0}
          </div>
          <div className="text-xs text-gray-600">{t('home.orders', 'طلب')}</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-xs text-gray-500">{t('home.total_spent', 'إجمالي المصروف')}</div>
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
  )
}