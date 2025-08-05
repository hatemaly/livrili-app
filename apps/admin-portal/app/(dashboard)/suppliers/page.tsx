'use client'

import { useState, useCallback } from 'react'
import { Button, Modal } from '@livrili/ui'
import { api } from '@/lib/trpc'
import { SupplierForm } from './supplier-form'
import { SupplierFilters } from './components/supplier-filters'
import { SupplierGrid } from './components/supplier-grid'
import { SupplierTable } from './components/supplier-table'
import { BulkActions } from './components/bulk-actions'
import { SupplierDetails } from './components/supplier-details'
import { ImportExportDialog } from './components/import-export-dialog'
import { BatchProgressDialog } from './components/batch-progress-dialog'
import { ViewToggle } from './components/view-toggle'
import { SupplierStats } from './components/supplier-stats'
import type { Supplier, SupplierFilters as SupplierFiltersType } from './types'

type ViewMode = 'table' | 'grid'

export default function SuppliersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [detailsSupplier, setDetailsSupplier] = useState<Supplier | null>(null)
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showImportExport, setShowImportExport] = useState(false)
  const [batchOperation, setBatchOperation] = useState<{
    type: string
    progress: number
    total: number
    isVisible: boolean
  } | null>(null)

  const [filters, setFilters] = useState<SupplierFiltersType>({
    search: '',
    status: '',
    categories: [],
    payment_terms: '',
    performance_rating: { min: 0, max: 5 },
    is_preferred: undefined,
    has_recent_orders: undefined,
  })

  const { data: suppliers, isLoading, refetch } = api.suppliers.list.useQuery({
    search: filters.search || undefined,
    status: filters.status || undefined,
    categories: filters.categories.length > 0 ? filters.categories : undefined,
    payment_terms: filters.payment_terms || undefined,
    min_rating: filters.performance_rating.min || undefined,
    max_rating: filters.performance_rating.max || undefined,
    is_preferred: filters.is_preferred,
    has_recent_orders: filters.has_recent_orders,
  })

  const { data: stats } = api.suppliers.getStats.useQuery()

  const deleteMutation = api.suppliers.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const bulkUpdateMutation = api.suppliers.bulkUpdate.useMutation({
    onSuccess: () => {
      refetch()
      setSelectedSuppliers(new Set())
    },
  })

  const duplicateSupplierMutation = api.suppliers.duplicate.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleEdit = useCallback((supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsModalOpen(true)
  }, [])

  const handleViewDetails = useCallback((supplier: Supplier) => {
    setDetailsSupplier(supplier)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id)
    }
  }, [deleteMutation])

  const handleDuplicate = useCallback(async (id: string) => {
    await duplicateSupplierMutation.mutateAsync(id)
  }, [duplicateSupplierMutation])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedSupplier(null)
  }, [])

  const handleFilterChange = useCallback((newFilters: SupplierFiltersType) => {
    setFilters(newFilters)
  }, [])

  const handleSelectSupplier = useCallback((supplierId: string, isSelected: boolean) => {
    setSelectedSuppliers(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(supplierId)
      } else {
        newSet.delete(supplierId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected && suppliers?.items) {
      setSelectedSuppliers(new Set(suppliers.items.map(s => s.id)))
    } else {
      setSelectedSuppliers(new Set())
    }
  }, [suppliers?.items])

  const handleBulkAction = useCallback(async (action: string, options?: any) => {
    if (selectedSuppliers.size === 0) return

    setBatchOperation({
      type: action,
      progress: 0,
      total: selectedSuppliers.size,
      isVisible: true,
    })

    try {
      await bulkUpdateMutation.mutateAsync({
        supplierIds: Array.from(selectedSuppliers),
        action,
        options,
      })
    } finally {
      setBatchOperation(null)
    }
  }, [selectedSuppliers, bulkUpdateMutation])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your supplier network and track performance
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
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="mb-6">
          <SupplierStats stats={stats} />
        </div>
      )}

      <div className="mb-6">
        <SupplierFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
        />
      </div>

      <div className="mb-4 flex justify-between items-center">
        <BulkActions
          selectedCount={selectedSuppliers.size}
          onBulkAction={handleBulkAction}
          disabled={bulkUpdateMutation.isPending}
        />
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <div className="bg-white rounded-lg shadow">
        {viewMode === 'table' ? (
          <SupplierTable
            suppliers={suppliers?.items || []}
            loading={isLoading}
            selectedSuppliers={selectedSuppliers}
            onSelectSupplier={handleSelectSupplier}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
            onDuplicate={handleDuplicate}
            formatCurrency={formatCurrency}
            formatRating={formatRating}
            formatPercentage={formatPercentage}
          />
        ) : (
          <SupplierGrid
            suppliers={suppliers?.items || []}
            loading={isLoading}
            selectedSuppliers={selectedSuppliers}
            onSelectSupplier={handleSelectSupplier}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
            onDuplicate={handleDuplicate}
            formatCurrency={formatCurrency}
            formatRating={formatRating}
            formatPercentage={formatPercentage}
          />
        )}
      </div>

      {suppliers && suppliers.total > suppliers.limit && (
        <div className="mt-4 flex justify-center">
          <p className="text-sm text-gray-600">
            Showing {suppliers.items.length} of {suppliers.total} suppliers
          </p>
        </div>
      )}

      {/* Supplier Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}
        size="xl"
      >
        <SupplierForm
          supplier={selectedSupplier}
          onSuccess={() => {
            handleCloseModal()
            refetch()
          }}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Supplier Details Modal */}
      <SupplierDetails
        supplier={detailsSupplier}
        isOpen={!!detailsSupplier}
        onClose={() => setDetailsSupplier(null)}
        onEdit={() => {
          if (detailsSupplier) {
            handleEdit(detailsSupplier)
            setDetailsSupplier(null)
          }
        }}
        formatCurrency={formatCurrency}
        formatRating={formatRating}
        formatPercentage={formatPercentage}
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