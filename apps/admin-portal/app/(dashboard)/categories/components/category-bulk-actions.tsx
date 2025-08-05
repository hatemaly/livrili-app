'use client'

import { Button } from '@livrili/ui'
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  Download, 
  Copy,
  Archive,
  MoreHorizontal,
  CheckCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'

interface CategoryBulkActionsProps {
  selectedCount: number
  selectedCategories: string[]
  onBulkAction: (action: 'activate' | 'deactivate' | 'delete' | 'export' | 'duplicate' | 'archive', categoryIds: string[]) => void
  isLoading: boolean
}

export function CategoryBulkActions({
  selectedCount,
  selectedCategories,
  onBulkAction,
  isLoading
}: CategoryBulkActionsProps) {
  const handleAction = (action: 'activate' | 'deactivate' | 'delete' | 'export' | 'duplicate' | 'archive') => {
    onBulkAction(action, selectedCategories)
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary" />
          <span className="font-medium text-primary">
            {selectedCount} {selectedCount === 1 ? 'category' : 'categories'} selected
          </span>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Bulk Actions Available
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('activate')}
            disabled={isLoading}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            Activate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('deactivate')}
            disabled={isLoading}
            className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Deactivate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('export')}
            disabled={isLoading}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <MoreHorizontal className="w-4 h-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => handleAction('duplicate')}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate Categories
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAction('archive')}
                className="flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive Categories
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedCount} categories? This action cannot be undone.`)) {
                    handleAction('delete')
                  }
                }}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete Categories
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Action Descriptions */}
      <div className="mt-3 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3 text-green-600" />
            <span>Activate: Make categories visible to users</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff className="w-3 h-3 text-yellow-600" />
            <span>Deactivate: Hide categories from users</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-3 h-3 text-blue-600" />
            <span>Export: Download category data as CSV</span>
          </div>
          <div className="flex items-center gap-2">
            <Copy className="w-3 h-3 text-purple-600" />
            <span>Duplicate: Create copies of categories</span>
          </div>
        </div>
      </div>
    </div>
  )
}