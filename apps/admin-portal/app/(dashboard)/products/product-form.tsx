'use client'

import { useState, useCallback } from 'react'
import { Button } from '@livrili/ui'
import { api } from '@/lib/trpc'
import { ImageGalleryManager } from './components/image-gallery-manager'
import { VariantsManager } from './components/variants-manager'
import { BarcodeGenerator } from './components/barcode-generator'
import { TagInput } from './components/tag-input'
import type { Product, ProductImage, ProductVariant, ProductTag } from './types'

interface ProductFormProps {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    category_id: product?.category_id || '',
    name_en: product?.name_en || '',
    name_ar: product?.name_ar || '',
    name_fr: product?.name_fr || '',
    description_en: product?.description_en || '',
    description_ar: product?.description_ar || '',
    description_fr: product?.description_fr || '',
    base_price: product?.base_price || 0,
    cost_price: product?.cost_price || 0,
    tax_rate: product?.tax_rate || 19,
    stock_quantity: product?.stock_quantity || 0,
    min_stock_level: product?.min_stock_level || 0,
    unit: product?.unit || 'piece',
    weight: product?.weight || '',
    is_active: product?.is_active ?? true,
  })
  
  const [images, setImages] = useState<ProductImage[]>(product?.images || [])
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || [])
  const [tags, setTags] = useState<ProductTag[]>(product?.tags || [])
  const [relatedProducts, setRelatedProducts] = useState<string[]>(
    product?.related_products?.map(p => p.id) || []
  )

  const { data: categories } = api.categories.list.useQuery({
    includeInactive: false,
  })

  const createMutation = api.products.create.useMutation({
    onSuccess,
  })

  const updateMutation = api.products.update.useMutation({
    onSuccess,
  })

  const generateSKU = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `PRD-${timestamp}-${random}`
  }, [])

  const generateBarcode = useCallback(() => {
    // Generate EAN-13 barcode (simplified)
    const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')
    return `2${randomDigits}`
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      ...formData,
      base_price: parseFloat(formData.base_price.toString()),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price.toString()) : undefined,
      tax_rate: parseFloat(formData.tax_rate.toString()),
      stock_quantity: parseInt(formData.stock_quantity.toString()),
      min_stock_level: parseInt(formData.min_stock_level.toString()),
      weight: formData.weight ? parseFloat(formData.weight.toString()) : undefined,
      category_id: formData.category_id || null,
      images,
      variants,
      related_product_ids: relatedProducts,
    }

    try {
      let productResult
      if (product) {
        productResult = await updateMutation.mutateAsync({ id: product.id, data })
      } else {
        productResult = await createMutation.mutateAsync(data)
      }

      // Handle tags separately after product creation/update
      if (tags.length > 0 && productResult) {
        const productId = product?.id || productResult.id
        if (productId) {
          // Add tags to product
          await api.products.addTags.mutate({
            productId,
            tagIds: tags.map(tag => tag.id),
          })
        }
      }
    } catch (error) {
      console.error('Product save error:', error)
      throw error
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Product details' },
    { id: 2, name: 'Tags & Images', description: 'Tags and gallery' },
    { id: 3, name: 'Variants', description: 'Product variations' },
    { id: 4, name: 'Related', description: 'Related products' },
  ]

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length))
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1))

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      {/* Step indicator */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                <div className="flex items-center">
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                      step.id < currentStep
                        ? 'bg-blue-600 text-white'
                        : step.id === currentStep
                        ? 'border-2 border-blue-600 bg-white text-blue-600'
                        : 'border-2 border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    <span className="text-sm font-medium">{step.id}</span>
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className={`text-sm font-medium ${
                      step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 left-4 -ml-0.5 mt-0.5 h-0.5 w-8 sm:w-20 bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, sku: generateSKU() })}
                      className="rounded-none rounded-r-md border-l-0"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                    Barcode
                  </label>
                  <BarcodeGenerator
                    value={formData.barcode}
                    onChange={(barcode) => setFormData({ ...formData, barcode })}
                    onGenerate={() => setFormData({ ...formData, barcode: generateBarcode() })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.parent_id ? '  → ' : ''}{cat.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

      {/* Product Names */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Names</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name_en" className="block text-sm font-medium text-gray-700">
              Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="name_ar" className="block text-sm font-medium text-gray-700">
              Name (Arabic) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name_ar"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              dir="rtl"
              required
            />
          </div>

          <div>
            <label htmlFor="name_fr" className="block text-sm font-medium text-gray-700">
              Name (French) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name_fr"
              value={formData.name_fr}
              onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="description_en" className="block text-sm font-medium text-gray-700">
              Description (English)
            </label>
            <textarea
              id="description_en"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700">
              Description (Arabic)
            </label>
            <textarea
              id="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              dir="rtl"
            />
          </div>

          <div>
            <label htmlFor="description_fr" className="block text-sm font-medium text-gray-700">
              Description (French)
            </label>
            <textarea
              id="description_fr"
              value={formData.description_fr}
              onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Pricing and Stock */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing and Stock</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">
              Base Price (DZD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="base_price"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700">
              Cost Price (DZD)
            </label>
            <input
              type="number"
              id="cost_price"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
              Tax Rate (%)
            </label>
            <input
              type="number"
              id="tax_rate"
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock_quantity"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700">
              Minimum Stock Level
            </label>
            <input
              type="number"
              id="min_stock_level"
              value={formData.min_stock_level}
              onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="piece">Piece</option>
              <option value="pack">Pack</option>
              <option value="box">Box</option>
              <option value="bottle">Bottle</option>
              <option value="can">Can</option>
              <option value="kg">Kilogram</option>
              <option value="liter">Liter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              min="0"
              step="0.001"
            />
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>
      </div>

          </div>
        )}

        {/* Step 2: Tags & Images */}
        {currentStep === 2 && (
          <div className="space-y-8">
            {/* Tags Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Tags</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add tags to help customers find this product and improve organization.
              </p>
              <TagInput
                productId={product?.id}
                selectedTags={tags}
                onTagsChange={setTags}
                categoryId={formData.category_id}
                placeholder="Add tags to organize and categorize this product..."
              />
            </div>

            {/* Images Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
              <ImageGalleryManager
                images={images}
                onChange={setImages}
                productName={formData.name_en}
              />
            </div>
          </div>
        )}

        {/* Step 3: Variants */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Variants</h3>
            <VariantsManager
              variants={variants}
              onChange={setVariants}
              basePrice={formData.base_price}
              baseSku={formData.sku}
            />
          </div>
        )}

        {/* Step 4: Related Products */}
        {currentStep === 4 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Related Products</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select products that are related to this product for cross-selling.
            </p>
            {/* Related products selector would go here */}
            <div className="text-sm text-gray-500">
              Related products feature will be implemented in the next iteration.
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}