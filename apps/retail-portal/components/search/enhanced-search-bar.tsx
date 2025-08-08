'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button, useLanguage, useRTL } from '@livrili/ui'
import { HapticButton } from '@/components/common/haptic-button'
import { debounce } from 'lodash'

interface SearchSuggestion {
  id: string
  text: string
  type: 'product' | 'category' | 'brand' | 'recent'
  image?: string
  category?: string
  price?: number
}

interface EnhancedSearchBarProps {
  placeholder?: string
  suggestions?: SearchSuggestion[]
  recentSearches?: string[]
  trendingSearches?: string[]
  onSearch?: (query: string, filters?: any) => void
  onVoiceSearch?: () => void
  onBarcodeSearch?: () => void
  onFilterToggle?: () => void
  filters?: any
  isLoading?: boolean
  className?: string
  showFilters?: boolean
  showVoiceSearch?: boolean
  showBarcodeSearch?: boolean
}

export function EnhancedSearchBar({
  placeholder,
  suggestions = [],
  recentSearches = [],
  trendingSearches = [],
  onSearch,
  onVoiceSearch,
  onBarcodeSearch,
  onFilterToggle,
  filters,
  isLoading = false,
  className = '',
  showFilters = true,
  showVoiceSearch = true,
  showBarcodeSearch = true
}: EnhancedSearchBarProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const router = useRouter()
  
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognition = useRef<any>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Initialize speech recognition
  useEffect(() => {
    if (showVoiceSearch && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition()
        recognition.current.continuous = false
        recognition.current.interimResults = false
        recognition.current.lang = language === 'ar' ? 'ar-SA' : 'en-US'
        
        recognition.current.onstart = () => {
          setIsListening(true)
        }
        
        recognition.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setQuery(transcript)
          handleSearch(transcript)
        }
        
        recognition.current.onend = () => {
          setIsListening(false)
        }
        
        recognition.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }
  }, [language, showVoiceSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex(prev => Math.max(prev - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && suggestions[activeIndex]) {
            handleSuggestionClick(suggestions[activeIndex])
          } else {
            handleSearch(query)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setActiveIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, activeIndex, suggestions, query])

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim().length > 2) {
        onSearch?.(searchQuery, filters)
      }
    }, 300),
    [onSearch, filters]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    setActiveIndex(-1)
    debouncedSearch(value)
  }

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim(), filters)
      setIsOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
      
      // Save to recent searches
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      const updated = [searchQuery, ...recent.filter((s: string) => s !== searchQuery)].slice(0, 10)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    handleSearch(suggestion.text)
  }

  const handleVoiceSearch = () => {
    if (recognition.current && !isListening) {
      try {
        recognition.current.start()
        onVoiceSearch?.()
      } catch (error) {
        console.error('Voice search error:', error)
      }
    }
  }

  const handleBarcodeSearch = () => {
    setIsCameraOpen(true)
    onBarcodeSearch?.()
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const displaySuggestions = query.length > 0 ? suggestions : []
  const showRecentOrTrending = query.length === 0 && (recentSearches.length > 0 || trendingSearches.length > 0)

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className={`
          flex items-center bg-white border-2 border-gray-200 rounded-2xl 
          focus-within:border-livrili-prussian focus-within:ring-2 focus-within:ring-livrili-prussian/20
          transition-all duration-200 shadow-sm hover:shadow-md
          ${isOpen ? 'rounded-b-none' : ''}
        `}>
          {/* Search Icon */}
          <div className={`flex items-center justify-center w-12 h-12 ${isRTL ? 'order-last' : ''}`}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-livrili-prussian border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || t('search.placeholder', 'Search products, brands, categories...')}
            className="flex-1 py-3 px-2 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
            dir={isRTL ? 'rtl' : 'ltr'}
          />

          {/* Clear Button */}
          {query && (
            <HapticButton
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </HapticButton>
          )}

          {/* Action Buttons */}
          <div className={`flex items-center space-x-1 px-2 ${isRTL ? 'order-first space-x-reverse' : ''}`}>
            {/* Voice Search */}
            {showVoiceSearch && (
              <HapticButton
                onClick={handleVoiceSearch}
                disabled={isListening}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'text-gray-400 hover:text-livrili-prussian hover:bg-livrili-prussian/10'
                  }
                `}
                title={t('search.voice_search', 'Voice search')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </HapticButton>
            )}

            {/* Barcode Scanner */}
            {showBarcodeSearch && (
              <HapticButton
                onClick={handleBarcodeSearch}
                className="p-2 text-gray-400 hover:text-livrili-prussian hover:bg-livrili-prussian/10 rounded-lg transition-all duration-200"
                title={t('search.barcode_scan', 'Scan barcode')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </HapticButton>
            )}

            {/* Filters Toggle */}
            {showFilters && (
              <HapticButton
                onClick={onFilterToggle}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${filters && Object.keys(filters).length > 0
                    ? 'bg-livrili-prussian/10 text-livrili-prussian'
                    : 'text-gray-400 hover:text-livrili-prussian hover:bg-livrili-prussian/10'
                  }
                `}
                title={t('search.filters', 'Filters')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {filters && Object.keys(filters).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-livrili-fire rounded-full" />
                )}
              </HapticButton>
            )}
          </div>
        </div>

        {/* Voice Search Indicator */}
        {isListening && (
          <div className="absolute top-full left-0 right-0 bg-red-50 border-2 border-red-200 border-t-0 rounded-b-2xl p-4 z-50">
            <div className="flex items-center justify-center space-x-3 text-red-600">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1 h-4 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-4 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="font-medium">{t('search.listening', 'Listening...')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !isListening && (
        <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 border-t-0 rounded-b-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {displaySuggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                {t('search.suggestions', 'Suggestions')}
              </div>
              {displaySuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    ${index === activeIndex ? 'bg-livrili-prussian/5' : ''}
                  `}
                >
                  {/* Suggestion Image */}
                  {suggestion.image && (
                    <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                      <Image
                        src={suggestion.image}
                        alt={suggestion.text}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}

                  {/* Suggestion Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium truncate">
                        {suggestion.text}
                      </span>
                      {suggestion.price && (
                        <span className="text-livrili-prussian font-semibold ml-2">
                          {formatPrice(suggestion.price)}
                        </span>
                      )}
                    </div>
                    {suggestion.category && (
                      <span className="text-sm text-gray-500">
                        in {suggestion.category}
                      </span>
                    )}
                  </div>

                  {/* Suggestion Type Icon */}
                  <div className="ml-3 text-gray-400">
                    {suggestion.type === 'product' && (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                    {suggestion.type === 'category' && (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )}
                    {suggestion.type === 'brand' && (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    )}
                    {suggestion.type === 'recent' && (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showRecentOrTrending && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                {t('search.recent', 'Recent Searches')}
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {showRecentOrTrending && trendingSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                {t('search.trending', 'Trending')}
              </div>
              {trendingSearches.slice(0, 5).map((search, index) => (
                <button
                  key={`trending-${index}`}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-gray-700">{search}</span>
                  <div className="ml-auto flex items-center">
                    <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length > 2 && displaySuggestions.length === 0 && (
            <div className="py-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500">
                {t('search.no_results', 'No results found for')} "{query}"
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {t('search.try_different', 'Try a different search term')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}