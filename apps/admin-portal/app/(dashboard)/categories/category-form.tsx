'use client'

import { useState, useRef } from 'react'
import { Button, Input, Label } from '@livrili/ui'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { api } from '@/lib/trpc'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface CategoryFormProps {
  category?: any
  onSuccess: () => void
  onCancel: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name_en: category?.name_en || '',
    name_ar: category?.name_ar || '',
    name_fr: category?.name_fr || '',
    slug: category?.slug || '',
    parent_id: category?.parent_id || '',
    description_en: category?.description_en || '',
    description_ar: category?.description_ar || '',
    description_fr: category?.description_fr || '',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
    image_url: category?.image_url || '',
  })
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image_url || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: categories } = api.categories.list.useQuery({
    includeInactive: true,
  })

  const createMutation = api.categories.create.useMutation({
    onSuccess,
  })

  const updateMutation = api.categories.update.useMutation({
    onSuccess,
  })

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setFormData({ ...formData, image_url: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return formData.image_url || null

    setIsUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedImage)
      formDataUpload.append('folder', 'categories')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      toast.error('Failed to upload image')
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Upload image if selected
      const imageUrl = await uploadImage()
      
      const data = {
        ...formData,
        parent_id: formData.parent_id || null,
        image_url: imageUrl || formData.image_url || null,
      }

      if (category) {
        await updateMutation.mutateAsync({ id: category.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
    } catch (error) {
      toast.error('Failed to save category')
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || isUploadingImage

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Image Upload */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Category Image</Label>
        
        <div className="flex items-start gap-6">
          {/* Image Preview */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
          
          {/* Upload Controls */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Upload Image</>
                )}
              </Button>
              
              {(imagePreview || selectedImage) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeImage}
                  disabled={isUploadingImage}
                >
                  <X className="w-4 h-4 mr-2" /> Remove
                </Button>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Upload a category image. Recommended size: 400x400px. Max file size: 5MB.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>
      
      {/* Multi-language Names */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Category Names</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="name_en">
              Name (English) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => {
                setFormData({ ...formData, name_en: e.target.value })
                if (!category && !formData.slug) {
                  setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                }
              }}
              required
            />
          </div>

          <div>
            <Label htmlFor="name_ar">
              Name (Arabic) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_ar"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              dir="rtl"
              required
            />
          </div>

          <div>
            <Label htmlFor="name_fr">
              Name (French) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_fr"
              value={formData.name_fr}
              onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      {/* Slug and Parent Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="slug">
            Slug <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            pattern="^[a-z0-9-]+$"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            URL-friendly identifier (lowercase letters, numbers, and hyphens only)
          </p>
        </div>

        <div>
          <Label htmlFor="parent_id">Parent Category</Label>
          <select
            id="parent_id"
            value={formData.parent_id}
            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">None (Main Category)</option>
            {categories
              ?.filter(cat => cat.id !== category?.id && !cat.parent_id)
              .map(cat => (
                <option key={String(cat.id)} value={String(cat.id)}>
                  {String(cat.name_en)}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Multi-language Descriptions */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Descriptions</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="description_en">Description (English)</Label>
            <Textarea
              id="description_en"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={3}
              placeholder="Enter category description in English..."
            />
          </div>

          <div>
            <Label htmlFor="description_ar">Description (Arabic)</Label>
            <Textarea
              id="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              rows={3}
              dir="rtl"
              placeholder="أدخل وصف الفئة باللغة العربية..."
            />
          </div>

          <div>
            <Label htmlFor="description_fr">Description (French)</Label>
            <Textarea
              id="description_fr"
              value={formData.description_fr}
              onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
              rows={3}
              placeholder="Entrez la description de la catégorie en français..."
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            type="number"
            id="display_order"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
          <p className="mt-1 text-xs text-gray-500">
            Categories are displayed in ascending order (0 = first)
          </p>
        </div>

        <div className="flex items-center space-x-3 pt-6">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Active (visible to users)
          </Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isUploadingImage ? 'Uploading...' : 'Saving...'}</>
          ) : (
            category ? 'Update Category' : 'Create Category'
          )}
        </Button>
      </div>
    </form>
  )
}