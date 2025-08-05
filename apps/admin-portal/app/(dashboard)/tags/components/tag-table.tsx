'use client'

import { Eye, Edit, Trash2, Tag as TagIcon } from 'lucide-react'
import { Button } from '@livrili/ui'
import type { Tag } from '../types'

interface TagTableProps {
  tags: Tag[]
  loading: boolean
  selectedTags: Set<string>
  onSelectTag: (tagId: string, isSelected: boolean) => void
  onSelectAll: (isSelected: boolean) => void
  onEdit: (tag: Tag) => void
  onDelete: (tagId: string) => void
}

export function TagTable({
  tags,
  loading,
  selectedTags,
  onSelectTag,
  onSelectAll,
  onEdit,
  onDelete,
}: TagTableProps) {
  const isAllSelected = tags.length > 0 && tags.every(tag => selectedTags.has(tag.id))
  const isPartiallySelected = tags.some(tag => selectedTags.has(tag.id)) && !isAllSelected

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tags</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first tag.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-8 px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isPartiallySelected
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tag
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tags.map((tag) => (
            <tr
              key={tag.id}
              className={`hover:bg-gray-50 ${
                selectedTags.has(tag.id) ? 'bg-blue-50' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedTags.has(tag.id)}
                  onChange={(e) => onSelectTag(tag.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {tag.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      /{tag.slug}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900">
                    {tag.usage_count}
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    product{tag.usage_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(tag.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(tag)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(tag.id)}
                    className="text-gray-400 hover:text-red-500"
                    disabled={tag.usage_count > 0}
                    title={tag.usage_count > 0 ? 'Cannot delete tag in use' : 'Delete tag'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}