'use client'

import { useLanguage, useRTL } from '@livrili/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

import { CartButton } from '../../../components/cart/cart-button'
import { VisualCategoryGrid } from '../../../components/products/visual-category-grid'
import { PullToRefresh } from '../../../components/common/pull-to-refresh'
import { CategoryCardSkeleton } from '../../../components/common/loading-skeleton'
import { ErrorBoundary, LoadingErrorFallback } from '../../../components/common/error-boundary'
import { HapticButton, TouchFeedback, useHapticFeedback } from '../../../components/common/haptic-button'
import { OnlineStatus } from '../../../components/common/offline-indicator'
import { api } from '../../../lib/trpc'


function CategoriesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const { isRTL } = useRTL()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const haptic = useHapticFeedback()
  
  const suggested = searchParams.get('suggested')
  
  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent_category_searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (e) {
        console.warn('Failed to parse recent searches')
      }
    }
  }, [])

  // Fetch categories from API with error handling
  const { data: categoriesData, isLoading, error, refetch } = api.retailer.products.getCategories.useQuery({
    language
  }, {
    retry: 2,
    retryDelay: 1000,
  })
  
  // Extract categories from API response
  const categories = categoriesData?.categories || []
  
  // Get cart data for the floating cart button
  const { data: cartData } = api.retailer.cart.get.useQuery()

  const handleCategorySelect = (categoryId: string) => {
    haptic('medium')
    
    if (categoryId === 'search') {
      // Focus on search input
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
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
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      // Add to recent searches
      const updated = [trimmedQuery, ...recentSearches.filter(s => s !== trimmedQuery)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recent_category_searches', JSON.stringify(updated))
      
      haptic('light')
      router.push(`/products/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }
  
  const handleRefresh = async () => {
    await refetch()
    haptic('success')
  }
  
  const clearSearch = () => {
    setSearchQuery('')
    haptic('light')
  }

  const filteredCategories = categories.filter(category =>
    category.multilingual.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.multilingual.name_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.multilingual.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <LoadingErrorFallback 
          error={error} 
          retry={handleRefresh} 
        />
      </div>
    )
  }

  return (
    <OnlineStatus>
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10 safe-top">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
              <HapticButton
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200"
                hapticType="light"
                aria-label={t('navigation.back', 'Back')}
              >
                <span className="text-xl">{isRTL ? '→' : '←'}</span>
              </HapticButton>
              <h1 className="text-xl font-bold text-livrili-prussian flex-1">
                {t('categories.page_title', 'Product Categories')}
              </h1>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative">
              <div className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-xl text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                placeholder={t('categories.search_placeholder', 'Search for categories or products...')}
                className={`
                  w-full h-14 bg-gray-50 rounded-xl border-2 border-gray-200
                  ${isRTL ? 'pr-12 pl-16 text-right font-arabic' : 'pl-12 pr-16 text-left'}
                  focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20 focus:border-livrili-prussian
                  transition-all duration-200 hover:bg-white hover:shadow-sm text-lg
                `}
                dir={isRTL ? 'rtl' : 'ltr'}
                aria-label={t('categories.search_aria', 'Search categories')}
              />
              
              <div className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 rtl:space-x-reverse">
                {searchQuery && (
                  <TouchFeedback onPress={clearSearch} hapticType="light">
                    <button
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                      aria-label={t('categories.clear_search', 'Clear search')}
                    >
                      <span className="text-sm text-gray-600">✕</span>
                    </button>
                  </TouchFeedback>
                )}
                
                <TouchFeedback onPress={handleSearch} hapticType="medium">
                  <button
                    className="w-10 h-10 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 flex items-center justify-center transition-all duration-200 shadow-lg"
                    aria-label={t('categories.search_button', 'Search')}
                  >
                    <span className="text-lg">🔍</span>
                  </button>
                </TouchFeedback>
              </div>
            </div>
            
            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                  <span className="text-xs font-medium text-gray-500">⏰</span>
                  <span className="text-xs font-medium text-gray-500">
                    {t('categories.recent_searches', 'Recent Searches')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <TouchFeedback
                      key={index}
                      onPress={() => {
                        setSearchQuery(search)
                        handleSearch()
                      }}
                      hapticType="light"
                    >
                      <div className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-sm text-gray-700 transition-colors">
                        {search}
                      </div>
                    </TouchFeedback>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Suggested Products Banner */}
          {suggested && (
            <div className="mb-6 bg-gradient-to-r from-livrili-papaya to-yellow-100 rounded-2xl p-4 border-2 border-yellow-200 animate-slide-down">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="text-2xl animate-bounce">💡</span>
                <div className="flex-1">
                  <h3 className="font-bold text-livrili-prussian">
                    {t('categories.suggested_title', 'Suggested Products')}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {t('categories.suggested_description', 'These popular items can help you reach the minimum order')}
                  </p>
                </div>
              </div>
            </div>
          )}
          {searchQuery ? (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-livrili-prussian">
                  {t('categories.search_results', 'Search Results')} "{searchQuery}"
                </h2>
                <HapticButton
                  onClick={handleSearch}
                  variant="brand"
                  size="sm"
                  hapticType="medium"
                  className="px-4 py-2 rounded-lg"
                >
                  {t('categories.search_button', 'Search')}
                </HapticButton>
              </div>
              
              {filteredCategories.length > 0 ? (
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
                    {t('categories.no_results_title', 'No Results')}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    {t('categories.no_results', 'No categories found containing')} "{searchQuery}"
                  </p>
                  <div className="space-y-3">
                    <HapticButton
                      onClick={clearSearch}
                      variant="brand"
                      size="lg"
                      hapticType="medium"
                      className="px-6 py-3 rounded-xl"
                    >
                      {t('categories.clear_search', 'Clear search')}
                    </HapticButton>
                    <div className="text-sm text-gray-400">
                      {t('categories.search_suggestion', 'Try searching with different keywords')}
                    </div>
                    <HapticButton
                      onClick={() => window.open(`https://wa.me/213XXXXXXXXX?text=${encodeURIComponent(`I'm looking for: ${searchQuery}`)}`,'_blank')}
                      variant="ghost"
                      size="sm"
                      hapticType="light"
                      className="text-green-600 hover:text-green-700"
                    >
                      💬 {t('categories.request_whatsapp', 'Request via WhatsApp')}
                    </HapticButton>
                  </div>
                </div>
              )}
            </div>
          ) : isLoading ? (
              <div className="grid grid-cols-2 gap-4 animate-pulse">
                {Array.from({ length: 8 }).map((_, index) => (
                  <CategoryCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <VisualCategoryGrid
                categories={categories}
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={selectedCategory}
                isLoading={false}
              />
            )}

          {/* Popular Categories */}
          {!searchQuery && !isLoading && categories.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-livrili-prussian mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                <span className="animate-pulse">🔥</span>
                <span>{t('categories.popular', 'Most Popular Categories')}</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {categories.slice(0, 6).map((category) => (
                  <TouchFeedback
                    key={`popular-${category.id}`}
                    onPress={() => handleCategorySelect(category.id)}
                    hapticType="medium"
                  >
                    <div className="p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-livrili-prussian hover:shadow-lg transition-all duration-200 touch-feedback">
                      <div className="text-center">
                        <span className="text-2xl block mb-1">{category.emoji}</span>
                        <span className={`text-xs font-medium text-gray-700 block leading-tight ${isRTL ? 'font-arabic' : ''}`}>
                          {category.name[language]}
                        </span>
                        {category.count && (
                          <span className="text-xs text-gray-500 mt-1 block">
                            {category.count} {t('categories.items', 'items')}
                          </span>
                        )}
                      </div>
                    </div>
                  </TouchFeedback>
                ))}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-gradient-to-r from-livrili-papaya/20 to-yellow-50 rounded-xl p-4 border border-livrili-papaya/30">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-livrili-papaya rounded-full flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-livrili-prussian mb-2">
                  {t('categories.help_title', 'Shopping Tips')}
                </h4>
                <ul className="text-sm text-livrili-prussian space-y-2">
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-livrili-prussian rounded-full"></span>
                    <span>{t('categories.tip_1', 'Touch a category to see available products')}</span>
                  </li>
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-livrili-prussian rounded-full"></span>
                    <span>{t('categories.tip_2', 'Use search to find specific products quickly')}</span>
                  </li>
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-livrili-prussian rounded-full"></span>
                    <span>{t('categories.tip_3', 'Pull down to refresh categories')}</span>
                  </li>
                </ul>
                
                <div className="mt-3 pt-3 border-t border-livrili-papaya/50">
                  <TouchFeedback
                    onPress={() => window.open('https://wa.me/213XXXXXXXXX?text=' + encodeURIComponent(t('help.category_help', 'I need help finding products')), '_blank')}
                    hapticType="light"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-600 hover:text-green-700 text-sm">
                      <span>💬</span>
                      <span>{t('categories.need_help', 'Need help? Contact us')}</span>
                    </div>
                  </TouchFeedback>
                </div>
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
      </PullToRefresh>
    </OnlineStatus>
  )
}

export default function CategoriesPage() {
  return (
    <ErrorBoundary fallback={LoadingErrorFallback}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-livrili-prussian border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-livrili-prussian font-medium">Loading categories...</p>
          </div>
        </div>
      }>
        <CategoriesPageContent />
      </Suspense>
    </ErrorBoundary>
  )
}