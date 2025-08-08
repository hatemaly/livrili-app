'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button, useLanguage, useRTL } from '@livrili/ui'
import { HapticButton } from '@/components/common/haptic-button'
import { useToastHelpers } from '@/components/common/toast-system'

interface ProfileData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: Date
  avatar?: string
  
  // Business Information
  businessName: string
  businessType: string
  taxNumber?: string
  businessPhone?: string
  businessEmail?: string
  
  // Address Information
  addresses: Array<{
    id: string
    type: 'business' | 'delivery' | 'billing'
    label: string
    address: string
    city: string
    state: string
    postalCode: string
    isDefault: boolean
  }>
  
  // Preferences
  language: 'ar' | 'fr' | 'en'
  currency: string
  timezone: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    orderUpdates: boolean
    promotions: boolean
    newsletter: boolean
  }
  
  // Marketing Preferences
  interests: string[]
  businessCategories: string[]
}

interface Step {
  id: string
  title: string
  description: string
  isCompleted: boolean
  isRequired: boolean
  completionPercentage: number
}

interface ProfileCompletionWizardProps {
  initialData?: Partial<ProfileData>
  onSave?: (data: ProfileData) => Promise<void>
  onSkip?: () => void
  onComplete?: (data: ProfileData) => void
  steps?: Step[]
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function ProfileCompletionWizard({
  initialData = {},
  onSave,
  onSkip,
  onComplete,
  steps: customSteps,
  isOpen,
  onClose,
  className = ''
}: ProfileCompletionWizardProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const { success, error, promise } = useToastHelpers()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    addresses: [],
    language: language as 'ar' | 'fr' | 'en',
    currency: 'DZD',
    timezone: 'Africa/Algiers',
    notifications: {
      email: true,
      sms: true,
      push: true,
      orderUpdates: true,
      promotions: false,
      newsletter: false
    },
    interests: [],
    businessCategories: [],
    ...initialData
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const defaultSteps: Step[] = customSteps || [
    {
      id: 'personal',
      title: t('profile.wizard.personal_info', 'Personal Information'),
      description: t('profile.wizard.personal_desc', 'Tell us about yourself'),
      isCompleted: !!(profileData.firstName && profileData.lastName && profileData.email),
      isRequired: true,
      completionPercentage: 0
    },
    {
      id: 'business',
      title: t('profile.wizard.business_info', 'Business Information'),
      description: t('profile.wizard.business_desc', 'Details about your business'),
      isCompleted: !!(profileData.businessName && profileData.businessType),
      isRequired: true,
      completionPercentage: 0
    },
    {
      id: 'address',
      title: t('profile.wizard.address_info', 'Address Information'),
      description: t('profile.wizard.address_desc', 'Where should we deliver?'),
      isCompleted: profileData.addresses.length > 0,
      isRequired: true,
      completionPercentage: 0
    },
    {
      id: 'preferences',
      title: t('profile.wizard.preferences', 'Preferences'),
      description: t('profile.wizard.preferences_desc', 'Customize your experience'),
      isCompleted: profileData.interests.length > 0,
      isRequired: false,
      completionPercentage: 0
    }
  ]

  const steps = defaultSteps.map(step => ({
    ...step,
    completionPercentage: calculateStepCompletion(step.id)
  }))

  function calculateStepCompletion(stepId: string): number {
    switch (stepId) {
      case 'personal':
        const personalFields = ['firstName', 'lastName', 'email', 'phone', 'avatar']
        const personalCompleted = personalFields.filter(field => 
          profileData[field as keyof ProfileData]
        ).length
        return (personalCompleted / personalFields.length) * 100

      case 'business':
        const businessFields = ['businessName', 'businessType', 'taxNumber', 'businessPhone']
        const businessCompleted = businessFields.filter(field => 
          profileData[field as keyof ProfileData]
        ).length
        return (businessCompleted / businessFields.length) * 100

      case 'address':
        return profileData.addresses.length > 0 ? 100 : 0

      case 'preferences':
        const prefFields = [
          profileData.interests.length > 0,
          profileData.businessCategories.length > 0,
          Object.values(profileData.notifications).some(Boolean)
        ]
        const prefCompleted = prefFields.filter(Boolean).length
        return (prefCompleted / prefFields.length) * 100

      default:
        return 0
    }
  }

  const updateProfileData = useCallback((updates: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      error(t('profile.wizard.error_file_size', 'File size must be less than 5MB'))
      return
    }

    if (!file.type.startsWith('image/')) {
      error(t('profile.wizard.error_file_type', 'Please select an image file'))
      return
    }

    setUploadingAvatar(true)
    try {
      // Here you would typically upload to your server/storage
      const formData = new FormData()
      formData.append('avatar', file)
      
      // Simulated upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      const avatarUrl = URL.createObjectURL(file) // Temporary for demo
      
      updateProfileData({ avatar: avatarUrl })
      success(t('profile.wizard.avatar_uploaded', 'Profile photo updated successfully'))
    } catch (err) {
      error(t('profile.wizard.upload_failed', 'Failed to upload photo'))
    } finally {
      setUploadingAvatar(false)
    }
  }

  const addAddress = () => {
    const newAddress = {
      id: Date.now().toString(),
      type: 'delivery' as const,
      label: 'Home',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: profileData.addresses.length === 0
    }
    
    updateProfileData({
      addresses: [...profileData.addresses, newAddress]
    })
  }

  const updateAddress = (addressId: string, updates: Partial<typeof profileData.addresses[0]>) => {
    const updatedAddresses = profileData.addresses.map(addr =>
      addr.id === addressId ? { ...addr, ...updates } : addr
    )
    updateProfileData({ addresses: updatedAddresses })
  }

  const removeAddress = (addressId: string) => {
    const updatedAddresses = profileData.addresses.filter(addr => addr.id !== addressId)
    updateProfileData({ addresses: updatedAddresses })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!onSave) {
      onComplete?.(profileData)
      onClose()
      return
    }

    try {
      await promise(
        onSave(profileData),
        {
          loading: t('profile.wizard.saving', 'Saving profile...'),
          success: t('profile.wizard.saved', 'Profile saved successfully!'),
          error: t('profile.wizard.save_error', 'Failed to save profile')
        }
      )
      
      onComplete?.(profileData)
      onClose()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const overallCompletion = Math.round(
    steps.reduce((sum, step) => sum + step.completionPercentage, 0) / steps.length
  )

  const businessTypes = [
    { value: 'retail', label: t('profile.wizard.business_type.retail', 'Retail Store') },
    { value: 'restaurant', label: t('profile.wizard.business_type.restaurant', 'Restaurant') },
    { value: 'grocery', label: t('profile.wizard.business_type.grocery', 'Grocery Store') },
    { value: 'pharmacy', label: t('profile.wizard.business_type.pharmacy', 'Pharmacy') },
    { value: 'other', label: t('profile.wizard.business_type.other', 'Other') }
  ]

  const interestOptions = [
    { value: 'food_beverages', label: t('profile.wizard.interests.food_beverages', 'Food & Beverages') },
    { value: 'electronics', label: t('profile.wizard.interests.electronics', 'Electronics') },
    { value: 'fashion', label: t('profile.wizard.interests.fashion', 'Fashion') },
    { value: 'health_beauty', label: t('profile.wizard.interests.health_beauty', 'Health & Beauty') },
    { value: 'home_garden', label: t('profile.wizard.interests.home_garden', 'Home & Garden') },
    { value: 'sports_outdoors', label: t('profile.wizard.interests.sports_outdoors', 'Sports & Outdoors') }
  ]

  if (!isOpen) return null

  const renderStepContent = () => {
    switch (steps[currentStep]?.id) {
      case 'personal':
        return (
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                  {profileData.avatar ? (
                    <Image
                      src={profileData.avatar}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
                disabled={uploadingAvatar}
              >
                {profileData.avatar 
                  ? t('profile.wizard.change_photo', 'Change Photo')
                  : t('profile.wizard.add_photo', 'Add Photo')
                }
              </Button>
            </div>

            {/* Personal Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.first_name', 'First Name')} *
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => updateProfileData({ firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                  placeholder={t('profile.wizard.first_name_placeholder', 'Enter your first name')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.last_name', 'Last Name')} *
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => updateProfileData({ lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                  placeholder={t('profile.wizard.last_name_placeholder', 'Enter your last name')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.email', 'Email Address')} *
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => updateProfileData({ email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                  placeholder={t('profile.wizard.email_placeholder', 'Enter your email')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.phone', 'Phone Number')}
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => updateProfileData({ phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                  placeholder={t('profile.wizard.phone_placeholder', '+213 XXX XXX XXX')}
                />
              </div>
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.business_name', 'Business Name')} *
                </label>
                <input
                  type="text"
                  value={profileData.businessName}
                  onChange={(e) => updateProfileData({ businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                  placeholder={t('profile.wizard.business_name_placeholder', 'Enter your business name')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.business_type', 'Business Type')} *
                </label>
                <select
                  value={profileData.businessType}
                  onChange={(e) => updateProfileData({ businessType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                >
                  <option value="">{t('profile.wizard.select_business_type', 'Select business type')}</option>
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.tax_number', 'Tax Number')}
                </label>
                <input
                  type="text"
                  value={profileData.taxNumber || ''}
                  onChange={(e) => updateProfileData({ taxNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                  placeholder={t('profile.wizard.tax_number_placeholder', 'Enter tax number')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.business_phone', 'Business Phone')}
                </label>
                <input
                  type="tel"
                  value={profileData.businessPhone || ''}
                  onChange={(e) => updateProfileData({ businessPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                  placeholder={t('profile.wizard.business_phone_placeholder', '+213 XXX XXX XXX')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.wizard.business_email', 'Business Email')}
                </label>
                <input
                  type="email"
                  value={profileData.businessEmail || ''}
                  onChange={(e) => updateProfileData({ businessEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                  placeholder={t('profile.wizard.business_email_placeholder', 'business@example.com')}
                />
              </div>
            </div>
          </div>
        )

      case 'address':
        return (
          <div className="space-y-6">
            {profileData.addresses.map((address, index) => (
              <div key={address.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    {t('profile.wizard.address', 'Address')} {index + 1}
                  </h3>
                  {profileData.addresses.length > 1 && (
                    <Button
                      onClick={() => removeAddress(address.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      {t('profile.wizard.remove', 'Remove')}
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.wizard.address_label', 'Label')}
                    </label>
                    <input
                      type="text"
                      value={address.label}
                      onChange={(e) => updateAddress(address.id, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                      placeholder={t('profile.wizard.address_label_placeholder', 'e.g., Home, Office')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.wizard.address_type', 'Type')}
                    </label>
                    <select
                      value={address.type}
                      onChange={(e) => updateAddress(address.id, { type: e.target.value as 'business' | 'delivery' | 'billing' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                    >
                      <option value="delivery">{t('profile.wizard.address_type.delivery', 'Delivery')}</option>
                      <option value="business">{t('profile.wizard.address_type.business', 'Business')}</option>
                      <option value="billing">{t('profile.wizard.address_type.billing', 'Billing')}</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.wizard.street_address', 'Street Address')}
                    </label>
                    <input
                      type="text"
                      value={address.address}
                      onChange={(e) => updateAddress(address.id, { address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                      placeholder={t('profile.wizard.street_address_placeholder', 'Enter full street address')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.wizard.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => updateAddress(address.id, { city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                      placeholder={t('profile.wizard.city_placeholder', 'City')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.wizard.postal_code', 'Postal Code')}
                    </label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => updateAddress(address.id, { postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-livrili-prussian focus:border-transparent"
                      placeholder={t('profile.wizard.postal_code_placeholder', '16000')}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={address.isDefault}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Make this the default and unset others
                          const updatedAddresses = profileData.addresses.map(addr => ({
                            ...addr,
                            isDefault: addr.id === address.id
                          }))
                          updateProfileData({ addresses: updatedAddresses })
                        }
                      }}
                      className="rounded border-gray-300 text-livrili-prussian focus:ring-livrili-prussian"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {t('profile.wizard.default_address', 'Set as default address')}
                    </span>
                  </label>
                </div>
              </div>
            ))}
            
            <Button onClick={addAddress} variant="ghost" className="w-full">
              + {t('profile.wizard.add_address', 'Add Another Address')}
            </Button>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            {/* Interests */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                {t('profile.wizard.interests', 'Product Interests')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {interestOptions.map(interest => (
                  <label key={interest.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.interests.includes(interest.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateProfileData({
                            interests: [...profileData.interests, interest.value]
                          })
                        } else {
                          updateProfileData({
                            interests: profileData.interests.filter(i => i !== interest.value)
                          })
                        }
                      }}
                      className="rounded border-gray-300 text-livrili-prussian focus:ring-livrili-prussian"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {interest.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                {t('profile.wizard.notification_preferences', 'Notification Preferences')}
              </h3>
              <div className="space-y-3">
                {Object.entries(profileData.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {t(`profile.wizard.notification.${key}`, key.replace(/([A-Z])/g, ' $1').toLowerCase())}
                    </span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateProfileData({
                        notifications: {
                          ...profileData.notifications,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-livrili-prussian focus:ring-livrili-prussian"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('profile.wizard.title', 'Complete Your Profile')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {overallCompletion}% {t('profile.wizard.complete', 'complete')}
              </p>
            </div>
            
            <Button onClick={onClose} variant="ghost" size="sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${index === currentStep 
                        ? 'bg-livrili-prussian text-white' 
                        : step.isCompleted || step.completionPercentage === 100
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {step.isCompleted || step.completionPercentage === 100 ? (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500">{Math.round(step.completionPercentage)}%</p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 ml-4">
                      <div className="h-1 bg-gray-200 rounded">
                        <div 
                          className="h-full bg-livrili-prussian rounded transition-all duration-300"
                          style={{ width: index < currentStep ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {steps[currentStep]?.title}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {steps[currentStep]?.description}
              </p>
            </div>
            
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              {onSkip && (
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                >
                  {t('profile.wizard.skip', 'Skip for now')}
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="ghost"
              >
                {t('profile.wizard.previous', 'Previous')}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={isLoading}
                variant="brand"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('profile.wizard.saving', 'Saving...')}</span>
                  </div>
                ) : currentStep === steps.length - 1 ? (
                  t('profile.wizard.complete', 'Complete')
                ) : (
                  t('profile.wizard.next', 'Next')
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}