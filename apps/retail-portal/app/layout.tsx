import { LanguageProvider } from '@livrili/ui'
import { Inter, Cairo } from 'next/font/google'
import { Toaster } from 'sonner'

import { TRPCProvider } from '@/components/providers'
import { AuthProvider } from '@/lib/supabase-auth'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { OfflineIndicator } from '@/components/common/offline-indicator'


import type { Metadata, Viewport } from 'next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo'
})

export const metadata: Metadata = {
  title: 'Livrili - B2B Marketplace',
  description: 'Connecting Retailers & Suppliers Across Algeria',
  manifest: '/manifest.json',
  keywords: ['B2B', 'marketplace', 'Algeria', 'wholesale', 'retail', 'FMCG'],
  authors: [{ name: 'Livrili Team' }],
  creator: 'Livrili',
  publisher: 'Livrili',
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Livrili',
    startupImage: '/icons/apple-touch-icon.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'Livrili',
    'msapplication-TileColor': '#003049',
    'theme-color': '#003049',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#003049' }],
  colorScheme: 'light',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${cairo.variable} font-inter antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <TRPCProvider>
                <OfflineIndicator />
                {children}
                <Toaster 
                  position="top-center"
                  expand={true}
                  richColors
                  closeButton
                  toastOptions={{
                    style: {
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      color: '#374151',
                    },
                    className: 'font-arabic',
                    duration: 4000,
                  }}
                />
              </TRPCProvider>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}