'use client'

import { useState, useEffect } from 'react'
import { Button, Input } from '@livrili/ui'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/trpc'
import type { Tag, TagFormData } from '../types'

interface TagFormProps {
  tag?: Tag | null
  onSuccess: () => void
  onCancel: () => void
}

const DEFAULT_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export function TagForm({ tag, onSuccess, onCancel }: TagFormProps) {
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    slug: '',
    color: DEFAULT_COLORS[0],
    description: '',
  })
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)
  const [errors, setErrors] = useState<Partial<TagFormData>>({})

  const createMutation = api.tags.create.useMutation({
    onSuccess,
    onError: (error) => {
      if (error.message.includes('already exists')) {
        setErrors({ name: 'Tag with this name already exists' })
      }
    },
  })

  const updateMutation = api.tags.update.useMutation({
    onSuccess,
    onError: (error) => {
      if (error.message.includes('already exists')) {
        setErrors({ name: 'Tag with this name already exists' })
      }
    },
  })

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        description: tag.description || '',
      })
    }
  }, [tag])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: !tag ? generateSlug(value) : prev.slug, // Only auto-generate for new tags
    }))
    setErrors(prev => ({ ...prev, name: undefined }))
  }

  const handleSlugChange = (value: string) => {
    const slug = generateSlug(value)
    setFormData(prev => ({ ...prev, slug }))
    setErrors(prev => ({ ...prev, slug: undefined }))
  }

  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }))
  }

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }))
  }

  const validateForm = () => {
    const newErrors: Partial<TagFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      newErrors.color = 'Invalid color format'
    }

    if (formData.slug && !formData.slug.match(/^[a-z0-9-]+$/)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (tag) {
        await updateMutation.mutateAsync({
          id: tag.id,
          data: {
            name: formData.name,
            slug: formData.slug || undefined,
            color: formData.color,
            description: formData.description || undefined,
          },
        })
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          slug: formData.slug || undefined,
          color: formData.color,
          description: formData.description || undefined,
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={errors.name ? 'border-red-500' : ''}
          placeholder="Enter tag name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug
        </label>
        <Input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className={errors.slug ? 'border-red-500' : ''}
          placeholder="auto-generated-from-name"
          disabled={isLoading}
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Used in URLs. Leave empty to auto-generate.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Color
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? 'border-gray-900' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              disabled={isLoading}
            />
          ))}
        </div>
        <Input
          type="color"
          value={formData.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-20 h-10"
          disabled={isLoading}
        />
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
          placeholder="Optional description for this tag"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : tag ? 'Update Tag' : 'Create Tag'}
        </Button>
      </div>
    </form>
  )
}