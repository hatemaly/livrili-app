import type { Metadata } from 'next'
import { Inter, Cairo } from 'next/font/google'
import { TRPCProvider } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { AdminLanguageProvider } from '../lib/admin-language-context'
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
  title: 'Livrili Admin Portal',
  description: 'Internal administration and operations management system',
  icons: {
    icon: '/livrili-favicon.png',
    shortcut: '/livrili-favicon.png',
    apple: '/livrili-favicon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <meta name="theme-color" content="#003049" />
      </head>
      <body className={`${inter.variable} ${cairo.variable} font-inter`} suppressHydrationWarning>
        <AdminLanguageProvider>
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster />
        </AdminLanguageProvider>
      </body>
    </html>
  )
}