'use client'

import { useState, useCallback } from 'react'
import { DataTable } from '@livrili/ui'
import { Button } from '@livrili/ui'
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Package, 
  Image as ImageIcon,
  ArrowUpDown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

interface Category {
  id: string
  name_en: string
  name_ar: string
  name_fr: string
  slug: string
  description_en?: string
  description_ar?: string
  description_fr?: string
  parent_id?: string
  display_order: number
  is_active: boolean
  image_url?: string
  product_count?: number
  children?: Category[]
  created_at: string
  updated_at: string
}

interface CategoryTableProps {
  categories: Category[]
  selectedCategories: string[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onReorder: (categoryId: string, newOrder: number) => void
  onSelectionChange: (selected: string[]) => void
  isLoading: boolean
}

export function CategoryTable({
  categories,
  selectedCategories,
  onEdit,
  onDelete,
  onReorder,
  onSelectionChange,
  isLoading
}: CategoryTableProps) {
  const [draggedItem, setDraggedItem] = useState<Category | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Category
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSort = (key: keyof Category) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const sortedCategories = [...categories].sort((a, b) => {
    if (!sortConfig) return 0
    
    const { key, direction } = sortConfig
    const aValue = a[key]
    const bValue = b[key]
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })

  const handleDragStart = useCallback((e: React.DragEvent, category: Category) => {
    setDraggedItem(category)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault()
    
    if (draggedItem && draggedItem.id !== targetCategory.id) {
      const newOrder = targetCategory.display_order
      onReorder(draggedItem.id, newOrder)
    }
    
    setDraggedItem(null)
  }, [draggedItem, onReorder])

  const toggleSelection = (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    onSelectionChange(newSelection)
  }

  const selectAll = () => {
    if (selectedCategories.length === categories.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(categories.map(c => c.id))
    }
  }

  const columns = [
    {
      key: 'select',
      header: (
        <Checkbox
          checked={selectedCategories.length === categories.length && categories.length > 0}
          onCheckedChange={selectAll}
          className="data-[state=checked]:bg-primary"
        />
      ),
      accessor: (category: Category) => (
        <Checkbox
          checked={selectedCategories.includes(category.id)}
          onCheckedChange={() => toggleSelection(category.id)}
          className="data-[state=checked]:bg-primary"
        />
      ),
      className: 'w-12',
    },
    {
      key: 'drag',
      header: '',
      accessor: (category: Category) => (
        <div
          className="cursor-move p-1 rounded hover:bg-gray-100"
          draggable
          onDragStart={(e) => handleDragStart(e, category)}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }}
          onDrop={(e) => handleDrop(e, category)}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      ),
      className: 'w-12',
    },
    {
      key: 'image',
      header: 'Image',
      accessor: (category: Category) => (
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name_en}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
      ),
      className: 'w-16',
    },
    {
      key: 'name',
      header: (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => handleSort('name_en')}
        >
          Name
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      accessor: (category: Category) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{category.name_en}</div>
          <div className="text-sm text-gray-500">{category.slug}</div>
          <div className="space-y-0.5">
            <div className="text-xs text-gray-400">
              <span className="font-medium">AR:</span>
              <span className="ml-1" dir="rtl">{category.name_ar}</span>
            </div>
            <div className="text-xs text-gray-400">
              <span className="font-medium">FR:</span>
              <span className="ml-1">{category.name_fr}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (category: Category) => (
        <div className="max-w-xs">
          {category.description_en && (
            <p className="text-sm text-gray-600 line-clamp-2" title={category.description_en}>
              {category.description_en}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Type',
      accessor: (category: Category) => (
        <div className="space-y-1">
          <Badge variant="outline">
            {category.parent_id ? 'Subcategory' : 'Main Category'}
          </Badge>
          {!category.parent_id && category.children && category.children.length > 0 && (
            <div className="text-xs text-gray-500">
              {category.children.length} subcategories
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'products',
      header: (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => handleSort('product_count')}
        >
          Products
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      accessor: (category: Category) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Package className="w-3 h-3" />
          <span>{category.product_count || 0}</span>
        </div>
      ),
      className: 'text-center',
    },
    {
      key: 'order',
      header: (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => handleSort('display_order')}
        >
          Order
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      accessor: (category: Category) => (
        <span className="text-sm font-mono text-gray-600">
          #{category.display_order}
        </span>
      ),
      className: 'text-center w-20',
    },
    {
      key: 'status',
      header: (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => handleSort('is_active')}
        >
          Status
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      accessor: (category: Category) => (
        <Badge variant={category.is_active ? 'default' : 'secondary'}>
          {category.is_active ? (
            <><Eye className="w-3 h-3 mr-1" /> Active</>
          ) : (
            <><EyeOff className="w-3 h-3 mr-1" /> Inactive</>
          )}
        </Badge>
      ),
    },
    {
      key: 'dates',
      header: 'Created',
      accessor: (category: Category) => (
        <div className="text-sm text-gray-600">
          <div>{new Date(category.created_at).toLocaleDateString()}</div>
          <div className="text-xs text-gray-400">
            Updated: {new Date(category.updated_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (category: Category) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(category)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="overflow-hidden">
      <DataTable
        data={sortedCategories}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyMessage="No categories found. Create your first category to get started."
        className="min-w-full"
      />
    </div>
  )
}