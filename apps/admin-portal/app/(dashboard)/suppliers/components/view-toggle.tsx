'use client'

import { Button } from '@livrili/ui'
import { TableCellsIcon, Squares2X2Icon } from '@heroicons/react/24/outline'

interface ViewToggleProps {
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg p-1">
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="flex items-center gap-2"
      >
        <TableCellsIcon className="w-4 h-4" />
        Table
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="flex items-center gap-2"
      >
        <Squares2X2Icon className="w-4 h-4" />
        Grid
      </Button>
    </div>
  )
}