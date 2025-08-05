'use client'

import { useState, useEffect } from 'react'
import { Button } from '@livrili/ui'
import { Input } from '@livrili/ui'
import { 
  Search, 
  Filter, 
  X, 
  Eye, 
  EyeOff, 
  FolderOpen, 
  Folder,
  ChevronDown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'

interface Category {
  id: string
  name_en: string
  name_ar: string
  name_fr: string
  slug: string
  parent_id?: string
  is_active: boolean
  children?: Category[]
}

interface Filters {
  status: string
  type: string
  parent: string
}

interface CategorySearchProps {
  searchQuery: string
  filters: Filters
  categories: Category[]
  onSearch: (query: string) => void
  onFilterChange: (filters: Filters) => void
}

export function CategorySearch({
  searchQuery,
  filters,
  categories,
  onSearch,
  onFilterChange
}: CategorySearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [localQuery, onSearch])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    onFilterChange({
      status: 'all',
      type: 'all',
      parent: 'all'
    })
  }

  const clearSearch = () => {
    setLocalQuery('')
  }

  // Get parent categories for the parent filter
  const parentCategories = categories.filter(cat => !cat.parent_id)

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => value !== 'all').length

  // Build search suggestions based on existing categories
  const searchSuggestions = categories
    .filter(cat => 
      localQuery.length > 0 && 
      (cat.name_en.toLowerCase().includes(localQuery.toLowerCase()) ||
       cat.name_ar.includes(localQuery) ||
       cat.name_fr.toLowerCase().includes(localQuery.toLowerCase()) ||
       cat.slug.toLowerCase().includes(localQuery.toLowerCase()))
    )
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search categories by name, slug, or description..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {localQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && localQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 text-xs font-medium text-gray-500 border-b">
                Search Suggestions
              </div>
              {searchSuggestions.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setLocalQuery(category.name_en)
                    onSearch(category.name_en)
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                >
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {category.parent_id ? (
                      <Folder className="w-3 h-3 text-gray-400" />
                    ) : (
                      <FolderOpen className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {category.name_en}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {category.slug}
                    </div>
                  </div>
                  <Badge variant={category.is_active ? 'default' : 'secondary'} className="text-xs">
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Status Filter */}
            <DropdownMenuLabel className="text-xs font-medium text-gray-500">
              Status
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleFilterChange('status', 'all')}
              className={filters.status === 'all' ? 'bg-primary/10' : ''}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                All Statuses
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange('status', 'active')}
              className={filters.status === 'active' ? 'bg-primary/10' : ''}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-3 h-3 text-green-600" />
                Active Only
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange('status', 'inactive')}
              className={filters.status === 'inactive' ? 'bg-primary/10' : ''}
            >
              <div className="flex items-center gap-2">
                <EyeOff className="w-3 h-3 text-gray-500" />
                Inactive Only
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Type Filter */}
            <DropdownMenuLabel className="text-xs font-medium text-gray-500">
              Category Type
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleFilterChange('type', 'all')}
              className={filters.type === 'all' ? 'bg-primary/10' : ''}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                All Types
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange('type', 'main')}
              className={filters.type === 'main' ? 'bg-primary/10' : ''}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-3 h-3 text-blue-600" />
                Main Categories
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange('type', 'sub')}
              className={filters.type === 'sub' ? 'bg-primary/10' : ''}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-3 h-3 text-purple-600" />
                Subcategories
              </div>
            </DropdownMenuItem>

            {parentCategories.length > 0 && (
              <>
                <DropdownMenuSeparator />
                
                {/* Parent Filter */}
                <DropdownMenuLabel className="text-xs font-medium text-gray-500">
                  Parent Category
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('parent', 'all')}
                  className={filters.parent === 'all' ? 'bg-primary/10' : ''}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    All Parents
                  </div>
                </DropdownMenuItem>
                {parentCategories.slice(0, 8).map((parent) => (
                  <DropdownMenuItem
                    key={parent.id}
                    onClick={() => handleFilterChange('parent', parent.id)}
                    className={filters.parent === parent.id ? 'bg-primary/10' : ''}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <FolderOpen className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{parent.name_en}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters} className="text-destructive">
                  <X className="w-3 h-3 mr-2" />
                  Clear All Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button onClick={clearSearch} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <button onClick={() => handleFilterChange('status', 'all')} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.type === 'main' ? 'Main Categories' : 'Subcategories'}
              <button onClick={() => handleFilterChange('type', 'all')} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.parent !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Parent: {parentCategories.find(p => p.id === filters.parent)?.name_en || filters.parent}
              <button onClick={() => handleFilterChange('parent', 'all')} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearFilters()
              clearSearch()
            }}
            className="text-destructive hover:text-destructive"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}