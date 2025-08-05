'use client'

import { useState } from 'react'
import { Button, Modal } from '@livrili/ui'
import { Pencil, ChevronLeft, ChevronRight, Image } from 'lucide-react'
import type { Product } from '../types'

interface ProductPreviewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  formatCurrency: (amount: number) => string
}

export function ProductPreview({ product, isOpen, onClose, onEdit, formatCurrency }: ProductPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!product) return null

  const images = product.images || []
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
  }

  const getStockStatus = () => {
    if (product.stock_quantity <= 0) {
      return { color: 'text-red-600', text: 'Out of Stock' }
    } else if (product.stock_quantity <= product.min_stock_level) {
      return { color: 'text-yellow-600', text: 'Low Stock' }
    } else {
      return { color: 'text-green-600', text: 'In Stock' }
    }
  }

  const stockStatus = getStockStatus()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Preview"
      size="2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            {hasImages ? (
              <>
                <img
                  src={images[currentImageIndex].url}
                  alt={images[currentImageIndex].alt_text || product.name_en}
                  className="w-full h-full object-cover"
                />
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Image className="h-24 w-24" />
              </div>
            )}
          </div>

          {/* Image thumbnails */}
          {hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt_text || `${product.name_en} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name_en}</h2>
            {product.name_ar && (
              <h3 className="text-lg text-gray-700 mt-1" dir="rtl">{product.name_ar}</h3>
            )}
            {product.name_fr && (
              <h3 className="text-lg text-gray-700 mt-1">{product.name_fr}</h3>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">SKU:</span>
              <span className="ml-2 font-medium">{product.sku}</span>
            </div>
            {product.barcode && (
              <div>
                <span className="text-gray-500">Barcode:</span>
                <span className="ml-2 font-medium">{product.barcode}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Category:</span>
              <span className="ml-2 font-medium">{product.categories?.name_en || 'Uncategorized'}</span>
            </div>
            <div>
              <span className="text-gray-500">Unit:</span>
              <span className="ml-2 font-medium capitalize">{product.unit}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.base_price)}</span>
                {product.cost_price && (
                  <div className="text-sm text-gray-500 mt-1">
                    Cost: {formatCurrency(product.cost_price)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${stockStatus.color}`}>
                  {stockStatus.text}
                </div>
                <div className="text-sm text-gray-500">
                  {product.stock_quantity} in stock
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Min Stock Level:</span>
                <span className="ml-2 font-medium">{product.min_stock_level}</span>
              </div>
              <div>
                <span className="text-gray-500">Tax Rate:</span>
                <span className="ml-2 font-medium">{product.tax_rate}%</span>
              </div>
              {product.weight && (
                <div>
                  <span className="text-gray-500">Weight:</span>
                  <span className="ml-2 font-medium">{product.weight} kg</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 font-medium ${product.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Variants ({product.variants.length})</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{variant.name}</span>
                      <span className="text-sm text-gray-500 ml-2">SKU: {variant.sku}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {variant.price_adjustment >= 0 ? '+' : ''}{formatCurrency(variant.price_adjustment)}
                      </div>
                      <div className="text-xs text-gray-500">{variant.stock_quantity} in stock</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description_en && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">English</h5>
                  <p className="text-sm text-gray-600 mt-1">{product.description_en}</p>
                </div>
                {product.description_ar && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Arabic</h5>
                    <p className="text-sm text-gray-600 mt-1" dir="rtl">{product.description_ar}</p>
                  </div>
                )}
                {product.description_fr && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">French</h5>
                    <p className="text-sm text-gray-600 mt-1">{product.description_fr}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Products */}
          {product.related_products && product.related_products.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Related Products</h4>
              <div className="grid grid-cols-2 gap-2">
                {product.related_products.slice(0, 4).map((related) => (
                  <div key={related.id} className="p-2 border border-gray-200 rounded text-sm">
                    <div className="font-medium truncate">{related.name_en}</div>
                    <div className="text-gray-500">{formatCurrency(related.base_price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <Button onClick={onEdit} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit Product
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}