'use client'

import { useState } from 'react'
import { Button, DataTable } from '@livrili/ui'
import { Eye, Pencil, Copy, Trash2, AlertTriangle } from 'lucide-react'
import { QuickEditModal } from './quick-edit-modal'
import type { Product } from '../types'

interface ProductTableProps {
  products: Product[]
  loading: boolean
  selectedProducts: Set<string>
  onSelectProduct: (productId: string, isSelected: boolean) => void
  onSelectAll: (isSelected: boolean) => void
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onPreview: (product: Product) => void
  onDuplicate: (productId: string) => void
  formatCurrency: (amount: number) => string
}

export function ProductTable({
  products,
  loading,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
  formatCurrency,
}: ProductTableProps) {
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null)

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return { status: 'out_of_stock', color: 'bg-red-100 text-red-800', text: 'Out of Stock' }
    } else if (product.stock_quantity <= product.min_stock_level) {
      return { status: 'low_stock', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' }
    } else {
      return { status: 'in_stock', color: 'bg-green-100 text-green-800', text: 'In Stock' }
    }
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={products.length > 0 && selectedProducts.size === products.length}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      accessor: (product: Product) => (
        <input
          type="checkbox"
          checked={selectedProducts.has(product.id)}
          onChange={(e) => onSelectProduct(product.id, e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      className: 'w-12',
    },
    {
      key: 'product',
      header: 'Product',
      accessor: (product: Product) => (
        <div className="flex items-center gap-3">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images.find(img => img.is_primary)?.url || product.images[0].url}
              alt={product.name_en}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{product.name_en}</p>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            {product.barcode && (
              <p className="text-xs text-gray-400">Barcode: {product.barcode}</p>
            )}
          </div>
        </div>
      ),
      className: 'min-w-[300px]',
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (product: Product) => (
        <span className="text-sm text-gray-900">
          {product.categories?.name_en || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      accessor: (product: Product) => (
        <div className="text-right">
          <p className="font-medium text-gray-900">{formatCurrency(product.base_price)}</p>
          {product.cost_price && (
            <p className="text-xs text-gray-500">Cost: {formatCurrency(product.cost_price)}</p>
          )}
        </div>
      ),
      className: 'text-right',
    },
    {
      key: 'stock',
      header: 'Stock',
      accessor: (product: Product) => {
        const stockStatus = getStockStatus(product)
        return (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                {product.stock_quantity}
              </span>
              {stockStatus.status === 'low_stock' && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min: {product.min_stock_level}
            </p>
          </div>
        )
      },
      className: 'text-center',
    },
    {
      key: 'variants',
      header: 'Variants',
      accessor: (product: Product) => (
        <div className="text-center">
          {product.variants && product.variants.length > 0 ? (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {product.variants.length}
            </span>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      ),
      className: 'text-center',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (product: Product) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            product.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (product: Product) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(product)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuickEditProduct(product)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(product.id)}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-40',
    },
  ]

  return (
    <>
      <DataTable
        data={products}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No products found. Create your first product to get started."
      />
      
      {quickEditProduct && (
        <QuickEditModal
          product={quickEditProduct}
          isOpen={true}
          onClose={() => setQuickEditProduct(null)}
          onSave={() => {
            setQuickEditProduct(null)
            // Trigger refetch in parent component
          }}
        />
      )}
    </>
  )
}