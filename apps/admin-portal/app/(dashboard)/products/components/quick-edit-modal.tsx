'use client'

import { useState } from 'react'
import { Button, Modal } from '@livrili/ui'
import { api } from '@/lib/trpc'
import type { Product } from '../types'

interface QuickEditModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function QuickEditModal({ product, isOpen, onClose, onSave }: QuickEditModalProps) {
  const [formData, setFormData] = useState({
    name_en: product.name_en,
    base_price: product.base_price,
    stock_quantity: product.stock_quantity,
    min_stock_level: product.min_stock_level,
    is_active: product.is_active,
  })

  const updateMutation = api.products.quickUpdate.useMutation({
    onSuccess: () => {
      onSave()
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await updateMutation.mutateAsync({
      id: product.id,
      data: {
        name_en: formData.name_en,
        base_price: parseFloat(formData.base_price.toString()),
        stock_quantity: parseInt(formData.stock_quantity.toString()),
        min_stock_level: parseInt(formData.min_stock_level.toString()),
        is_active: formData.is_active,
      },
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Edit Product"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name_en" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            id="name_en"
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (DZD)
            </label>
            <input
              type="number"
              id="base_price"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock_quantity"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        <div>
          <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Stock Level
          </label>
          <input
            type="number"
            id="min_stock_level"
            value={formData.min_stock_level}
            onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}