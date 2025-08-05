'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type AdminLanguage = 'en' | 'fr' | 'ar'
export type Direction = 'ltr' | 'rtl'

interface AdminLanguageContextType {
  language: AdminLanguage
  direction: Direction
  setLanguage: (lang: AdminLanguage) => void
  t: (key: string, defaultValue?: string) => string
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined)

const ADMIN_LANGUAGE_STORAGE_KEY = 'livrili-admin-language'

// Direction mapping for admin portal
const ADMIN_LANGUAGE_DIRECTION_MAP: Record<AdminLanguage, Direction> = {
  ar: 'rtl',
  fr: 'ltr',
  en: 'ltr',
}

// Admin-specific translations
const ADMIN_TRANSLATIONS: Record<AdminLanguage, Record<string, string>> = {
  en: {
    'app.title': 'Livrili Admin',
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.retailers': 'Retailers',
    'nav.categories': 'Categories',
    'nav.tags': 'Tags',
    'nav.products': 'Products',
    'nav.orders': 'Orders',
    'nav.deliveries': 'Deliveries',
    'nav.drivers': 'Drivers',
    'nav.finance': 'Finance',
    'nav.communications': 'Communications',
    'nav.intelligence': 'Intelligence',
    'nav.reports': 'Reports',
    'nav.profile': 'Profile',
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
    'common.refresh': 'Refresh',
    'common.signOut': 'Sign Out',
  },
  fr: {
    'app.title': 'Livrili Admin',
    'nav.dashboard': 'Tableau de bord',
    'nav.users': 'Utilisateurs',
    'nav.retailers': 'Détaillants',
    'nav.categories': 'Catégories',
    'nav.tags': 'Étiquettes',
    'nav.products': 'Produits',
    'nav.orders': 'Commandes',
    'nav.deliveries': 'Livraisons',
    'nav.drivers': 'Chauffeurs',
    'nav.finance': 'Finance',
    'nav.communications': 'Communications',
    'nav.intelligence': 'Intelligence',
    'nav.reports': 'Rapports',
    'nav.profile': 'Profil',
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
    'common.refresh': 'Actualiser',
    'common.signOut': 'Se déconnecter',
  },
  ar: {
    'app.title': 'إدارة ليفريلي',
    'nav.dashboard': 'لوحة التحكم',
    'nav.users': 'المستخدمين',
    'nav.retailers': 'تجار التجزئة',
    'nav.categories': 'الفئات',
    'nav.tags': 'العلامات',
    'nav.products': 'المنتجات',
    'nav.orders': 'الطلبات',
    'nav.deliveries': 'التسليمات',
    'nav.drivers': 'السائقين',
    'nav.finance': 'المالية',
    'nav.communications': 'الاتصالات',
    'nav.intelligence': 'الذكاء',
    'nav.reports': 'التقارير',
    'nav.profile': 'الملف الشخصي',
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
    'common.refresh': 'تحديث',
    'common.signOut': 'تسجيل الخروج',
  },
}

interface AdminLanguageProviderProps {
  children: React.ReactNode
}

export function AdminLanguageProvider({ children }: AdminLanguageProviderProps) {
  const [language, setLanguageState] = useState<AdminLanguage>('en')
  const [mounted, setMounted] = useState(false)

  const direction = ADMIN_LANGUAGE_DIRECTION_MAP[language]

  // Load saved language from localStorage
  useEffect(() => {
    setMounted(true)
    
    // Check admin-specific language setting first
    const savedAdminLanguage = localStorage.getItem(ADMIN_LANGUAGE_STORAGE_KEY) as AdminLanguage
    if (savedAdminLanguage && Object.keys(ADMIN_LANGUAGE_DIRECTION_MAP).includes(savedAdminLanguage)) {
      setLanguageState(savedAdminLanguage)
      return
    }
    
    // Check general language setting but default to English for admin
    const savedLanguage = localStorage.getItem('livrili-language') as AdminLanguage
    if (savedLanguage && Object.keys(ADMIN_LANGUAGE_DIRECTION_MAP).includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      // Always default to English for admin portal
      setLanguageState('en')
    }
  }, [])

  // Update document direction and lang attribute
  useEffect(() => {
    if (!mounted) return

    document.documentElement.setAttribute('dir', direction)
    document.documentElement.setAttribute('lang', language)
    
    // Also set body class for admin-specific styling
    document.body.classList.remove('rtl', 'ltr')
    document.body.classList.add(direction)
  }, [language, direction, mounted])

  const setLanguage = (lang: AdminLanguage) => {
    setLanguageState(lang)
    // Save both admin-specific and general language settings
    localStorage.setItem(ADMIN_LANGUAGE_STORAGE_KEY, lang)
    localStorage.setItem('livrili-language', lang)
  }

  const t = (key: string, defaultValue?: string): string => {
    const translation = ADMIN_TRANSLATIONS[language]?.[key]
    return translation || defaultValue || key
  }

  const value: AdminLanguageContextType = {
    language,
    direction,
    setLanguage,
    t,
  }

  // Always provide context, even during mounting
  return (
    <AdminLanguageContext.Provider value={value}>
      {!mounted ? (
        <div suppressHydrationWarning>{children}</div>
      ) : (
        children
      )}
    </AdminLanguageContext.Provider>
  )
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext)
  if (context === undefined) {
    throw new Error('useAdminLanguage must be used within an AdminLanguageProvider')
  }
  return context
}

// Hook for RTL-aware admin styles
export function useAdminRTL() {
  const { direction } = useAdminLanguage()
  
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