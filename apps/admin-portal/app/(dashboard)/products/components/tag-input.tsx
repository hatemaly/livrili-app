'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Tag, Plus } from 'lucide-react'
import { api } from '@/lib/trpc'
import type { ProductTag } from '../types'

interface TagInputProps {
  productId?: string
  selectedTags: ProductTag[]
  onTagsChange: (tags: ProductTag[]) => void
  categoryId?: string
  disabled?: boolean
  placeholder?: string
}

export function TagInput({
  productId,
  selectedTags,
  onTagsChange,
  categoryId,
  disabled = false,
  placeholder = 'Add tags...',
}: TagInputProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Search tags
  const { data: searchResults, isLoading: searchLoading } = api.tags.search.useQuery(
    {
      query,
      limit: 10,
      excludeIds: selectedTags.map(tag => tag.id),
    },
    {
      enabled: query.length > 0,
    }
  )

  // Get tag suggestions based on category
  const { data: suggestions } = api.tags.getSuggestionsByCategory.useQuery(
    categoryId!,
    {
      enabled: !!categoryId && query.length === 0,
    }
  )

  const displayTags = query.length > 0 ? searchResults || [] : suggestions || []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(true)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < displayTags.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && displayTags[highlightedIndex]) {
          handleTagSelect(displayTags[highlightedIndex])
        } else if (query.trim()) {
          handleCreateTag()
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
      case 'Backspace':
        if (query === '' && selectedTags.length > 0) {
          handleTagRemove(selectedTags[selectedTags.length - 1].id)
        }
        break
    }
  }

  const handleTagSelect = (tag: any) => {
    const newTag: ProductTag = {
      id: tag.id || tag.tag_id,
      name: tag.name || tag.tag_name,
      slug: tag.slug,
      color: tag.color || tag.tag_color,
      usage_count: tag.usage_count,
    }

    if (!selectedTags.find(t => t.id === newTag.id)) {
      onTagsChange([...selectedTags, newTag])
    }
    
    setQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  const handleCreateTag = () => {
    // For now, we'll just close the dropdown
    // In a real implementation, you might want to open a modal to create the tag
    setIsOpen(false)
    setQuery('')
    console.log('Create tag:', query)
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              border: `1px solid ${tag.color}40`,
            }}
          >
            <Tag className="w-3 h-3" />
            {tag.name}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleTagRemove(tag.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-black/10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {searchLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Searching...
              </div>
            ) : displayTags.length > 0 ? (
              <>
                {displayTags.map((tag, index) => (
                  <button
                    key={tag.id || tag.tag_id}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      index === highlightedIndex ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleTagSelect(tag)}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color || tag.tag_color }}
                    />
                    <span>{tag.name || tag.tag_name}</span>
                    {(tag.usage_count || 0) > 0 && (
                      <span className="ml-auto text-xs text-gray-400">
                        {tag.usage_count}
                      </span>
                    )}
                  </button>
                ))}
                {query.length > 0 && !searchResults?.find(tag => tag.name.toLowerCase() === query.toLowerCase()) && (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-t"
                    onClick={handleCreateTag}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create "{query}"</span>
                  </button>
                )}
              </>
            ) : query.length > 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No tags found
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                Start typing to search tags
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}