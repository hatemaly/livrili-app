'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SimplifiedLoginForm } from '@/components/auth/simplified-login-form'
import { LanguageSelector } from '@/components/common/language-selector'
import { api } from '@/lib/trpc'
import { useLanguage } from '@livrili/ui'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const { t } = useLanguage()
  
  const loginMutation = api.retailerAuth.login.useMutation({
    onSuccess: (data) => {
      // Store token/session if needed
      router.push('/home')
    },
    onError: (error) => {
      setError(t('auth.error.invalid_credentials', 'اسم المستخدم أو كلمة المرور غير صحيحة'))
    }
  })

  const handleSubmit = async (username: string, password: string) => {
    setError('')
    await loginMutation.mutateAsync({ username, password })
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
            isLoading={loginMutation.isLoading}
            error={error}
          />
          
          {/* Registration Link */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 mb-4">
              {t('auth.new_retailer', 'متجر جديد؟')}
            </div>
            <Link href="/signup">
              <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-white border-2 border-livrili-prussian text-livrili-prussian rounded-xl hover:bg-livrili-prussian hover:text-white transition-all duration-200 hover:scale-105 active:scale-95">
                <span className="text-lg">📋</span>
                <span className="font-medium">{t('auth.register', 'تسجيل متجر جديد')}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp Support Button */}
      <div className="text-center mt-8">
        <a 
          href="https://wa.me/213XXXXXXXXX?text=أحتاج مساعدة في تسجيل الدخول" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm"
        >
          <span>💬</span>
          <span>{t('auth.help.whatsapp', 'مساعدة عبر واتساب')}</span>
        </a>
        <div className="text-xs text-gray-500 mt-2">
          {t('auth.help.support', 'تحتاج مساعدة؟ تواصل معنا')}
        </div>
      </div>
    </div>
  )
}