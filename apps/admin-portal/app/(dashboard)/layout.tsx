'use client'

import { AuthGuard, useSupabaseAuth } from '@livrili/auth'
import { Button, ImageLogoHeader } from '@livrili/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NavLink } from '../../components/navigation'
import { AdminLanguageSelector } from '../../components/admin-language-selector'
import { useAdminLanguage } from '../../lib/admin-language-context'
import { Menu, ChevronDown, Home, Users, Package, ShoppingCart, Truck, DollarSign, MessageSquare, Brain, FileText, User, LayoutGrid, Car } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, signOut } = useSupabaseAuth()
  const { t } = useAdminLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Link href="/dashboard" className="flex items-center">
                  <ImageLogoHeader />
                  <span className="ml-2 text-lg font-semibold text-gray-600">
                    Admin
                  </span>
                </Link>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  <NavLink href="/dashboard">{t('nav.dashboard', 'Dashboard')}</NavLink>
                  <NavLink href="/users">{t('nav.users', 'Users')}</NavLink>
                  <NavLink href="/retailers">{t('nav.retailers', 'Retailers')}</NavLink>
                  <NavLink href="/products">{t('nav.products', 'Products')}</NavLink>
                  <NavLink href="/orders">{t('nav.orders', 'Orders')}</NavLink>
                  
                  {/* Inventory Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                      <LayoutGrid className="h-4 w-4 mr-1" />
                      {t('nav.inventory', 'Inventory')}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href="/categories" className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          {t('nav.categories', 'Categories')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tags" className="flex items-center">
                          {t('nav.tags', 'Tags')}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Operations Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                      <Truck className="h-4 w-4 mr-1" />
                      {t('nav.operations', 'Operations')}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href="/deliveries" className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          {t('nav.deliveries', 'Deliveries')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/drivers" className="flex items-center">
                          <Car className="h-4 w-4 mr-2" />
                          {t('nav.drivers', 'Drivers')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/finance" className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {t('nav.finance', 'Finance')}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Analytics Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                      <Brain className="h-4 w-4 mr-1" />
                      {t('nav.analytics', 'Analytics')}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href="/intelligence" className="flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          {t('nav.intelligence', 'Intelligence')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/reports" className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          {t('nav.reports', 'Reports')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/communications" className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {t('nav.communications', 'Communications')}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Mobile menu button */}
                <div className="sm:hidden ml-auto mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <AdminLanguageSelector />
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">
                      {user?.fullName || user?.username}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {t('nav.profile', 'Profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      {t('common.signOut', 'Sign Out')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.dashboard', 'Dashboard')}
              </Link>
              <Link
                href="/users"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.users', 'Users')}
              </Link>
              <Link
                href="/retailers"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.retailers', 'Retailers')}
              </Link>
              <Link
                href="/products"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.products', 'Products')}
              </Link>
              <Link
                href="/orders"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.orders', 'Orders')}
              </Link>
              
              {/* Mobile menu sections */}
              <div className="border-t border-gray-200 pt-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('nav.inventory', 'Inventory')}
                </div>
                <Link
                  href="/categories"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.categories', 'Categories')}
                </Link>
                <Link
                  href="/tags"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.tags', 'Tags')}
                </Link>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('nav.operations', 'Operations')}
                </div>
                <Link
                  href="/deliveries"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.deliveries', 'Deliveries')}
                </Link>
                <Link
                  href="/drivers"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.drivers', 'Drivers')}
                </Link>
                <Link
                  href="/finance"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.finance', 'Finance')}
                </Link>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('nav.analytics', 'Analytics')}
                </div>
                <Link
                  href="/intelligence"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.intelligence', 'Intelligence')}
                </Link>
                <Link
                  href="/reports"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.reports', 'Reports')}
                </Link>
                <Link
                  href="/communications"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.communications', 'Communications')}
                </Link>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.profile', 'Profile')}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}