'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@livrili/ui'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
        isActive
          ? 'border-primary text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      )}
    >
      {children}
    </Link>
  )
}