'use client'

import { Tag as TagIcon } from 'lucide-react'
import type { Tag } from '../types'

interface TagCloudProps {
  tags: Tag[]
  onTagClick?: (tag: Tag) => void
  maxSize?: number
  minSize?: number
}

export function TagCloud({ 
  tags, 
  onTagClick, 
  maxSize = 2.5, 
  minSize = 0.8 
}: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tags</h3>
        <p className="mt-1 text-sm text-gray-500">
          Tags will appear here as they are created and used.
        </p>
      </div>
    )
  }

  // Calculate tag sizes based on usage
  const maxUsage = Math.max(...tags.map(tag => tag.usage_count))
  const minUsage = Math.min(...tags.map(tag => tag.usage_count))
  const usageRange = maxUsage - minUsage || 1

  const getTagSize = (usageCount: number) => {
    const normalizedUsage = (usageCount - minUsage) / usageRange
    return minSize + (normalizedUsage * (maxSize - minSize))
  }

  const getTagOpacity = (usageCount: number) => {
    const normalizedUsage = (usageCount - minUsage) / usageRange
    return 0.6 + (normalizedUsage * 0.4) // Range from 0.6 to 1.0
  }

  return (
    <div className="p-8">
      <div className="flex flex-wrap gap-4 justify-center items-center min-h-[400px]">
        {tags.map((tag) => {
          const size = getTagSize(tag.usage_count)
          const opacity = getTagOpacity(tag.usage_count)
          
          return (
            <button
              key={tag.id}
              onClick={() => onTagClick?.(tag)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{
                fontSize: `${size}rem`,
                backgroundColor: `${tag.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                color: tag.color,
                border: `2px solid ${tag.color}`,
              }}
              title={`${tag.name} - Used in ${tag.usage_count} product${tag.usage_count !== 1 ? 's' : ''}`}
            >
              <TagIcon className="w-4 h-4" style={{ fontSize: `${size * 0.6}rem` }} />
              {tag.name}
              <span className="text-xs opacity-75 ml-1">
                {tag.usage_count}
              </span>
            </button>
          )
        })}
      </div>
      
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span>Less used</span>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-gray-300 to-gray-600" />
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-600" />
            <span>More used</span>
          </div>
        </div>
      </div>
    </div>
  )
}