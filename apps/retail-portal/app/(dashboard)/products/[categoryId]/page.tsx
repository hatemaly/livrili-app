'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { ProductCard } from '../../../../components/products/product-card'
import { CartButton } from '../../../../components/cart/cart-button'
import { api } from '../../../../lib/trpc'
import { useLanguage, useRTL } from '@livrili/ui'
import { toast } from 'sonner'

type FilterType = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
type SortType = 'popular' | 'price-asc' | 'price-desc' | 'name'

interface ProductFilters {
  inStockOnly: boolean
  sortBy: SortType
}

interface ProductsResponse {
  products: any[]
  hasMore: boolean
  nextCursor?: string
}

export default function ProductsPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.categoryId as string
  const { t, language } = useLanguage()
  const { isRTL } = useRTL()
  
  // Filter and sort state
  const [filters, setFilters] = useState<ProductFilters>({
    inStockOnly: false,
    sortBy: 'popular'
  })
  
  // Infinite scroll state
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | undefined>()
  
  // Refs
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  // Success feedback state
  const [addToCartFeedback, setAddToCartFeedback] = useState<string | null>(null)

  // tRPC queries
  const { data: initialData, isLoading: isLoadingInitial } = api.retailer.products.getProducts.useQuery({
    categoryId,
    limit: 20,
    cursor: undefined,
    filters: {
      inStockOnly: filters.inStockOnly,
      sortBy: filters.sortBy
    }
  })
  
  const { data: category, isLoading: isLoadingCategory } = api.retailer.products.getCategoryById.useQuery({
    categoryId,
  })

  const { data: cartItems, refetch: refetchCart } = api.retailer.cart.get.useQuery()
  
  const { data: recommendations } = api.retailer.products.getRecommendations.useQuery(
    { categoryId, limit: 6 },
    { enabled: allProducts.length === 0 && !isLoadingInitial }
  )

  // Initialize products from first load
  useEffect(() => {
    if (initialData?.products) {
      setAllProducts(initialData.products)
      setHasMore(initialData.hasMore)
      setCursor(initialData.nextCursor)
    }
  }, [initialData])
  
  // Reset products when filters change
  useEffect(() => {
    setAllProducts([])
    setHasMore(true)
    setCursor(undefined)
  }, [filters, categoryId])
  
  // Load more products mutation
  const loadMoreMutation = api.retailer.products.getProducts.useMutation({
    onSuccess: (data) => {
      setAllProducts(prev => [...prev, ...data.products])
      setHasMore(data.hasMore)
      setCursor(data.nextCursor)
      setIsLoadingMore(false)
    },
    onError: () => {
      setIsLoadingMore(false)
      toast.error(t('products.load_error', 'فشل في تحميل المنتجات'))
    }
  })
  
  // Load more function
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || loadMoreMutation.isLoading) return
    
    setIsLoadingMore(true)
    loadMoreMutation.mutate({
      categoryId,
      limit: 20,
      cursor,
      filters
    })
  }, [categoryId, cursor, filters, hasMore, isLoadingMore, loadMoreMutation])
  
  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore])

  const addToCartMutation = api.retailer.cart.addItem.useMutation({
    onSuccess: (data, variables) => {
      refetchCart()
      const product = allProducts.find(p => p.id === variables.productId)
      const productName = product?.name[language] || t('product.item', 'المنتج')
      
      // Show success feedback
      setAddToCartFeedback(productName)
      setTimeout(() => setAddToCartFeedback(null), 2000)
      
      toast.success(
        t('cart.added_success', `تم إضافة ${productName} إلى السلة`),
        {
          duration: 2000,
          position: isRTL ? 'top-left' : 'top-right'
        }
      )
    },
    onError: (error) => {
      toast.error(
        error.message || t('cart.add_error', 'فشل في إضافة المنتج للسلة'),
        {
          duration: 3000,
          position: isRTL ? 'top-left' : 'top-right'
        }
      )
    }
  })
  
  // Track product views mutation
  const trackViewMutation = api.retailer.analytics.trackProductView.useMutation()

  const handleAddToCart = async (productId: string, quantity: number) => {
    await addToCartMutation.mutateAsync({ productId, quantity })
  }
  
  const handleProductClick = (productId: string) => {
    // Track product view
    trackViewMutation.mutate({ productId, categoryId })
    
    // Navigate to product details (if route exists)
    // router.push(`/products/${productId}`)
  }

  const cartItemsCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const cartTotal = cartItems?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0

  if (isLoadingCategory || isLoadingInitial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-livrili-prussian border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-livrili-prussian font-medium">
            {t('products.loading', 'جاري تحميل المنتجات...')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="text-xl">{isRTL ? '←' : '→'}</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-livrili-prussian">
                {category?.name[language] || t('products.category', 'المنتجات')}
              </h1>
              <p className="text-sm text-gray-600">
                {allProducts.length} {t('products.items_available', 'منتج متوفر')}
                {hasMore && (
                  <span className="text-livrili-prussian font-medium ml-2 rtl:ml-0 rtl:mr-2">
                    {t('products.load_more_available', '+ المزيد متاح')}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* In Stock Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                  className="w-5 h-5 text-livrili-prussian bg-gray-100 border-gray-300 rounded focus:ring-livrili-prussian focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-900">
                  ✅ {t('products.filter.in_stock_only', 'المتوفر فقط')}
                </span>
              </label>
              
              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SortType }))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-livrili-prussian/20 focus:border-livrili-prussian"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="popular">🔥 {t('products.sort.popular', 'الأكثر طلباً')}</option>
                <option value="name">🔤 {t('products.sort.name', 'الاسم')}</option>
                <option value="price-asc">📈 {t('products.sort.price_low', 'السعر: الأقل أولاً')}</option>
                <option value="price-desc">📉 {t('products.sort.price_high', 'السعر: الأعلى أولاً')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {allProducts.length > 0 ? (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    inStock: product.stock > 0,
                    stockCount: product.stock
                  }}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleProductClick}
                  cartQuantity={cartItems?.find(item => item.productId === product.id)?.quantity || 0}
                  isAddingToCart={addToCartMutation.isLoading}
                />
              ))}
            </div>
            
            {/* Load More / Loading Indicator */}
            <div ref={loadMoreRef} className="text-center py-8">
              {isLoadingMore ? (
                <div className="space-y-4">
                  <div className="w-8 h-8 border-4 border-livrili-prussian border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-600">{t('products.loading_more', 'جاري تحميل المزيد...')}</p>
                </div>
              ) : hasMore ? (
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 transition-colors font-medium"
                >
                  📦 {t('products.load_more', 'تحميل المزيد')}
                </button>
              ) : (
                <div className="text-gray-500">
                  <span className="text-2xl mb-2 block">✅</span>
                  <p>{t('products.all_loaded', 'تم عرض جميع المنتجات')}</p>
                </div>
              )}
            </div>
          </>
        ) : !isLoadingInitial ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('products.no_products', 'لا توجد منتجات في هذه الفئة')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('products.try_different_filter', 'جرب فلتر مختلف أو تصفح فئات أخرى')}
            </p>
            
            {/* Show Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-livrili-prussian">
                  💡 {t('products.recommendations', 'منتجات مقترحة')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                  {recommendations.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/products/${product.categoryId}`)}
                      className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                    >
                      <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name[language]} 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {product.name[language]}
                      </h5>
                      <p className="text-xs text-livrili-prussian font-bold">
                        {new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
                          style: 'currency',
                          currency: 'DZD',
                          minimumFractionDigits: 0,
                        }).format(product.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3 mt-8">
              <button
                onClick={() => setFilters({ inStockOnly: false, sortBy: 'popular' })}
                className="px-6 py-3 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 transition-colors block mx-auto"
              >
                {t('products.reset_filters', 'إعادة تعيين الفلاتر')}
              </button>
              <button
                onClick={() => router.push('/categories')}
                className="px-6 py-3 bg-white text-livrili-prussian border-2 border-livrili-prussian rounded-xl hover:bg-livrili-prussian/5 transition-colors block mx-auto"
              >
                {t('products.browse_categories', 'تصفح الفئات الأخرى')}
              </button>
            </div>
          </div>
        ) : null}

        {/* Category info */}
        {category && (
          <div className="mt-8 p-4 bg-white rounded-xl">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="text-3xl">{category.emoji}</span>
              <div>
                <h3 className="font-semibold text-livrili-prussian">
                  {category.name[language]}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description?.[language] || t('products.category_description', 'منتجات عالية الجودة')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Feedback Toast */}
      {addToCartFeedback && (
        <div className={`
          fixed top-20 z-50 transform transition-all duration-500
          ${isRTL ? 'right-4' : 'left-4'}
        `}>
          <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 rtl:space-x-reverse animate-slide-down">
            <span className="text-lg">✅</span>
            <span className="font-medium">
              {t('cart.added_to_cart', `تم إضافة ${addToCartFeedback} للسلة`)}
            </span>
          </div>
        </div>
      )}
      
      {/* Floating Cart Button */}
      {cartItemsCount > 0 && (
        <CartButton
          itemCount={cartItemsCount}
          totalAmount={cartTotal}
          onCartClick={() => router.push('/cart')}
          onCheckout={() => router.push('/checkout')}
          showQuickActions={true}
          items={cartItems?.map(item => ({
            id: item.id,
            name: item.product?.name[language] || item.productId,
            price: item.price,
            quantity: item.quantity,
            image: item.product?.image
          }))}
        />
      )}
      
      {/* Loading Skeletons */}
      {isLoadingInitial && (
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}