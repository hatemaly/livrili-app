'use client'

import Link from 'next/link'
import { usePageTitle } from '../../hooks/use-page-title'
import { Button } from '@livrili/ui'

export default function UnauthorizedPage() {
  usePageTitle('Access Denied - Livrili Admin Portal')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access the admin portal.
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Only administrators can access this area.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link href="/login">
            <Button className="w-full" variant="outline">
              Back to Login
            </Button>
          </Link>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Are you a retailer? Visit the{' '}
              <a
                href={process.env.NEXT_PUBLIC_RETAIL_PORTAL_URL || 'http://localhost:3002'}
                className="font-medium text-primary hover:text-primary/90"
              >
                Retail Portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}