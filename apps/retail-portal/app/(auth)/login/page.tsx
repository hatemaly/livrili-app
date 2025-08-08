'use client'

import { useLanguage } from '@livrili/ui'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import { SimplifiedLoginForm } from '@/components/auth/simplified-login-form'
import { LanguageSelector } from '@/components/common/language-selector'
import { useAuth } from '@/lib/supabase-auth'


export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()
  const { signIn } = useAuth()

  useEffect(() => {
    // Check for error messages from middleware
    const errorParam = searchParams.get('error')
    
    if (errorParam === 'account_not_found') {
      setError(t('auth.error.account_not_found', 'Account not found. Please contact support.'))
    } else if (errorParam === 'account_inactive') {
      setError(t('auth.error.account_inactive', 'Your account is inactive. Please contact support.'))
    } else if (errorParam === 'retailer_access_required') {
      setError(t('auth.error.retailer_access_required', 'This portal is for retailers only. Please use the correct portal for your account type.'))
    } else if (errorParam === 'system_error') {
      setError(t('auth.error.system_error', 'System error occurred. Please try again or contact support.'))
    }
  }, [searchParams, t])

  const handleSubmit = async (email: string, password: string) => {
    console.log('Login handleSubmit called with email:', email)
    setError('')
    setIsLoading(true)

    try {
      console.log('Calling signIn')
      await signIn(email, password)
      console.log('SignIn completed successfully')
      // Navigation is handled by the signIn function
      // Add fallback redirect in case auth provider redirect fails
      setTimeout(() => {
        console.log('Fallback redirect check')
        if (typeof window !== 'undefined' && window.location.pathname === '/login') {
          console.log('Still on login page, executing fallback redirect')
          const urlParams = new URLSearchParams(window.location.search)
          const redirect = urlParams.get('redirect')
          window.location.href = redirect && redirect !== '/' ? redirect : '/home'
        }
      }, 500)
    } catch (err: any) {
      console.error('Login error:', err)
      // Check for specific error messages
      if (err?.message?.includes('Access denied')) {
        setError(t('auth.error.access_denied', 'Access denied. This portal is for retailers only.'))
      } else if (err?.message?.includes('Invalid')) {
        setError(t('auth.error.invalid_credentials', 'Invalid email or password'))
      } else {
        setError(t('auth.error.general', 'An error occurred during login'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-livrili-papaya via-white to-livrili-air p-4 flex flex-col">
      {/* Language Selector */}
      <div className="flex justify-end mb-4">
        <LanguageSelector variant="compact" className="" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <SimplifiedLoginForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
          
          {/* Registration Link */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 mb-4">
              {t('auth.new_retailer', 'New retailer?')}
            </div>
            <Link href="/signup">
              <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-white border-2 border-livrili-prussian text-livrili-prussian rounded-xl hover:bg-livrili-prussian hover:text-white transition-all duration-200 hover:scale-105 active:scale-95">
                <span className="text-lg">📋</span>
                <span className="font-medium">{t('auth.register', 'Register new store')}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp Support Button */}
      <div className="text-center mt-8">
        <a 
          href="https://wa.me/213XXXXXXXXX?text=I need help with login" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm"
        >
          <span>💬</span>
          <span>{t('auth.help.whatsapp', 'WhatsApp Support')}</span>
        </a>
        <div className="text-xs text-gray-500 mt-2">
          {t('auth.help.support', 'Need help? Contact us')}
        </div>
      </div>
    </div>
  )
}