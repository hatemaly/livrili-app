'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@livrili/ui'
import { Button } from '@livrili/ui'
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Package, 
  FolderOpen,
  Image as ImageIcon,
  MoreVertical
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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

interface CategoryGridProps {
  categories: Category[]
  selectedCategories: string[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onReorder: (categoryId: string, newOrder: number) => void
  onSelectionChange: (selected: string[]) => void
  isLoading: boolean
}

export function CategoryGrid({
  categories,
  selectedCategories,
  onEdit,
  onDelete,
  onReorder,
  onSelectionChange,
  isLoading
}: CategoryGridProps) {
  const [draggedItem, setDraggedItem] = useState<Category | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, category: Category) => {
    setDraggedItem(category)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverItem(targetId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault()
    setDragOverItem(null)
    
    if (draggedItem && draggedItem.id !== targetCategory.id) {
      // Calculate new order based on target position
      const targetIndex = categories.findIndex(c => c.id === targetCategory.id)
      const newOrder = targetCategory.display_order
      
      onReorder(draggedItem.id, newOrder)
    }
    
    setDraggedItem(null)
  }, [draggedItem, categories, onReorder])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverItem(null)
  }, [])

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
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
    <div className="p-6">
      {/* Bulk Selection Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b">
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

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`group relative transition-all duration-200 hover:shadow-lg cursor-move ${
              dragOverItem === category.id ? 'ring-2 ring-primary ring-opacity-50' : ''
            } ${
              selectedCategories.includes(category.id) ? 'ring-2 ring-primary' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, category)}
            onDragOver={(e) => handleDragOver(e, category.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, category)}
            onDragEnd={handleDragEnd}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleSelection(category.id)}
                className="data-[state=checked]:bg-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Drag Handle */}
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            <CardHeader className="pb-3 pt-12">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate" title={category.name_en}>
                    {category.name_en}
                  </h3>
                  <p className="text-sm text-gray-500 truncate" title={category.slug}>
                    {category.slug}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(category)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(category)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Category Image */}
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* Category Info */}
              <div className="space-y-2">
                {category.description_en && (
                  <p className="text-xs text-gray-600 line-clamp-2" title={category.description_en}>
                    {category.description_en}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Package className="w-3 h-3" />
                    <span>{category.product_count || 0} products</span>
                  </div>
                  <span className="text-gray-400">#{category.display_order}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                  {category.is_active ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" /> Active
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" /> Inactive
                    </>
                  )}
                </Badge>
                
                {category.parent_id && (
                  <Badge variant="outline" className="text-xs">
                    Subcategory
                  </Badge>
                )}
                
                {(!category.parent_id && category.children && category.children.length > 0) && (
                  <Badge variant="outline" className="text-xs">
                    {category.children.length} sub
                  </Badge>
                )}
              </div>

              {/* Multi-language Names */}
              <div className="space-y-1 pt-2 border-t">
                <div className="text-xs">
                  <span className="font-medium text-gray-600">AR:</span>
                  <span className="ml-1 text-right" dir="rtl">{category.name_ar}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-gray-600">FR:</span>
                  <span className="ml-1">{category.name_fr}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-3">
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
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
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}