'use client'

import { useState } from 'react'
import { Button, Modal } from '@livrili/ui'
import { ChevronDown, Check, X, DollarSign, Package } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  onBulkAction: (action: string, options?: any) => Promise<void>
  disabled: boolean
}

export function BulkActions({ selectedCount, onBulkAction, disabled }: BulkActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [priceUpdate, setPriceUpdate] = useState({ type: 'percentage', value: 0 })
  const [stockUpdate, setStockUpdate] = useState({ type: 'set', value: 0 })

  if (selectedCount === 0) {
    return null
  }

  const handlePriceUpdate = async () => {
    await onBulkAction('updatePrice', priceUpdate)
    setShowPriceModal(false)
    setPriceUpdate({ type: 'percentage', value: 0 })
  }

  const handleStockUpdate = async () => {
    await onBulkAction('updateStock', stockUpdate)
    setShowStockModal(false)
    setStockUpdate({ type: 'set', value: 0 })
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
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
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onBulkAction('activate')
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Check className="h-4 w-4 text-green-500" />
                  Activate Selected
                </button>
                
                <button
                  onClick={() => {
                    onBulkAction('deactivate')
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 text-gray-500" />
                  Deactivate Selected
                </button>
                
                <button
                  onClick={() => {
                    setShowPriceModal(true)
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  Update Prices
                </button>
                
                <button
                  onClick={() => {
                    setShowStockModal(true)
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Package className="h-4 w-4 text-orange-500" />
                  Update Stock
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedCount} product${selectedCount !== 1 ? 's' : ''}?`)) {
                      onBulkAction('delete')
                    }
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Price Update Modal */}
      <Modal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        title="Update Prices"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Update prices for {selectedCount} selected product{selectedCount !== 1 ? 's' : ''}
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Type
            </label>
            <select
              value={priceUpdate.type}
              onChange={(e) => setPriceUpdate({ ...priceUpdate, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="percentage">Percentage Change</option>
              <option value="fixed">Fixed Amount Change</option>
              <option value="set">Set Exact Price</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {priceUpdate.type === 'percentage' ? 'Percentage (%)' : 'Amount (DZD)'}
            </label>
            <input
              type="number"
              value={priceUpdate.value}
              onChange={(e) => setPriceUpdate({ ...priceUpdate, value: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={priceUpdate.type === 'percentage' ? '10' : '100'}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPriceModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePriceUpdate} disabled={disabled}>
              {disabled ? 'Updating...' : 'Update Prices'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Stock Update Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title="Update Stock"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Update stock for {selectedCount} selected product{selectedCount !== 1 ? 's' : ''}
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Type
            </label>
            <select
              value={stockUpdate.type}
              onChange={(e) => setStockUpdate({ ...stockUpdate, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="set">Set Exact Quantity</option>
              <option value="add">Add to Current Stock</option>
              <option value="subtract">Subtract from Current Stock</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={stockUpdate.value}
              onChange={(e) => setStockUpdate({ ...stockUpdate, value: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowStockModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStockUpdate} disabled={disabled}>
              {disabled ? 'Updating...' : 'Update Stock'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}