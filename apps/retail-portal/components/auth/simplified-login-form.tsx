'use client'

import React, { useState } from 'react'
import { Button } from '@livrili/ui'
import { useLanguage, useRTL } from '@livrili/ui'

interface SimplifiedLoginFormProps {
  onSubmit?: (username: string, password: string) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function SimplifiedLoginForm({ 
  onSubmit = async () => {}, 
  isLoading = false, 
  error 
}: SimplifiedLoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ username: false, password: false })
  
  const { t } = useLanguage()
  const { isRTL } = useRTL()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setTouched({ username: true, password: true })
      return
    }
    await onSubmit(username.trim(), password)
  }

  const isFormValid = username.trim() && password.trim()

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6">
      {/* Header with visual cue */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-livrili-prussian rounded-full flex items-center justify-center">
          <span className="text-2xl text-white">🏪</span>
        </div>
        <h1 className="text-xl font-bold text-livrili-prussian">
          {t('auth.login.title', 'دخول المتجر')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('auth.login.subtitle', 'ادخل بيانات متجرك')}
        </p>
      </div>

      {/* Error Message with visual indicator */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3 rtl:space-x-reverse animate-pulse">
          <span className="text-2xl">❌</span>
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Field */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700">
            <span className="text-lg">👤</span>
            <span>{t('auth.username', 'اسم المستخدم')}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (touched.username) setTouched(prev => ({ ...prev, username: false }))
              }}
              onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
              className={`
                w-full h-14 px-4 text-lg rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20
                ${touched.username && !username.trim() 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-gray-50 focus:border-livrili-prussian focus:bg-white'
                }
                ${isRTL ? 'text-right' : 'text-left'}
              `}
              placeholder={t('auth.username.placeholder', 'اكتب اسم المستخدم هنا')}
              dir={isRTL ? 'rtl' : 'ltr'}
              disabled={isLoading}
            />
            {touched.username && !username.trim() && (
              <div className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-red-500 text-lg">⚠️</span>
              </div>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700">
            <span className="text-lg">🔒</span>
            <span>{t('auth.password', 'كلمة المرور')}</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (touched.password) setTouched(prev => ({ ...prev, password: false }))
              }}
              onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
              className={`
                w-full h-14 px-4 pr-14 rtl:pr-4 rtl:pl-14 text-lg rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20
                ${touched.password && !password.trim() 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-gray-50 focus:border-livrili-prussian focus:bg-white'
                }
                ${isRTL ? 'text-right' : 'text-left'}
              `}
              placeholder={t('auth.password.placeholder', 'اكتب كلمة المرور هنا')}
              dir={isRTL ? 'rtl' : 'ltr'}
              disabled={isLoading}
            />
            
            {/* Show/Hide Password Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              <span className="text-xl">{showPassword ? '🙈' : '👁️'}</span>
            </button>
            
            {touched.password && !password.trim() && (
              <div className="absolute left-12 rtl:left-auto rtl:right-12 top-1/2 transform -translate-y-1/2">
                <span className="text-red-500 text-lg">⚠️</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="brand"
          size="lg"
          className={`
            w-full h-16 text-lg font-bold rounded-xl transition-all duration-200
            ${isFormValid 
              ? 'transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl' 
              : 'opacity-50 cursor-not-allowed'
            }
            ${isLoading ? 'animate-pulse' : ''}
          `}
          disabled={!isFormValid || isLoading}
        >
          <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('auth.login.loading', 'جاري الدخول...')}</span>
              </>
            ) : (
              <>
                <span className="text-xl">🚪</span>
                <span>{t('auth.login.button', 'دخول المتجر')}</span>
              </>
            )}
          </div>
        </Button>
      </form>

      {/* Help Section */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-2">
          {t('auth.help.title', 'تحتاج مساعدة؟')}
        </p>
        <div className="flex flex-col space-y-2">
          <button className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-livrili-prussian hover:text-livrili-fire transition-colors p-2 rounded-lg hover:bg-gray-50">
            <span className="text-lg">📞</span>
            <span className="text-sm font-medium">{t('auth.help.call', 'اتصل بنا')}</span>
          </button>
          <button className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-livrili-prussian hover:text-livrili-fire transition-colors p-2 rounded-lg hover:bg-gray-50">
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">{t('auth.help.whatsapp', 'واتساب')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}