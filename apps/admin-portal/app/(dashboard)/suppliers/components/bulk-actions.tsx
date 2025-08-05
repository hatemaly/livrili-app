'use client'

import { useState } from 'react'
import { Button, Select, Modal, Input, Textarea } from '@livrili/ui'
import { ChevronDownIcon, CheckIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline'

interface BulkActionsProps {
  selectedCount: number
  onBulkAction: (action: string, options?: any) => Promise<void>
  disabled: boolean
}

const bulkActions = [
  { value: 'activate', label: 'Activate', color: 'green' },
  { value: 'deactivate', label: 'Deactivate', color: 'gray' },
  { value: 'suspend', label: 'Suspend', color: 'red' },
  { value: 'set_preferred', label: 'Mark as Preferred', color: 'yellow' },
  { value: 'remove_preferred', label: 'Remove Preferred', color: 'gray' },
  { value: 'update_terms', label: 'Update Payment Terms', color: 'blue' },
  { value: 'export', label: 'Export Selected', color: 'blue' },
  { value: 'delete', label: 'Delete', color: 'red' },
]

const paymentTermsOptions = [
  { value: 'Net 15', label: 'Net 15 Days' },
  { value: 'Net 30', label: 'Net 30 Days' },
  { value: 'Net 45', label: 'Net 45 Days' },
  { value: 'Net 60', label: 'Net 60 Days' },
  { value: '2/10 Net 30', label: '2/10 Net 30' },
  { value: 'Cash on Delivery', label: 'Cash on Delivery' },
  { value: 'Prepayment', label: 'Prepayment Required' },
]

export function BulkActions({ selectedCount, onBulkAction, disabled }: BulkActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [actionOptions, setActionOptions] = useState({
    payment_terms: '',
    notes: '',
  })

  if (selectedCount === 0) {
    return null
  }

  const handleActionClick = (action: string) => {
    setShowDropdown(false)
    
    if (action === 'update_terms') {
      setCurrentAction(action)
      setShowModal(true)
    } else if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedCount} suppliers? This action cannot be undone.`)) {
        onBulkAction(action)
      }
    } else {
      onBulkAction(action)
    }
  }

  const handleModalSubmit = async () => {
    if (!currentAction) return

    try {
      await onBulkAction(currentAction, actionOptions)
      setShowModal(false)
      setCurrentAction(null)
      setActionOptions({ payment_terms: '', notes: '' })
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  const handleModalCancel = () => {
    setShowModal(false)
    setCurrentAction(null)
    setActionOptions({ payment_terms: '', notes: '' })
  }

  const getActionColor = (action: string) => {
    const actionConfig = bulkActions.find(a => a.value === action)
    return actionConfig?.color || 'gray'
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {selectedCount} supplier{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            Bulk Actions
            <ChevronDownIcon className="w-4 h-4" />
          </Button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                {bulkActions.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => handleActionClick(action.value)}
                    disabled={disabled}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                      ${action.color === 'red' ? 'text-red-600 hover:bg-red-50' : 
                        action.color === 'green' ? 'text-green-600 hover:bg-green-50' :
                        action.color === 'yellow' ? 'text-yellow-600 hover:bg-yellow-50' :
                        action.color === 'blue' ? 'text-blue-600 hover:bg-blue-50' :
                        'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      {action.value === 'set_preferred' && <StarIcon className="w-4 h-4" />}
                      {action.value === 'activate' && <CheckIcon className="w-4 h-4" />}
                      {action.value === 'deactivate' && <XMarkIcon className="w-4 h-4" />}
                      {action.value === 'suspend' && <XMarkIcon className="w-4 h-4" />}
                      {action.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for actions that need additional input */}
      <Modal
        isOpen={showModal}
        onClose={handleModalCancel}
        title={
          currentAction === 'update_terms' ? 'Update Payment Terms' : 
          'Bulk Action'
        }
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This action will be applied to {selectedCount} selected supplier{selectedCount !== 1 ? 's' : ''}.
          </p>

          {currentAction === 'update_terms' && (
            <>
              <div>
                <Select
                  label="Payment Terms"
                  value={actionOptions.payment_terms}
                  onValueChange={(value) => setActionOptions(prev => ({ ...prev, payment_terms: value }))}
                  options={paymentTermsOptions}
                  placeholder="Select payment terms"
                  required
                />
              </div>
              
              <div>
                <Textarea
                  label="Notes (Optional)"
                  value={actionOptions.notes}
                  onChange={(e) => setActionOptions(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this change..."
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleModalCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModalSubmit}
              disabled={disabled || (currentAction === 'update_terms' && !actionOptions.payment_terms)}
              className={
                getActionColor(currentAction || '') === 'red' ? 
                'bg-red-600 hover:bg-red-700' : ''
              }
            >
              {disabled ? 'Processing...' : 'Apply Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}