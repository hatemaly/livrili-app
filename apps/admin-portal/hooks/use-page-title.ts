'use client'

import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = title
    }
  }, [title])
}