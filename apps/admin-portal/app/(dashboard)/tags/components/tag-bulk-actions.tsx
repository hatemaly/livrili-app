'use client'

import { Merge, Trash2 } from 'lucide-react'
import { Button } from '@livrili/ui'

interface TagBulkActionsProps {
  selectedCount: number
  onBulkAction: (action: string, options?: any) => void
  disabled?: boolean
}

export function TagBulkActions({ selectedCount, onBulkAction, disabled }: TagBulkActionsProps) {
  if (selectedCount === 0) {
    return (
      <div className="text-sm text-gray-500">
        Select tags to perform bulk actions
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {selectedCount} tag{selectedCount > 1 ? 's' : ''} selected
      </span>
      
      <div className="flex gap-2 ml-4">
        {selectedCount === 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('merge')}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Merge className="w-4 h-4" />
            Merge Tags
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('delete')}
          disabled={disabled}
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  )
}