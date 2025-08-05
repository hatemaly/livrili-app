'use client'

import React, { useState } from 'react'
import { useLanguage, useRTL } from '@livrili/ui'

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
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-6">
          <div className="w-6 h-6 border-2 border-livrili-prussian border-t-transparent rounded-full animate-spin" />
          <span className="text-lg text-livrili-prussian font-medium">
            {t('categories.loading', 'جاري تحميل الفئات...')}
          </span>
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
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-livrili-prussian mb-2">
          {t('categories.title', 'اختر فئة المنتجات')}
        </h2>
        <p className="text-gray-600">
          {t('categories.subtitle', 'اضغط على الفئة لرؤية المنتجات')}
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
                relative h-24 p-4 rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20
                ${category.color}
                ${isSelected 
                  ? 'border-livrili-prussian bg-livrili-prussian/10 shadow-lg scale-105' 
                  : 'border-gray-200'
                }
                ${isTouched ? 'scale-95' : 'hover:scale-105 active:scale-95'}
                ${!isSelected && !isTouched ? 'hover:shadow-md' : ''}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 w-6 h-6 bg-livrili-prussian rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
              
              {/* Category content */}
              <div className="flex flex-col items-center justify-center h-full space-y-1">
                <span className="text-3xl">{category.emoji}</span>
                <span className={`text-sm font-medium text-center leading-tight ${isRTL ? 'font-arabic' : ''}`}>
                  {category.name[language]}
                </span>
                {category.count && (
                  <span className="text-xs text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">
                    {category.count} {t('categories.items', 'منتج')}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2 rtl:space-x-reverse">
          <span>⚡</span>
          <span>{t('categories.quick_actions', 'إجراءات سريعة')}</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onCategorySelect('search')}
            className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-3 bg-white rounded-lg border border-gray-200 hover:border-livrili-prussian hover:bg-livrili-prussian/5 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span className="text-lg">🔍</span>
            <span className="text-sm font-medium">{t('categories.search', 'بحث')}</span>
          </button>
          
          <button
            onClick={() => onCategorySelect('favorites')}
            className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-3 bg-white rounded-lg border border-gray-200 hover:border-livrili-fire hover:bg-livrili-fire/5 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span className="text-lg">❤️</span>
            <span className="text-sm font-medium">{t('categories.favorites', 'المفضلة')}</span>
          </button>
        </div>
      </div>

      {/* Help tip */}
      <div className="mt-4 p-3 bg-livrili-papaya/50 rounded-lg border border-livrili-papaya">
        <div className="flex items-start space-x-2 rtl:space-x-reverse">
          <span className="text-lg">💡</span>
          <div className="flex-1">
            <p className="text-sm text-livrili-prussian">
              <span className="font-medium">{t('categories.tip.title', 'نصيحة:')}</span>
              {' '}
              {t('categories.tip.message', 'اضغط مرة واحدة على الفئة لرؤية المنتجات. الفئة المختارة ستظهر بعلامة ✓')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}