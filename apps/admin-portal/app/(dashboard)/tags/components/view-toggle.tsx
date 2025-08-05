'use client'

import { Table, Cloud, BarChart3 } from 'lucide-react'
import { Button } from '@livrili/ui'

type ViewMode = 'table' | 'cloud' | 'analytics'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-gray-200 bg-white p-1">
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="flex items-center gap-2 px-3 py-2"
      >
        <Table className="w-4 h-4" />
        Table
      </Button>
      <Button
        variant={viewMode === 'cloud' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('cloud')}
        className="flex items-center gap-2 px-3 py-2"
      >
        <Cloud className="w-4 h-4" />
        Cloud
      </Button>
      <Button
        variant={viewMode === 'analytics' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('analytics')}
        className="flex items-center gap-2 px-3 py-2"
      >
        <BarChart3 className="w-4 h-4" />
        Analytics
      </Button>
    </div>
  )
}