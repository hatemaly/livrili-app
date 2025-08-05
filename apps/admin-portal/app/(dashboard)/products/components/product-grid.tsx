'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardFooter } from '@livrili/ui'
import { Eye, Pencil, Copy, Trash2, AlertTriangle, Image } from 'lucide-react'
import { QuickEditModal } from './quick-edit-modal'
import type { Product } from '../types'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  selectedProducts: Set<string>
  onSelectProduct: (productId: string, isSelected: boolean) => void
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onPreview: (product: Product) => void
  onDuplicate: (productId: string) => void
  formatCurrency: (amount: number) => string
}

export function ProductGrid({
  products,
  loading,
  selectedProducts,
  onSelectProduct,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
  formatCurrency,
}: ProductGridProps) {
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Image className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create your first product to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {products.map((product) => {
          const stockStatus = getStockStatus(product)
          const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
          
          return (
            <Card key={product.id} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
              {/* Selection checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={(e) => onSelectProduct(product.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/90"
                />
              </div>

              {/* Status badges */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                {!product.is_active && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
                {stockStatus.status === 'low_stock' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                  </span>
                )}
                {stockStatus.status === 'out_of_stock' && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                )}
              </div>

              <CardContent className="p-0">
                {/* Product image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer" onClick={() => onPreview(product)}>
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={primaryImage.alt_text || product.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Image className="h-16 w-16" />
                    </div>
                  )}
                  
                  {/* Image gallery indicator */}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      +{product.images.length - 1}
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate" title={product.name_en}>
                    {product.name_en}
                  </h3>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  {product.categories && (
                    <p className="text-xs text-gray-400 mt-1">{product.categories.name_en}</p>
                  )}
                  
                  {/* Price */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(product.base_price)}</p>
                      {product.cost_price && (
                        <p className="text-xs text-gray-500">Cost: {formatCurrency(product.cost_price)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {product.stock_quantity}
                      </span>
                    </div>
                  </div>

                  {/* Variants indicator */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-1">
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
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      
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