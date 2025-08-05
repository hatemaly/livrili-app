'use client'

import { Button } from '@livrili/ui'
import { Grid, Table } from 'lucide-react'

type ViewMode = 'table' | 'grid'

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
        className="flex items-center gap-2 px-3 py-1.5"
      >
        <Table className="h-4 w-4" />
        Table
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="flex items-center gap-2 px-3 py-1.5"
      >
        <Grid className="h-4 w-4" />
        Grid
      </Button>
    </div>
  )
}