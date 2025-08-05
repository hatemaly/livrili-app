import type { Metadata, Viewport } from 'next'
import { Inter, Cairo } from 'next/font/google'
import { TRPCProvider } from '@/components/providers'
import { LanguageProvider } from '@livrili/ui'
import { Toaster } from 'sonner'
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Livrili',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#003049',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} font-inter`} suppressHydrationWarning>
        <LanguageProvider>
          <TRPCProvider>
            {children}
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                },
                className: 'font-arabic',
              }}
            />
          </TRPCProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}