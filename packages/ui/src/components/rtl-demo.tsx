'use client'

import React from 'react'
import { useLanguage, useRTL, LanguageSelector } from '../providers/language-provider'
import { RTLContainer, RTLText, RTLInput, RTLFlex } from './rtl-container'
import { Button } from './button'
import { Card } from './card'

/**
 * Demo component showcasing RTL functionality
 * This can be used for testing and demonstration purposes
 */
export function RTLDemo() {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('app.title', 'Livrili RTL Demo')}</h2>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current Language: {language} | Direction: {isRTL ? 'RTL' : 'LTR'}
            </p>
            <LanguageSelector className="w-48" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <RTLContainer className="space-y-4">
          <h3 className="text-lg font-semibold">{t('common.search', 'Search')}</h3>
          
          <RTLInput
            label={t('common.search', 'Search')}
            placeholder={language === 'ar' ? 'ابحث هنا...' : 'Search here...'}
          />
          
          <RTLFlex direction="row" gap={2}>
            <Button variant="default">
              {t('common.save', 'Save')}
            </Button>
            <Button variant="outline">
              {t('common.cancel', 'Cancel')}
            </Button>
          </RTLFlex>
        </RTLContainer>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Text Examples</h3>
          
          <div className="grid gap-4">
            <RTLText as="p" className="p-3 bg-muted rounded">
              {language === 'ar' 
                ? 'هذا نص تجريبي باللغة العربية لاختبار دعم الكتابة من اليمين إلى اليسار'
                : language === 'fr'
                ? 'Ceci est un texte d\'exemple en français pour tester le support RTL'
                : 'This is sample English text to test RTL support'
              }
            </RTLText>
            
            <RTLText as="p" autoDetect className="p-3 bg-accent/10 rounded">
              Mixed text: Hello مرحبا Bonjour العالم World
            </RTLText>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Navigation Examples</h3>
          
          <RTLFlex direction="row" justify="between" className="p-4 bg-primary/5 rounded">
            <RTLText>{t('nav.dashboard', 'Dashboard')}</RTLText>
            <RTLText>{t('nav.settings', 'Settings')}</RTLText>
          </RTLFlex>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              {t('nav.users', 'Users')}
            </Button>
            <Button variant="outline" className="justify-start">
              {t('nav.products', 'Products')}
            </Button>
            <Button variant="outline" className="justify-start">
              {t('nav.orders', 'Orders')}
            </Button>
            <Button variant="outline" className="justify-start">
              {t('nav.settings', 'Settings')}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Form Examples</h3>
          
          <RTLContainer className="space-y-4">
            <RTLInput
              label={language === 'ar' ? 'الاسم' : language === 'fr' ? 'Nom' : 'Name'}
              placeholder={language === 'ar' ? 'أدخل اسمك' : language === 'fr' ? 'Entrez votre nom' : 'Enter your name'}
            />
            
            <RTLInput
              type="email"
              label={language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Email' : 'Email'}
              placeholder="email@example.com"
            />
            
            <RTLInput
              type="number"
              label={language === 'ar' ? 'الرقم' : language === 'fr' ? 'Numéro' : 'Number'}
              placeholder="123456"
            />
          </RTLContainer>
        </div>
      </Card>
    </div>
  )
}