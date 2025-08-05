'use client'

import { useState, useCallback } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Button, Modal } from '@livrili/ui'
import { api } from '@/lib/trpc'
import { ProductForm } from './product-form'
import { ProductFilters } from './components/product-filters'
import { ProductGrid } from './components/product-grid'
import { ProductTable } from './components/product-table'
import { BulkActions } from './components/bulk-actions'
import { ProductPreview } from './components/product-preview'
import { ImportExportDialog } from './components/import-export-dialog'
import { BatchProgressDialog } from './components/batch-progress-dialog'
import { ViewToggle } from './components/view-toggle'
import type { Product, ProductFilters as ProductFiltersType } from './types'

type ViewMode = 'table' | 'grid'

export default function ProductsPage() {
  usePageTitle('Products - Livrili Admin Portal')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showImportExport, setShowImportExport] = useState(false)
  const [batchOperation, setBatchOperation] = useState<{
    type: string
    progress: number
    total: number
    isVisible: boolean
  } | null>(null)

  const [filters, setFilters] = useState<ProductFiltersType>({
    search: '',
    category: '',
    tags: [],
    priceRange: { min: 0, max: 0 },
    stockStatus: '',
    supplier: '',
    isActive: undefined,
  })

  const { data: products, isLoading, refetch } = api.products.list.useQuery({
    search: filters.search || undefined,
    categoryId: filters.category || undefined,
    tagIds: filters.tags.length > 0 ? filters.tags : undefined,
    minPrice: filters.priceRange.min || undefined,
    maxPrice: filters.priceRange.max || undefined,
    stockStatus: filters.stockStatus || undefined,
    supplierId: filters.supplier || undefined,
    isActive: filters.isActive,
  })

  const { data: categories } = api.categories.list.useQuery()
  const { data: suppliers } = api.suppliers.list.useQuery()

  const deleteMutation = api.products.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const bulkUpdateMutation = api.products.bulkUpdate.useMutation({
    onSuccess: () => {
      refetch()
      setSelectedProducts(new Set())
    },
  })

  const duplicateProductMutation = api.products.duplicate.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }, [])

  const handlePreview = useCallback((product: Product) => {
    setPreviewProduct(product)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteMutation.mutateAsync(id)
    }
  }, [deleteMutation])

  const handleDuplicate = useCallback(async (id: string) => {
    await duplicateProductMutation.mutateAsync(id)
  }, [duplicateProductMutation])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }, [])

  const handleFilterChange = useCallback((newFilters: ProductFiltersType) => {
    setFilters(newFilters)
  }, [])

  const handleSelectProduct = useCallback((productId: string, isSelected: boolean) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(productId)
      } else {
        newSet.delete(productId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected && products?.items) {
      setSelectedProducts(new Set(products.items.map(p => p.id)))
    } else {
      setSelectedProducts(new Set())
    }
  }, [products?.items])

  const handleBulkAction = useCallback(async (action: string, options?: any) => {
    if (selectedProducts.size === 0) return

    setBatchOperation({
      type: action,
      progress: 0,
      total: selectedProducts.size,
      isVisible: true,
    })

    try {
      await bulkUpdateMutation.mutateAsync({
        productIds: Array.from(selectedProducts),
        action,
        options,
      })
    } finally {
      setBatchOperation(null)
    }
  }, [selectedProducts, bulkUpdateMutation])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your product catalog with advanced features
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportExport(true)}
          >
            Import/Export
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            Add Product
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <ProductFilters
          filters={filters}
          categories={categories || []}
          suppliers={suppliers || []}
          onFiltersChange={handleFilterChange}
        />
      </div>

      <div className="mb-4 flex justify-between items-center">
        <BulkActions
          selectedCount={selectedProducts.size}
          onBulkAction={handleBulkAction}
          disabled={bulkUpdateMutation.isPending}
        />
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <div className="bg-white rounded-lg shadow">
        {viewMode === 'table' ? (
          <ProductTable
            products={products?.items || []}
            loading={isLoading}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onDuplicate={handleDuplicate}
            formatCurrency={formatCurrency}
          />
        ) : (
          <ProductGrid
            products={products?.items || []}
            loading={isLoading}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onDuplicate={handleDuplicate}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      {products && products.total > products.limit && (
        <div className="mt-4 flex justify-center">
          <p className="text-sm text-gray-600">
            Showing {products.items.length} of {products.total} products
          </p>
        </div>
      )}

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
        size="xl"
      >
        <ProductForm
          product={selectedProduct}
          onSuccess={() => {
            handleCloseModal()
            refetch()
          }}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Product Preview Modal */}
      <ProductPreview
        product={previewProduct}
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
        onEdit={() => {
          if (previewProduct) {
            handleEdit(previewProduct)
            setPreviewProduct(null)
          }
        }}
        formatCurrency={formatCurrency}
      />

      {/* Import/Export Dialog */}
      <ImportExportDialog
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onRefresh={refetch}
      />

      {/* Batch Progress Dialog */}
      {batchOperation && (
        <BatchProgressDialog
          operation={batchOperation}
          onClose={() => setBatchOperation(null)}
        />
      )}
    </div>
  )
}