'use client'

import { useLanguage, useRTL } from '@livrili/ui'
import React, { useState } from 'react'
import { BrandHeading, BrandSpinner, BrandAlert, BrandButton } from '@/components/common/brand-system'

interface Category {
  id: string
  name: {
    ar: string
    fr: string
    en: string
  }
  emoji: string
  color: string
  count?: number
}

interface VisualCategoryGridProps {
  categories?: Category[]
  onCategorySelect: (categoryId: string) => void
  selectedCategoryId?: string
  isLoading?: boolean
}

const defaultCategories: Category[] = [
  {
    id: 'dairy',
    name: { ar: 'منتجات الألبان', fr: 'Produits laitiers', en: 'Dairy Products' },
    emoji: '🥛',
    color: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
    count: 45
  },
  {
    id: 'snacks',
    name: { ar: 'وجبات خفيفة', fr: 'Collations', en: 'Snacks' },
    emoji: '🍿',
    color: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
    count: 128
  },
  {
    id: 'beverages',
    name: { ar: 'المشروبات', fr: 'Boissons', en: 'Beverages' },
    emoji: '🥤',
    color: 'bg-green-100 hover:bg-green-200 border-green-300',
    count: 67
  },
  {
    id: 'cleaning',
    name: { ar: 'منظفات', fr: 'Nettoyage', en: 'Cleaning' },
    emoji: '🧽',
    color: 'bg-purple-100 hover:bg-purple-200 border-purple-300',
    count: 32
  },
  {
    id: 'personal-care',
    name: { ar: 'العناية الشخصية', fr: 'Soins personnels', en: 'Personal Care' },
    emoji: '🧴',
    color: 'bg-pink-100 hover:bg-pink-200 border-pink-300',
    count: 54
  },
  {
    id: 'household',
    name: { ar: 'أدوات منزلية', fr: 'Articles ménagers', en: 'Household Items' },
    emoji: '🏠',
    color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
    count: 89
  },
  {
    id: 'bakery',
    name: { ar: 'مخبوزات', fr: 'Boulangerie', en: 'Bakery' },
    emoji: '🍞',
    color: 'bg-amber-100 hover:bg-amber-200 border-amber-300',
    count: 23
  },
  {
    id: 'frozen',
    name: { ar: 'مجمدات', fr: 'Surgelés', en: 'Frozen Foods' },
    emoji: '🧊',
    color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300',
    count: 41
  }
]

export function VisualCategoryGrid({ 
  categories = defaultCategories, 
  onCategorySelect,
  selectedCategoryId,
  isLoading = false
}: VisualCategoryGridProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [touchedCategory, setTouchedCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string) => {
    setTouchedCategory(categoryId)
    
    // Visual feedback delay
    setTimeout(() => {
      onCategorySelect(categoryId)
      setTouchedCategory(null)
    }, 150)
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-6">
          <BrandSpinner size="md" />
          <BrandHeading level={4}>
            {t('categories.loading', 'Loading categories...')}
          </BrandHeading>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <BrandHeading level={2} className="mb-3">
          {t('categories.title', 'Choose Product Category')}
        </BrandHeading>
        <p className="text-gray-600 text-lg">
          {t('categories.subtitle', 'Click on a category to see products')}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id
          const isTouched = touchedCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                relative h-28 p-5 rounded-2xl border-2 transition-all duration-300
                focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20
                ${category.color}
                ${isSelected 
                  ? 'border-livrili-prussian bg-gradient-to-br from-livrili-prussian/10 to-livrili-prussian/5 shadow-2xl scale-105 ring-4 ring-livrili-prussian/20' 
                  : 'border-gray-200 hover:border-livrili-prussian/40'
                }
                ${isTouched ? 'scale-95' : 'hover:scale-105 active:scale-95'}
                ${!isSelected && !isTouched ? 'hover:shadow-lg' : ''}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 rtl:-right-auto rtl:-left-3 w-8 h-8 bg-gradient-to-br from-livrili-prussian to-livrili-air rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
                  <span className="text-white text-lg font-bold">✓</span>
                </div>
              )}
              
              {/* Category content */}
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <span className="text-4xl transform transition-transform duration-300 hover:scale-110">{category.emoji}</span>
                <span className={`text-sm font-semibold text-center leading-tight ${isRTL ? 'font-arabic' : ''} ${isSelected ? 'text-livrili-prussian' : 'text-gray-700'}`}>
                  {category.name[language]}
                </span>
                {category.count && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isSelected 
                      ? 'bg-livrili-prussian text-white' 
                      : 'text-gray-500 bg-white/80'
                  }`}>
                    {category.count} {t('categories.items', 'items')}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-livrili-papaya/30 to-livrili-papaya/50 rounded-2xl p-6 border border-livrili-papaya">
        <BrandHeading level={4} className="mb-4 flex items-center space-x-3 rtl:space-x-reverse">
          <span className="text-xl">⚡</span>
          <span>{t('categories.quick_actions', 'Quick Actions')}</span>
        </BrandHeading>
        
        <div className="grid grid-cols-2 gap-4">
          <BrandButton
            variant="outline"
            size="md"
            icon="🔍"
            className="bg-white/90 hover:bg-white"
            onClick={() => onCategorySelect('search')}
          >
            {t('categories.search', 'Search')}
          </BrandButton>
          
          <BrandButton
            variant="ghost"
            size="md"
            icon="❤️"
            className="bg-white/90 hover:bg-white text-livrili-fire hover:text-livrili-fire"
            onClick={() => onCategorySelect('favorites')}
          >
            {t('categories.favorites', 'Favorites')}
          </BrandButton>
        </div>
      </div>

      {/* Help tip */}
      <BrandAlert 
        type="info" 
        title={t('categories.tip.title', 'Helpful Tip')}
        className="mt-6"
      >
        {t('categories.tip.message', 'Click once on a category to see products. Selected category will show with ✓ mark')}
      </BrandAlert>
    </div>
  )
}