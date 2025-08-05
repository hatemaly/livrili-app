'use client'

import { Button } from '@livrili/ui'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  categoryName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
  hasSubcategories?: boolean
  hasProducts?: boolean
  subcategoryCount?: number
  productCount?: number
}

export function DeleteConfirmDialog({
  isOpen,
  categoryName,
  onConfirm,
  onCancel,
  isLoading,
  hasSubcategories = false,
  hasProducts = false,
  subcategoryCount = 0,
  productCount = 0
}: DeleteConfirmDialogProps) {
  const canDelete = !hasSubcategories && !hasProducts
  const hasWarnings = hasSubcategories || hasProducts

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Category
          </DialogTitle>
          <DialogDescription className="text-left">
            Are you sure you want to delete the category "{categoryName}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Section */}
          {hasWarnings && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">
                    Cannot Delete Category
                  </h4>
                  <p className="text-sm text-gray-600">
                    This category cannot be deleted because:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {hasSubcategories && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                        It has {subcategoryCount} subcategories
                      </li>
                    )}
                    {hasProducts && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                        It contains {productCount} products
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Deletion Info */}
          {canDelete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-800">
                    Permanent Deletion
                  </h4>
                  <p className="text-sm text-yellow-700">
                    This action cannot be undone. The category and all its data will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Info */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{categoryName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {hasSubcategories && (
                    <Badge variant="outline" className="text-xs">
                      {subcategoryCount} subcategories
                    </Badge>
                  )}
                  {hasProducts && (
                    <Badge variant="outline" className="text-xs">
                      {productCount} products
                    </Badge>
                  )}
                  {!hasWarnings && (
                    <Badge variant="secondary" className="text-xs">
                      Safe to delete
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          {hasWarnings && (
            <div className="text-sm text-gray-600">
              <h4 className="font-medium text-gray-900 mb-2">To delete this category:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                {hasProducts && (
                  <li>Move or delete all {productCount} products in this category</li>
                )}
                {hasSubcategories && (
                  <li>Delete or move all {subcategoryCount} subcategories</li>
                )}
                <li>Try deleting the category again</li>
              </ol>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          {canDelete ? (
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? 'Deleting...' : 'Delete Category'}
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Cannot Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}