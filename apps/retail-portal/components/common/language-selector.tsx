'use client'

import { useLanguage, type Language } from '@livrili/ui'
import React, { useState } from 'react'

interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  flag: string
  dir: 'ltr' | 'rtl'
}

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons' | 'compact'
  showLabels?: boolean
  className?: string
}

const languages: LanguageOption[] = [
  { 
    code: 'ar', 
    name: 'Arabic', 
    nativeName: 'العربية', 
    flag: '🇩🇿', 
    dir: 'rtl' 
  },
  { 
    code: 'fr', 
    name: 'French', 
    nativeName: 'Français', 
    flag: '🇫🇷', 
    dir: 'ltr' 
  },
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English', 
    flag: '🇺🇸', 
    dir: 'ltr' 
  },
]

export function LanguageSelector({ 
  variant = 'dropdown',
  showLabels = true,
  className = ''
}: LanguageSelectorProps) {
  const { language, setLanguage, direction } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(language)

  const currentLanguage = languages.find(lang => lang.code === language)!
  const isRTL = direction === 'rtl'

  const handleLanguageChange = (langCode: Language) => {
    setSelectedLanguage(langCode)
    setLanguage(langCode)
    setIsOpen(false)
  }

  // Compact version - just flag and name
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-livrili-prussian/20"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          {showLabels && (
            <span className="text-sm font-medium text-gray-700">
              {currentLanguage.code.toUpperCase()}
            </span>
          )}
          <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ⬇️
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center space-x-2 rtl:space-x-reverse p-3 text-left rtl:text-right hover:bg-gray-50 transition-colors
                  ${lang.code === language ? 'bg-livrili-prussian/10 text-livrili-prussian font-medium' : 'text-gray-700'}
                  first:rounded-t-lg last:rounded-b-lg
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm">{lang.nativeName}</span>
                {lang.code === language && (
                  <span className="text-xs ml-auto rtl:ml-0 rtl:mr-auto">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Button variant - horizontal buttons
  if (variant === 'buttons') {
    return (
      <div className={`flex items-center space-x-2 rtl:space-x-reverse ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-xl border-2 transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20
              ${lang.code === language
                ? 'border-livrili-prussian bg-livrili-prussian text-white shadow-lg scale-105'
                : 'border-gray-200 bg-white text-gray-700 hover:border-livrili-prussian hover:bg-livrili-prussian/5 hover:scale-105 active:scale-95'
              }
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            {showLabels && (
              <span className="text-sm font-medium">
                {lang.nativeName}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  // Dropdown variant (default)
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl
          focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20 focus:border-livrili-prussian
          hover:border-livrili-prussian hover:bg-gray-50 transition-all duration-200
          ${isOpen ? 'border-livrili-prussian bg-gray-50' : ''}
        `}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="text-2xl">{currentLanguage.flag}</span>
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="font-medium text-gray-900">
              {currentLanguage.nativeName}
            </div>
            {showLabels && (
              <div className="text-xs text-gray-500">
                {currentLanguage.name}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* RTL indicator */}
          {currentLanguage.dir === 'rtl' && (
            <span className="text-xs bg-livrili-prussian text-white px-2 py-1 rounded-full">
              RTL
            </span>
          )}
          <span className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            ⬇️
          </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="py-2">
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 transition-all duration-200
                    ${lang.code === language
                      ? 'bg-livrili-prussian text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className={`${lang.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div className="font-medium">
                        {lang.nativeName}
                      </div>
                      <div className={`text-xs ${lang.code === language ? 'text-white/80' : 'text-gray-500'}`}>
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {lang.dir === 'rtl' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lang.code === language ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        RTL
                      </span>
                    )}
                    {lang.code === language && (
                      <span className="text-lg">✅</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Help text */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-gray-600">
                <span>💡</span>
                <span>
                  {isRTL 
                    ? 'Text direction changed automatically'
                    : 'Language automatically changes text direction'
                  }
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}