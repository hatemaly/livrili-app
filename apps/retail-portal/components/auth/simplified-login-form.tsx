'use client'

import { Button , useLanguage, useRTL } from '@livrili/ui'
import React, { useState } from 'react'
import { LivriliLogo, LivriliIcon } from '@/components/common/livrili-logo'
import { BrandHeading, BrandAlert, BrandButton } from '@/components/common/brand-system'

interface SimplifiedLoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function SimplifiedLoginForm({ 
  onSubmit = async () => {}, 
  isLoading = false, 
  error 
}: SimplifiedLoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  
  const { t } = useLanguage()
  const { isRTL } = useRTL()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setTouched({ email: true, password: true })
      return
    }
    await onSubmit(email.trim(), password)
  }

  const isFormValid = email.trim() && password.trim()

  return (
    <div className="w-full max-w-sm mx-auto p-8 bg-white rounded-3xl shadow-2xl space-y-8 border border-gray-100">
      {/* Header with visual cue */}
      <div className="text-center space-y-4">
        <div className="mb-4">
          <LivriliLogo variant="primary" size="lg" className="mx-auto mb-4" priority />
        </div>
        <LivriliIcon size={72} className="mx-auto shadow-lg" />
        <BrandHeading level={2} className="mt-4">
          {t('auth.login.title', 'Store Login')}
        </BrandHeading>
        <p className="text-gray-600">
          {t('auth.login.subtitle', 'Enter your store credentials to continue')}
        </p>
      </div>

      {/* Error Message with visual indicator */}
      {error && (
        <BrandAlert type="error" title={t('auth.error', 'Login Error')}>
          {error}
        </BrandAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700">
            <span className="text-lg">📧</span>
            <span>{t('auth.email', 'Email')}</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (touched.email) setTouched(prev => ({ ...prev, email: false }))
              }}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
              className={`
                w-full h-14 px-4 text-lg rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-livrili-prussian/20
                ${touched.email && !email.trim() 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-gray-50 focus:border-livrili-prussian focus:bg-white'
                }
                ${isRTL ? 'text-right' : 'text-left'}
              `}
              placeholder={t('auth.email.placeholder', 'Enter your email address')}
              dir={isRTL ? 'rtl' : 'ltr'}
              disabled={isLoading}
            />
            {touched.email && !email.trim() && (
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
            <span>{t('auth.password', 'Password')}</span>
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
              placeholder={t('auth.password.placeholder', 'Enter your password')}
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
        <BrandButton
          type="submit"
          variant="primary"
          size="xl"
          className="w-full"
          disabled={!isFormValid || isLoading}
          isLoading={isLoading}
          icon={isLoading ? undefined : '🚪'}
        >
          {isLoading 
            ? t('auth.login.loading', 'Logging in...') 
            : t('auth.login.button', 'Enter Store')
          }
        </BrandButton>
      </form>

      {/* Help Section */}
      <div className="text-center pt-6 border-t border-livrili-papaya">
        <BrandHeading level={4} color="gray" className="mb-4">
          {t('auth.help.title', 'Need help?')}
        </BrandHeading>
        <div className="grid grid-cols-2 gap-3">
          <BrandButton
            variant="outline"
            size="sm"
            icon="📞"
            className="text-xs"
          >
            {t('auth.help.call', 'Call us')}
          </BrandButton>
          <BrandButton
            variant="ghost"
            size="sm"
            icon="💬"
            className="text-xs"
          >
            {t('auth.help.whatsapp', 'WhatsApp')}
          </BrandButton>
        </div>
      </div>
    </div>
  )
}