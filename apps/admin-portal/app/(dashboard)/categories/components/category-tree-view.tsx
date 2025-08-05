'use client'

import { useState, useCallback } from 'react'
import { Button } from '@livrili/ui'
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Package,
  Image as ImageIcon,
  GripVertical
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

interface CategoryTreeViewProps {
  categories: Category[]
  selectedCategories: string[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onReorder: (categoryId: string, newOrder: number) => void
  onSelectionChange: (selected: string[]) => void
  isLoading: boolean
}

interface TreeNodeProps {
  category: Category
  level: number
  isExpanded: boolean
  onToggle: (categoryId: string) => void
  isSelected: boolean
  onSelect: (categoryId: string) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onDragStart: (e: React.DragEvent, category: Category) => void
  onDrop: (e: React.DragEvent, category: Category) => void
}

function TreeNode({
  category,
  level,
  isExpanded,
  onToggle,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onDrop
}: TreeNodeProps) {
  const hasChildren = category.children && category.children.length > 0
  const paddingLeft = level * 24

  return (
    <div className="select-none">
      {/* Main Category Row */}
      <div
        className={`flex items-center gap-2 py-3 px-3 hover:bg-gray-50 border-b border-gray-100 group ${
          isSelected ? 'bg-primary/5 border-primary/20' : ''
        }`}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
        draggable
        onDragStart={(e) => onDragStart(e, category)}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(e) => onDrop(e, category)}
      >
        {/* Expand/Collapse Button */}
        <div className="w-5 h-5 flex items-center justify-center">
          {hasChildren ? (
            <button
              onClick={() => onToggle(category.id)}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-3 h-3" />
          )}
        </div>

        {/* Selection Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(category.id)}
          className="data-[state=checked]:bg-primary"
        />

        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Category Icon */}
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name_en}
              className="w-full h-full object-cover"
            />
          ) : hasChildren ? (
            <Folder className="w-4 h-4 text-gray-400" />
          ) : (
            <ImageIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate" title={category.name_en}>
              {category.name_en}
            </h3>
            <Badge variant={category.is_active ? 'default' : 'secondary'} className="text-xs">
              {category.is_active ? (
                <><Eye className="w-2 h-2 mr-1" /> Active</>
              ) : (
                <><EyeOff className="w-2 h-2 mr-1" /> Inactive</>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span className="truncate" title={category.slug}>{category.slug}</span>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              <span>{category.product_count || 0}</span>
            </div>
            <span>#{category.display_order}</span>
          </div>

          {/* Multi-language names */}
          <div className="flex gap-4 mt-1 text-xs text-gray-400">
            <span title={category.name_ar}>
              <span className="font-medium">AR:</span>
              <span className="ml-1" dir="rtl">{category.name_ar}</span>
            </span>
            <span title={category.name_fr}>
              <span className="font-medium">FR:</span>
              <span className="ml-1">{category.name_fr}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-7 px-2"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <TreeNodeContainer
              key={child.id}
              category={child}
              level={level + 1}
              selectedCategories={[]}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeNodeContainerProps {
  category: Category
  level: number
  selectedCategories: string[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onSelect: (categoryId: string) => void
  onDragStart: (e: React.DragEvent, category: Category) => void
  onDrop: (e: React.DragEvent, category: Category) => void
}

function TreeNodeContainer({
  category,
  level,
  selectedCategories,
  onEdit,
  onDelete,
  onSelect,
  onDragStart,
  onDrop
}: TreeNodeContainerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const handleToggle = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedNodes(newExpanded)
  }

  return (
    <TreeNode
      category={category}
      level={level}
      isExpanded={expandedNodes.has(category.id)}
      onToggle={handleToggle}
      isSelected={selectedCategories.includes(category.id)}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
      onDragStart={onDragStart}
      onDrop={onDrop}
    />
  )
}

export function CategoryTreeView({
  categories,
  selectedCategories,
  onEdit,
  onDelete,
  onReorder,
  onSelectionChange,
  isLoading
}: CategoryTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [draggedItem, setDraggedItem] = useState<Category | null>(null)

  // Build tree structure
  const buildTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // First pass: create category map
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Second pass: build tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    // Sort categories by display_order
    const sortByOrder = (categories: Category[]) => {
      categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          sortByOrder(category.children)
        }
      })
    }

    sortByOrder(rootCategories)
    return rootCategories
  }

  const treeData = buildTree(categories)

  const handleToggle = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleSelect = (categoryId: string) => {
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

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (categories: Category[]) => {
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          allIds.add(category.id)
          collectIds(category.children)
        }
      })
    }
    collectIds(treeData)
    setExpandedNodes(allIds)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set())
  }

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="p-12 text-center">
        <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
        <p className="text-gray-500 mb-4">Create your first category to get started.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Tree Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedCategories.length === categories.length && categories.length > 0}
            onCheckedChange={selectAll}
            className="data-[state=checked]:bg-primary"
          />
          <span className="text-sm text-gray-600">
            {selectedCategories.length > 0 
              ? `${selectedCategories.length} of ${categories.length} selected`
              : `${categories.length} categories`
            }
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree Structure */}
      <div className="divide-y divide-gray-100">
        {treeData.map((category) => (
          <TreeNode
            key={category.id}
            category={category}
            level={0}
            isExpanded={expandedNodes.has(category.id)}
            onToggle={handleToggle}
            isSelected={selectedCategories.includes(category.id)}
            onSelect={handleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}