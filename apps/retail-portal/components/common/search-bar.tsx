'use client'

import { useLanguage, useRTL } from '@livrili/ui'
import { Search, X, Filter, Clock, TrendingUp, Package } from 'lucide-react'
import React, { useState, useEffect, useRef, useMemo } from 'react'

interface SearchResult {
  id: string
  type: 'product' | 'category' | 'brand'
  name: {
    ar: string
    fr: string
    en: string
  }
  description?: {
    ar: string
    fr: string
    en: string
  }
  category?: string
  price?: number
  image?: string
  popularity?: number
}

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string, filters?: SearchFilters) => void
  onResultSelect?: (result: SearchResult) => void
  results?: SearchResult[]
  isLoading?: boolean
  showFilters?: boolean
  recentSearches?: string[]
  popularSearches?: string[]
  className?: string
}

interface SearchFilters {
  category?: string
  priceRange?: [number, number]
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'popularity'
  inStock?: boolean
}

export function SearchBar({
  placeholder,
  onSearch,
  onResultSelect,
  results = [],
  isLoading = false,
  showFilters = true,
  recentSearches = [],
  popularSearches = [],
  className = ''
}: SearchBarProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showFilters, setShowFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Categories for filter
  const categories = [
    { id: 'dairy', name: { ar: 'منتجات الألبان', fr: 'Produits laitiers', en: 'Dairy Products' } },
    { id: 'snacks', name: { ar: 'وجبات خفيفة', fr: 'Collations', en: 'Snacks' } },
    { id: 'beverages', name: { ar: 'المشروبات', fr: 'Boissons', en: 'Beverages' } },
    { id: 'cleaning', name: { ar: 'منظفات', fr: 'Nettoyage', en: 'Cleaning' } },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowFiltersOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0 && results[highlightedIndex]) {
            handleResultSelect(results[highlightedIndex])
          } else {
            handleSearch()
          }
          break
        case 'Escape':
          setIsOpen(false)
          setShowFiltersOpen(false)
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightedIndex, results])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setHighlightedIndex(-1)
    
    if (value.trim()) {
      setIsOpen(true)
      // Debounced search would go here
      setTimeout(() => onSearch(value, filters), 300)
    } else {
      setIsOpen(false)
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, filters)
      setIsOpen(false)
      
      // Add to recent searches (would be stored in localStorage)
      if (!recentSearches.includes(query.trim())) {
        // This would update the parent component's recent searches
      }
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    setQuery(result.name[language])
    setIsOpen(false)
    onResultSelect?.(result)
  }

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm)
    onSearch(searchTerm, filters)
    setIsOpen(false)
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4" />
      case 'category': return <Filter className="w-4 h-4" />
      case 'brand': return <TrendingUp className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Memoized filtered results for better performance
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      if (filters.category && result.type === 'product') {
        return result.category === filters.category
      }
      if (filters.inStock && result.type === 'product') {
        // Would check stock status
      }
      return true
    }).slice(0, 8) // Limit results for mobile
  }, [results, filters])

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || t('search.placeholder', 'Search products, categories, brands...')}
          className={`
            w-full h-14 pl-12 pr-20 rtl:pl-20 rtl:pr-12 text-lg rounded-2xl border-2 border-gray-200 
            focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20 focus:border-livrili-prussian 
            bg-white transition-all duration-200 hover:border-gray-300
            ${isRTL ? 'text-right font-arabic' : 'text-left'}
          `}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        
        <div className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 rtl:space-x-reverse">
          {query && (
            <button
              onClick={clearSearch}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setShowFiltersOpen(!showFilters)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                ${showFilters 
                  ? 'bg-livrili-prussian text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }
              `}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-6">
              <div className="w-6 h-6 border-2 border-livrili-prussian border-t-transparent rounded-full animate-spin mr-3 rtl:mr-0 rtl:ml-3" />
              <span className="text-gray-600">{t('search.searching', 'Searching...')}</span>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center space-x-2 rtl:space-x-reverse">
                <Filter className="w-4 h-4" />
                <span>{t('search.filters', 'Filters')}</span>
              </h4>
              
              <div className="space-y-3">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    {t('search.category', 'Category')}
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-livrili-prussian/20"
                  >
                    <option value="">{t('search.all_categories', 'All Categories')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name[language]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    {t('search.sort_by', 'Sort By')}
                  </label>
                  <select
                    value={filters.sortBy || 'relevance'}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SearchFilters['sortBy'] }))}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-livrili-prussian/20"
                  >
                    <option value="relevance">{t('search.relevance', 'Relevance')}</option>
                    <option value="price_low">{t('search.price_low_high', 'Price: Low to High')}</option>
                    <option value="price_high">{t('search.price_high_low', 'Price: High to Low')}</option>
                    <option value="popularity">{t('search.popularity', 'Popularity')}</option>
                  </select>
                </div>

                {/* In Stock Toggle */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    id="in-stock"
                    checked={filters.inStock || false}
                    onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked || undefined }))}
                    className="w-4 h-4 text-livrili-prussian border-gray-300 rounded focus:ring-livrili-prussian"
                  />
                  <label htmlFor="in-stock" className="text-sm text-gray-700">
                    {t('search.in_stock_only', 'In Stock Only')}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {!isLoading && filteredResults.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              {filteredResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className={`
                    w-full p-4 text-left rtl:text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors
                    ${highlightedIndex === index ? 'bg-livrili-prussian/5' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="text-gray-400">
                      {getResultIcon(result.type)}
                    </div>
                    
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.name[language]} 
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {result.name[language]}
                      </p>
                      {result.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {result.description[language]}
                        </p>
                      )}
                      {result.category && (
                        <p className="text-xs text-gray-400">
                          {categories.find(c => c.id === result.category)?.name[language]}
                        </p>
                      )}
                    </div>
                    
                    {result.price && (
                      <div className="text-sm font-semibold text-livrili-prussian">
                        {formatPrice(result.price)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent & Popular Searches */}
          {!isLoading && query.length < 2 && (recentSearches.length > 0 || popularSearches.length > 0) && (
            <div className="p-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center space-x-2 rtl:space-x-reverse">
                    <Clock className="w-4 h-4" />
                    <span>{t('search.recent', 'Recent Searches')}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 4).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {popularSearches.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center space-x-2 rtl:space-x-reverse">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('search.popular', 'Popular Searches')}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.slice(0, 4).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="px-3 py-1 bg-livrili-prussian/10 text-livrili-prussian text-sm rounded-full hover:bg-livrili-prussian/20 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && filteredResults.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('search.no_results', 'No results found')}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {t('search.no_results_description', 'Try different keywords or check your spelling')}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setFilters({})}
                  className="text-sm text-livrili-prussian hover:text-livrili-prussian/80 font-medium"
                >
                  {t('search.clear_filters', 'Clear Filters')}
                </button>
                
                <div className="text-xs text-gray-500">
                  {t('search.or', 'or')}
                </div>
                
                <button
                  onClick={() => window.open(`https://wa.me/213XXXXXXXXX?text=${encodeURIComponent(`I'm looking for: ${query}`)}`)}
                  className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition-colors"
                >
                  {t('search.request_product', 'Request this product via WhatsApp')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}