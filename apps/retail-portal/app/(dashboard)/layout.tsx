'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Auth guard will be handled through middleware
import { useAuth } from '@/lib/supabase-auth'
import { CartButton } from '@/components/cart/cart-button'
import { useSwipeable } from 'react-swipeable'
import { Button, useLanguage, useRTL } from '@livrili/ui'
import { LivriliLogo } from '@/components/common/livrili-logo'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const { isRTL } = useRTL()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showFAB, setShowFAB] = useState(true)
  const [cartItems] = useState([]) // TODO: Connect to cart state
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleSignOut = async () => {
    signOut()
    // No need to push to login, signOut handles redirect
  }

  // Handle scroll for FAB visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setShowFAB(currentScrollY < lastScrollY || currentScrollY < 10)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Navigation items for mobile
  const navigationItems = [
    {
      href: '/home',
      label: t('nav.home', 'Home'),
      emoji: '🏠',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/categories',
      label: t('nav.products', 'Products'),
      emoji: '📦',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      href: '/orders',
      label: t('nav.orders', 'Orders'),
      emoji: '📋',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: '/profile',
      label: t('nav.profile', 'Profile'),
      emoji: '👤',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = navigationItems.findIndex(item => item.href === pathname)
      const nextIndex = (currentIndex + 1) % navigationItems.length
      // TODO: Navigate to navigationItems[nextIndex].href
    },
    onSwipedRight: () => {
      const currentIndex = navigationItems.findIndex(item => item.href === pathname)
      const prevIndex = currentIndex === 0 ? navigationItems.length - 1 : currentIndex - 1
      // TODO: Navigate to navigationItems[prevIndex].href
    },
    trackMouse: false,
    trackTouch: true,
  })

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Mobile header */}
        <header className="bg-white shadow-sm lg:hidden safe-area-top">
          <div className="px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between">
              <Link href="/home" className="flex items-center space-x-2 rtl:space-x-reverse">
                <LivriliLogo variant="icon-only" size="sm" priority />
                <LivriliLogo variant="primary" size="sm" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open menu</span>
                {isMobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-livrili-prussian to-livrili-air flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.full_name || user?.username}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.username}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 rtl:space-x-reverse rounded-xl px-3 py-3 text-base font-medium text-gray-700 hover:bg-livrili-prussian/5 hover:text-livrili-prussian transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 rtl:space-x-reverse w-full text-left rounded-xl px-3 py-3 text-base font-medium text-livrili-fire hover:bg-livrili-fire/5 transition-all duration-200"
                >
                  <span className="text-lg">🚪</span>
                  <span>{t('nav.sign_out', 'Sign Out')}</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg border-r border-gray-100">
            <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
              <Link href="/home" className="flex items-center space-x-3 rtl:space-x-reverse px-6 mb-8">
                <LivriliLogo variant="icon-only" size="md" priority />
                <LivriliLogo variant="primary" size="lg" />
              </Link>
              <nav className="flex-1 space-y-2 px-4">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/home' && pathname?.startsWith(item.href))
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-livrili-prussian text-white shadow-lg'
                          : 'text-gray-700 hover:text-livrili-prussian hover:bg-livrili-prussian/5'
                      }`}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 bg-gradient-to-r from-livrili-papaya/30 to-livrili-papaya/50 border-t border-livrili-papaya p-4 mx-4 rounded-xl mb-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-livrili-prussian to-livrili-air flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-livrili-prussian">
                    {user?.full_name || user?.username}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 rtl:space-x-reverse text-xs font-medium text-livrili-fire hover:text-livrili-barn transition-colors"
                  >
                    <span>🚪</span>
                    <span>{t('nav.sign_out', 'Sign out')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72" {...swipeHandlers}>
          <main className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
        </div>

        {/* Enhanced Mobile Bottom Navigation */}
        <nav className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 lg:hidden ${
          showFAB ? 'translate-y-0' : 'translate-y-full'
        }`}>
          {/* Notification dots */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {/* Cart notification dot */}
              {cartItems.length > 0 && (
                <div className="w-2 h-2 bg-livrili-fire rounded-full animate-pulse" />
              )}
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl">
            <div className="grid grid-cols-4 gap-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex flex-col items-center justify-center py-3 px-2 text-xs font-medium
                      transition-all duration-200 relative group
                      ${isActive 
                        ? 'text-livrili-prussian bg-gradient-to-t from-livrili-prussian/10 to-livrili-prussian/5' 
                        : 'text-gray-600 hover:text-livrili-prussian hover:bg-livrili-prussian/5'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-livrili-prussian rounded-full shadow-lg" />
                    )}
                    
                    {/* Icon with animation - show emoji instead */}
                    <div className={`transform transition-all duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      <span className="text-xl">{item.emoji}</span>
                    </div>
                    
                    {/* Label with animation */}
                    <span className={`mt-1 transition-all duration-200 ${
                      isActive ? 'font-semibold' : ''
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* Ripple effect */}
                    <div className="absolute inset-0 rounded-lg bg-livrili-prussian/10 scale-0 group-active:scale-100 transition-transform duration-150" />
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Floating Action Button for Cart */}
        <div className={`fixed bottom-24 right-4 z-40 transform transition-all duration-300 lg:hidden ${
          showFAB ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-16 scale-75 opacity-0'
        }`}>
          <CartButton
            items={cartItems}
            totalAmount={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
            itemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => {
              // TODO: Open cart drawer or navigate to cart
              console.log('Cart clicked')
            }}
            onCheckout={() => {
              // TODO: Handle quick checkout
              console.log('Quick checkout')
            }}
            isFloating={true}
            showQuickActions={true}
          />
        </div>
      </div>
  )
}