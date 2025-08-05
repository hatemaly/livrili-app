'use client'

import { useState, useCallback } from 'react'
import { Button } from '@livrili/ui'
import { Image, Plus, X, Star, ArrowUp, ArrowDown } from 'lucide-react'
import type { ProductImage } from '../types'

interface ImageGalleryManagerProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  productName: string
}

export function ImageGalleryManager({ images, onChange, productName }: ImageGalleryManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            const newImage: ProductImage = {
              id: `temp-${Date.now()}-${index}`,
              product_id: '',
              url: e.target.result as string,
              alt_text: `${productName} image ${images.length + index + 1}`,
              sort_order: images.length + index,
              is_primary: images.length === 0 && index === 0,
            }
            onChange([...images, newImage])
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }, [images, onChange, productName])

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // If we removed the primary image, make the first remaining image primary
    if (images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true
    }
    // Reorder sort_order
    newImages.forEach((img, i) => {
      img.sort_order = i
    })
    onChange(newImages)
  }, [images, onChange])

  const setPrimaryImage = useCallback((index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }))
    onChange(newImages)
  }, [images, onChange])

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    
    // Update sort_order
    newImages.forEach((img, i) => {
      img.sort_order = i
    })
    
    onChange(newImages)
  }, [images, onChange])

  const updateAltText = useCallback((index: number, altText: string) => {
    const newImages = images.map((img, i) => 
      i === index ? { ...img, alt_text: altText } : img
    )
    onChange(newImages)
  }, [images, onChange])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Click to upload images
            </span>
            <span className="text-sm text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 10MB each
          </p>
        </label>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-move"
            >
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={image.url}
                  alt={image.alt_text || `Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Primary
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPrimaryImage(index)}
                    className={`p-1 rounded-full ${
                      image.is_primary
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-yellow-500 hover:text-white'
                    }`}
                    title="Set as primary image"
                  >
                    <Star className={`h-4 w-4 ${image.is_primary ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => removeImage(index)}
                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Move buttons */}
                <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, index - 1)}
                      className="p-1 bg-white/80 text-gray-600 rounded-full hover:bg-white"
                      title="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => moveImage(index, index + 1)}
                      className="p-1 bg-white/80 text-gray-600 rounded-full hover:bg-white"
                      title="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Alt text input */}
              <div className="p-3">
                <input
                  type="text"
                  value={image.alt_text || ''}
                  onChange={(e) => updateAltText(index, e.target.value)}
                  placeholder="Alt text for accessibility"
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Image className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-2 text-sm">No images uploaded yet</p>
          <p className="text-xs">Upload images to create a product gallery</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Image Guidelines:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use high-quality images (at least 800x800 pixels)</li>
          <li>• The first image will be used as the primary product image</li>
          <li>• Add descriptive alt text for better accessibility</li>
          <li>• Drag and drop images to reorder them</li>
          <li>• Recommended formats: JPG, PNG, WebP</li>
        </ul>
      </div>
    </div>
  )
}