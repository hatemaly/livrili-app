'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'ar' | 'fr' | 'en'
export type Direction = 'rtl' | 'ltr'

interface LanguageContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  t: (key: string, defaultValue?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'livrili-language'

// Browser language detection
function detectBrowserLanguage(): Language | null {
  if (typeof window === 'undefined') return null
  
  // Get browser languages in order of preference
  const browserLanguages = navigator.languages || [navigator.language]
  
  for (const lang of browserLanguages) {
    // Extract language code (e.g., 'en-US' -> 'en')
    const languageCode = lang.split('-')[0].toLowerCase()
    
    // Check if we support this language
    if (languageCode === 'ar') return 'ar'
    if (languageCode === 'fr') return 'fr'
    if (languageCode === 'en') return 'en'
  }
  
  return null
}

// Direction mapping
const LANGUAGE_DIRECTION_MAP: Record<Language, Direction> = {
  ar: 'rtl',
  fr: 'ltr',
  en: 'ltr',
}

// Basic translations - in a real app, this would be loaded from translation files
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ar: {
    'app.title': 'ليفريلي',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'nav.dashboard': 'لوحة التحكم',
    'nav.users': 'المستخدمين',
    'nav.products': 'المنتجات',
    'nav.orders': 'الطلبات',
    'nav.settings': 'الإعدادات',
  },
  fr: {
    'app.title': 'Livrili',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'nav.dashboard': 'Tableau de bord',
    'nav.users': 'Utilisateurs',
    'nav.products': 'Produits',
    'nav.orders': 'Commandes',
    'nav.settings': 'Paramètres',
  },
  en: {
    'app.title': 'Livrili',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.products': 'Products',
    'nav.orders': 'Orders',
    'nav.settings': 'Settings',
  },
}

interface LanguageProviderProps {
  children: React.ReactNode
  defaultLanguage?: Language
  autoDetect?: boolean
}

export function LanguageProvider({ 
  children, 
  defaultLanguage = 'en', // Default to English for admin portal
  autoDetect = true
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [mounted, setMounted] = useState(false)

  const direction = LANGUAGE_DIRECTION_MAP[language]

  // Load saved language from localStorage or auto-detect
  useEffect(() => {
    setMounted(true)
    
    // Check localStorage first
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
    if (savedLanguage && Object.keys(LANGUAGE_DIRECTION_MAP).includes(savedLanguage)) {
      setLanguageState(savedLanguage)
      return
    }
    
    // Auto-detect browser language if enabled
    if (autoDetect) {
      const browserLanguage = detectBrowserLanguage()
      if (browserLanguage && browserLanguage !== defaultLanguage) {
        setLanguageState(browserLanguage)
        return
      }
    }
    
    // Use provided default
    setLanguageState(defaultLanguage)
  }, [defaultLanguage, autoDetect])

  // Update document direction and lang attribute
  useEffect(() => {
    if (!mounted) return

    document.documentElement.setAttribute('dir', direction)
    document.documentElement.setAttribute('lang', language)
  }, [language, direction, mounted])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  }

  const t = (key: string, defaultValue?: string): string => {
    const translation = TRANSLATIONS[language]?.[key]
    return translation || defaultValue || key
  }

  const value: LanguageContextType = {
    language,
    direction,
    setLanguage,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Hook for RTL-aware styles
export function useRTL() {
  const { direction } = useLanguage()
  
  const isRTL = direction === 'rtl'
  
  return {
    isRTL,
    dir: direction,
    // Helper functions for RTL-aware styling
    flipX: isRTL ? 'scale-x-[-1]' : '',
    textAlign: isRTL ? 'text-right' : 'text-left',
    marginStart: isRTL ? 'mr-' : 'ml-',
    marginEnd: isRTL ? 'ml-' : 'mr-',
    paddingStart: isRTL ? 'pr-' : 'pl-',
    paddingEnd: isRTL ? 'pl-' : 'pr-',
    borderStart: isRTL ? 'border-r' : 'border-l',
    borderEnd: isRTL ? 'border-l' : 'border-r',
    roundedStart: isRTL ? 'rounded-r' : 'rounded-l',
    roundedEnd: isRTL ? 'rounded-l' : 'rounded-r',
  }
}

// Language selector component
export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage()
  
  const languages: Array<{ code: Language; name: string; nativeName: string }> = [
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ]

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className={`px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
      aria-label="Select Language"
    >
      {languages.map(({ code, name, nativeName }) => (
        <option key={code} value={code}>
          {nativeName} ({name})
        </option>
      ))}
    </select>
  )
}