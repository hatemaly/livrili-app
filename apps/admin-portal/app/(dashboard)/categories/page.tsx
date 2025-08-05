'use client'

import { useState, useEffect } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Button, Modal } from '@livrili/ui'
import { Plus, Upload, Download, Grid, List, Search, Filter, Trash2 } from 'lucide-react'
import { api } from '@/lib/trpc'
import { CategoryForm } from './category-form'
import { CategoryGrid } from './components/category-grid'
import { CategoryTable } from './components/category-table'
import { CategoryTreeView } from './components/category-tree-view'
import { CategorySearch } from './components/category-search'
import { CategoryImportExport } from './components/category-import-export'
import { CategoryBulkActions } from './components/category-bulk-actions'
import { DeleteConfirmDialog } from './components/delete-confirm-dialog'
import { toast } from 'sonner'

type ViewMode = 'grid' | 'table' | 'tree'

export default function CategoriesPage() {
  usePageTitle('Categories - Livrili Admin Portal')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive
    type: 'all', // all, main, sub
    parent: 'all' // all, specific parent id
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    categoryId?: string
    categoryName?: string
  }>({ isOpen: false })
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)

  const { data: categories, isLoading, refetch } = api.categories.list.useQuery({
    search: searchQuery || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    type: filters.type !== 'all' ? filters.type : undefined,
    parentId: filters.parent !== 'all' ? filters.parent : undefined,
  })

  const deleteMutation = api.categories.delete.useMutation({
    onSuccess: () => {
      toast.success('Category deleted successfully')
      refetch()
      setDeleteConfirm({ isOpen: false })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category')
    },
  })

  const bulkUpdateMutation = api.categories.bulkUpdate.useMutation({
    onSuccess: () => {
      toast.success('Categories updated successfully')
      refetch()
      setSelectedCategories([])
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update categories')
    },
  })

  const reorderMutation = api.categories.reorder.useMutation({
    onSuccess: () => {
      toast.success('Categories reordered successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reorder categories')
    },
  })

  const handleEdit = (category: any) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = (category: any) => {
    setDeleteConfirm({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name_en
    })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.categoryId) {
      await deleteMutation.mutateAsync(deleteConfirm.categoryId)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCategory(null)
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete', categoryIds: string[]) => {
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${categoryIds.length} categories?`)) {
        await bulkUpdateMutation.mutateAsync({ action, categoryIds })
      }
    } else {
      await bulkUpdateMutation.mutateAsync({ action, categoryIds })
    }
  }

  const handleReorder = async (categoryId: string, newOrder: number) => {
    await reorderMutation.mutateAsync({ categoryId, newOrder })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredCategories = categories || []
  const stats = {
    total: filteredCategories.length,
    active: filteredCategories.filter(c => c.is_active).length,
    inactive: filteredCategories.filter(c => !c.is_active).length,
    main: filteredCategories.filter(c => !c.parent_id).length,
    sub: filteredCategories.filter(c => c.parent_id).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage product categories and subcategories
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>Total: {stats.total}</span>
            <span>Active: {stats.active}</span>
            <span>Inactive: {stats.inactive}</span>
            <span>Main: {stats.main}</span>
            <span>Subcategories: {stats.sub}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportExportOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import/Export
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none border-r"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-none border-r"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tree')}
              className="rounded-l-none"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <CategorySearch
        searchQuery={searchQuery}
        filters={filters}
        categories={categories || []}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <CategoryBulkActions
          selectedCount={selectedCategories.length}
          onBulkAction={handleBulkAction}
          selectedCategories={selectedCategories}
          isLoading={bulkUpdateMutation.isPending}
        />
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' && (
          <CategoryGrid
            categories={filteredCategories}
            selectedCategories={selectedCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onSelectionChange={setSelectedCategories}
            isLoading={isLoading}
          />
        )}
        
        {viewMode === 'table' && (
          <CategoryTable
            categories={filteredCategories}
            selectedCategories={selectedCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onSelectionChange={setSelectedCategories}
            isLoading={isLoading}
          />
        )}
        
        {viewMode === 'tree' && (
          <CategoryTreeView
            categories={filteredCategories}
            selectedCategories={selectedCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onSelectionChange={setSelectedCategories}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
        size="lg"
      >
        <CategoryForm
          category={selectedCategory}
          onSuccess={() => {
            handleCloseModal()
            refetch()
          }}
          onCancel={handleCloseModal}
        />
      </Modal>

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        categoryName={deleteConfirm.categoryName || ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
        isLoading={deleteMutation.isPending}
      />

      <CategoryImportExport
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportComplete={() => {
          refetch()
          setIsImportExportOpen(false)
        }}
      />
    </div>
  )
}