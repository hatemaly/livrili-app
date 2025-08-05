'use client'

import { useAdminLanguage } from '../lib/admin-language-context'
import { useState } from 'react'
import { cn } from '@livrili/ui'

type AdminLanguage = 'ar' | 'fr' | 'en'

interface LanguageOption {
  code: AdminLanguage
  name: string
  nativeName: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇩🇿' },
]

export function AdminLanguageSelector() {
  const { language, setLanguage, direction } = useAdminLanguage()
  const [isOpen, setIsOpen] = useState(false)
  
  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {/* Language Icon */}
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="hidden sm:inline">
          {currentLanguage?.flag} {currentLanguage?.nativeName}
        </span>
        <span className="sm:hidden">{currentLanguage?.flag}</span>
        {/* Chevron Down */}
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
          direction === 'rtl' ? 'right-0' : 'left-0'
        )}>
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={cn(
                  'group flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-gray-100',
                  language === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700',
                  direction === 'rtl' ? 'text-right' : 'text-left'
                )}
              >
                <span className={cn(
                  "text-lg",
                  direction === 'rtl' ? 'ml-3' : 'mr-3'
                )}>
                  {lang.flag}
                </span>
                <div className={cn(
                  "flex flex-col",
                  direction === 'rtl' ? 'items-end' : 'items-start'
                )}>
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-gray-500">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <span className={cn(
                    "text-primary",
                    direction === 'rtl' ? 'mr-auto' : 'ml-auto'
                  )}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}