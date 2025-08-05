'use client'

import { Search } from 'lucide-react'
import { Input } from '@livrili/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TagFilters } from '../types'

interface TagFiltersProps {
  filters: TagFilters
  onFiltersChange: (filters: TagFilters) => void
}

export function TagFilters({ filters, onFiltersChange }: TagFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value })
  }

  const handleSortByChange = (value: TagFilters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy: value })
  }

  const handleSortOrderChange = (value: TagFilters['sortOrder']) => {
    onFiltersChange({ ...filters, sortOrder: value })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tags..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Select
          value={filters.sortBy}
          onValueChange={handleSortByChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usage_count">Usage Count</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created_at">Created Date</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.sortOrder}
          onValueChange={handleSortOrderChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}