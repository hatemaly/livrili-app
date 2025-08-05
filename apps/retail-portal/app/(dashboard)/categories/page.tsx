'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VisualCategoryGrid } from '../../../components/products/visual-category-grid'
import { CartButton } from '../../../components/cart/cart-button'
import { api } from '../../../lib/trpc'
import { useLanguage, useRTL } from '@livrili/ui'

export default function CategoriesPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const { isRTL } = useRTL()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Fetch categories from API
  const { data: categories, isLoading } = api.retailer.products.getCategories.useQuery({
    language
  })
  
  // Get cart data for the floating cart button
  const { data: cartData } = api.retailer.cart.get.useQuery()

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'search') {
      // Handle search action
      return
    }
    if (categoryId === 'favorites') {
      router.push('/products/favorites')
      return
    }
    
    setSelectedCategory(categoryId)
    router.push(`/products/${categoryId}`)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const filteredCategories = categories?.filter(category =>
    category.name.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.name.fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.name.en.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-livrili-prussian/20 active:scale-95"
              aria-label={t('navigation.back', 'العودة')}
            >
              <span className="text-xl">{isRTL ? '→' : '←'}</span>
            </button>
            <h1 className="text-xl font-bold text-livrili-prussian flex-1">
              {t('categories.page_title', 'فئات المنتجات')}
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 transform -translate-y-1/2">
              <span className="text-xl text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('categories.search_placeholder', 'ابحث عن الفئات أو المنتجات...')}
              className={`
                w-full h-12 bg-gray-50 rounded-xl border border-gray-200
                ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}
                focus:outline-none focus:ring-2 focus:ring-livrili-prussian/20 focus:border-livrili-prussian
                transition-all duration-200 hover:bg-white hover:shadow-sm
              `}
              dir={isRTL ? 'rtl' : 'ltr'}
              aria-label={t('categories.search_aria', 'البحث في الفئات')}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 transform -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-livrili-prussian/20 rounded-full p-1 active:scale-95"
                aria-label={t('categories.clear_search', 'مسح البحث')}
              >
                <span className="text-lg text-gray-400 hover:text-gray-600 transition-colors">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {searchQuery ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-livrili-prussian">
                {t('categories.search_results', 'نتائج البحث')} "{searchQuery}"
              </h2>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-livrili-prussian text-white rounded-lg hover:bg-livrili-prussian/90 transition-colors"
              >
                {t('categories.search_button', 'بحث')}
              </button>
            </div>
            
            {filteredCategories && filteredCategories.length > 0 ? (
              <VisualCategoryGrid
                categories={filteredCategories}
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={selectedCategory}
                isLoading={false}
              />
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <span className="text-3xl text-gray-400">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {t('categories.no_results_title', 'لا توجد نتائج')}
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {t('categories.no_results', 'لم يتم العثور على فئات تحتوي على')} "{searchQuery}"
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-livrili-prussian/20"
                  >
                    {t('categories.clear_search', 'مسح البحث')}
                  </button>
                  <div className="text-sm text-gray-400">
                    {t('categories.search_suggestion', 'جرب البحث بكلمات مختلفة')}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <VisualCategoryGrid
            categories={categories}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategory}
            isLoading={isLoading}
          />
        )}

        {/* Popular Categories */}
        {!searchQuery && !isLoading && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-livrili-prussian mb-4 flex items-center space-x-2 rtl:space-x-reverse">
              <span>🔥</span>
              <span>{t('categories.popular', 'الفئات الأكثر طلباً')}</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {categories?.slice(0, 6).map((category) => (
                <button
                  key={`popular-${category.id}`}
                  onClick={() => handleCategorySelect(category.id)}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-livrili-prussian hover:shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <div className="text-center">
                    <span className="text-2xl block mb-1">{category.emoji}</span>
                    <span className="text-xs font-medium text-gray-700 block leading-tight">
                      {category.name[language]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-livrili-papaya/20 rounded-xl p-4">
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h4 className="font-semibold text-livrili-prussian mb-2">
                {t('categories.help_title', 'نصائح للتسوق')}
              </h4>
              <ul className="text-sm text-livrili-prussian space-y-1">
                <li>• {t('categories.tip_1', 'اضغط على الفئة لرؤية المنتجات المتاحة')}</li>
                <li>• {t('categories.tip_2', 'استخدم البحث للعثور على منتجات محددة')}</li>
                <li>• {t('categories.tip_3', 'تحقق من الفئات الأكثر طلباً أسفل الصفحة')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <CartButton
        items={cartData?.items || []}
        totalAmount={cartData?.total || 0}
        itemCount={cartData?.itemCount || 0}
        onCartClick={() => router.push('/cart')}
        onCheckout={() => router.push('/cart?checkout=true')}
        isFloating={true}
        showQuickActions={true}
      />
    </div>
  )
}