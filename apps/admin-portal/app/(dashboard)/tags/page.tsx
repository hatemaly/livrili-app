'use client'

import { useState, useCallback } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Button, Modal } from '@livrili/ui'
import { api } from '@/lib/trpc'
import { TagForm } from './components/tag-form'
import { TagTable } from './components/tag-table'
import { TagCloud } from './components/tag-cloud'
import { TagBulkActions } from './components/tag-bulk-actions'
import { TagImportExport } from './components/tag-import-export'
import { TagAnalytics } from './components/tag-analytics'
import { TagFilters } from './components/tag-filters'
import { ViewToggle } from './components/view-toggle'
import type { Tag, TagFilters as TagFiltersType } from './types'

type ViewMode = 'table' | 'cloud' | 'analytics'

export default function TagsPage() {
  usePageTitle('Tags - Livrili Admin Portal')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showImportExport, setShowImportExport] = useState(false)

  const [filters, setFilters] = useState<TagFiltersType>({
    search: '',
    sortBy: 'usage_count',
    sortOrder: 'desc',
  })

  const { data: tagsData, isLoading, refetch } = api.tags.list.useQuery({
    search: filters.search || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    includeAnalytics: viewMode === 'analytics',
    limit: 100,
  })

  const { data: popularTags } = api.tags.getPopular.useQuery({ limit: 15 })

  const deleteMutation = api.tags.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const mergeMutation = api.tags.merge.useMutation({
    onSuccess: () => {
      refetch()
      setSelectedTags(new Set())
    },
  })

  const refreshAnalyticsMutation = api.tags.refreshAnalytics.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleEdit = useCallback((tag: Tag) => {
    setSelectedTag(tag)
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete tag:', error)
      }
    }
  }, [deleteMutation])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedTag(null)
  }, [])

  const handleFilterChange = useCallback((newFilters: TagFiltersType) => {
    setFilters(newFilters)
  }, [])

  const handleSelectTag = useCallback((tagId: string, isSelected: boolean) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(tagId)
      } else {
        newSet.delete(tagId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected && tagsData?.items) {
      setSelectedTags(new Set(tagsData.items.map(t => t.id)))
    } else {
      setSelectedTags(new Set())
    }
  }, [tagsData?.items])

  const handleBulkAction = useCallback(async (action: string, options?: any) => {
    if (selectedTags.size === 0) return

    try {
      switch (action) {
        case 'merge':
          if (selectedTags.size !== 2) {
            alert('Please select exactly 2 tags to merge')
            return
          }
          const [sourceId, targetId] = Array.from(selectedTags)
          await mergeMutation.mutateAsync({
            sourceTagId: sourceId,
            targetTagId: targetId,
          })
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedTags.size} tags?`)) {
            for (const tagId of selectedTags) {
              await deleteMutation.mutateAsync(tagId)
            }
          }
          break
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }, [selectedTags, mergeMutation, deleteMutation])

  const handleRefreshAnalytics = useCallback(async () => {
    try {
      await refreshAnalyticsMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to refresh analytics:', error)
    }
  }, [refreshAnalyticsMutation])

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage product tags for better organization and search
          </p>
        </div>
        <div className="flex gap-2">
          {viewMode === 'analytics' && (
            <Button
              variant="outline"
              onClick={handleRefreshAnalytics}
              disabled={refreshAnalyticsMutation.isPending}
            >
              Refresh Analytics
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowImportExport(true)}
          >
            Import/Export
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            Add Tag
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <TagFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
        />
      </div>

      <div className="mb-4 flex justify-between items-center">
        <TagBulkActions
          selectedCount={selectedTags.size}
          onBulkAction={handleBulkAction}
          disabled={deleteMutation.isPending || mergeMutation.isPending}
        />
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <div className="bg-white rounded-lg shadow">
        {viewMode === 'table' && (
          <TagTable
            tags={tagsData?.items || []}
            loading={isLoading}
            selectedTags={selectedTags}
            onSelectTag={handleSelectTag}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        
        {viewMode === 'cloud' && (
          <TagCloud
            tags={popularTags || []}
            onTagClick={handleEdit}
          />
        )}
        
        {viewMode === 'analytics' && (
          <TagAnalytics
            tags={tagsData?.items || []}
            loading={isLoading}
          />
        )}
      </div>

      {tagsData && tagsData.total > tagsData.limit && (
        <div className="mt-4 flex justify-center">
          <p className="text-sm text-gray-600">
            Showing {tagsData.items.length} of {tagsData.total} tags
          </p>
        </div>
      )}

      {/* Tag Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedTag ? 'Edit Tag' : 'Add Tag'}
        size="lg"
      >
        <TagForm
          tag={selectedTag}
          onSuccess={() => {
            handleCloseModal()
            refetch()
          }}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Import/Export Dialog */}
      <TagImportExport
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onRefresh={refetch}
      />
    </div>
  )
}