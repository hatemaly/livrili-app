'use client'

import { useState, useCallback } from 'react'
import { Button } from '@livrili/ui'
import { Plus, X, Settings } from 'lucide-react'
import type { ProductVariant, VariantAttribute } from '../types'

interface VariantsManagerProps {
  variants: ProductVariant[]
  onChange: (variants: ProductVariant[]) => void
  basePrice: number
  baseSku: string
}

const commonAttributes = [
  { name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { name: 'Color', values: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'] },
  { name: 'Material', values: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather'] },
  { name: 'Style', values: ['Classic', 'Modern', 'Vintage', 'Casual', 'Formal'] },
]

export function VariantsManager({ variants, onChange, basePrice, baseSku }: VariantsManagerProps) {
  const [showBulkGenerator, setShowBulkGenerator] = useState(false)
  const [selectedAttributes, setSelectedAttributes] = useState<{[key: string]: string[]}>({})

  const addVariant = useCallback(() => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      product_id: '',
      name: `Variant ${variants.length + 1}`,
      sku: `${baseSku}-V${variants.length + 1}`,
      barcode: '',
      price_adjustment: 0,
      stock_quantity: 0,
      attributes: [],
      is_active: true,
    }
    onChange([...variants, newVariant])
  }, [variants, onChange, baseSku])

  const removeVariant = useCallback((index: number) => {
    const newVariants = variants.filter((_, i) => i !== index)
    onChange(newVariants)
  }, [variants, onChange])

  const updateVariant = useCallback((index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = variants.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    )
    onChange(newVariants)
  }, [variants, onChange])

  const updateVariantAttribute = useCallback((variantIndex: number, attributeIndex: number, field: keyof VariantAttribute, value: string) => {
    const newVariants = variants.map((variant, i) => {
      if (i === variantIndex) {
        const newAttributes = variant.attributes.map((attr, j) => 
          j === attributeIndex ? { ...attr, [field]: value } : attr
        )
        return { ...variant, attributes: newAttributes }
      }
      return variant
    })
    onChange(newVariants)
  }, [variants, onChange])

  const addVariantAttribute = useCallback((variantIndex: number) => {
    const newVariants = variants.map((variant, i) => {
      if (i === variantIndex) {
        return {
          ...variant,
          attributes: [...variant.attributes, { name: '', value: '' }]
        }
      }
      return variant
    })
    onChange(newVariants)
  }, [variants, onChange])

  const removeVariantAttribute = useCallback((variantIndex: number, attributeIndex: number) => {
    const newVariants = variants.map((variant, i) => {
      if (i === variantIndex) {
        return {
          ...variant,
          attributes: variant.attributes.filter((_, j) => j !== attributeIndex)
        }
      }
      return variant
    })
    onChange(newVariants)
  }, [variants, onChange])

  const generateVariantsFromAttributes = useCallback(() => {
    const attributeNames = Object.keys(selectedAttributes)
    if (attributeNames.length === 0) return

    // Generate all combinations
    const combinations: VariantAttribute[][] = []
    
    const generateCombinations = (currentCombination: VariantAttribute[], remainingAttributes: string[]) => {
      if (remainingAttributes.length === 0) {
        combinations.push([...currentCombination])
        return
      }
      
      const [currentAttr, ...rest] = remainingAttributes
      const values = selectedAttributes[currentAttr]
      
      values.forEach(value => {
        generateCombinations(
          [...currentCombination, { name: currentAttr, value }],
          rest
        )
      })
    }
    
    generateCombinations([], attributeNames)
    
    // Create variants from combinations
    const newVariants = combinations.map((attributes, index) => {
      const variantName = attributes.map(attr => attr.value).join(' / ')
      const variantSku = `${baseSku}-${attributes.map(attr => attr.value.substring(0, 2).toUpperCase()).join('')}`
      
      return {
        id: `temp-${Date.now()}-${index}`,
        product_id: '',
        name: variantName,
        sku: variantSku,
        barcode: '',
        price_adjustment: 0,
        stock_quantity: 0,
        attributes,
        is_active: true,
      }
    })
    
    onChange([...variants, ...newVariants])
    setSelectedAttributes({})
    setShowBulkGenerator(false)
  }, [selectedAttributes, variants, onChange, baseSku])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-medium text-gray-900">Product Variants</h4>
          <p className="text-sm text-gray-600">
            Create different versions of your product (size, color, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowBulkGenerator(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Bulk Generate
          </Button>
          <Button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </Button>
        </div>
      </div>

      {/* Variants list */}
      {variants.length > 0 ? (
        <div className="space-y-4">
          {variants.map((variant, variantIndex) => (
            <div key={variant.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h5 className="font-medium text-gray-900">Variant {variantIndex + 1}</h5>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(variantIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(variantIndex, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => updateVariant(variantIndex, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={variant.barcode || ''}
                    onChange={(e) => updateVariant(variantIndex, 'barcode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Adjustment (DZD)
                  </label>
                  <input
                    type="number"
                    value={variant.price_adjustment}
                    onChange={(e) => updateVariant(variantIndex, 'price_adjustment', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Final price: {formatCurrency(basePrice + variant.price_adjustment)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={variant.stock_quantity}
                    onChange={(e) => updateVariant(variantIndex, 'stock_quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`variant-active-${variantIndex}`}
                    checked={variant.is_active}
                    onChange={(e) => updateVariant(variantIndex, 'is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`variant-active-${variantIndex}`} className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              {/* Variant attributes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Attributes
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addVariantAttribute(variantIndex)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Attribute
                  </Button>
                </div>

                {variant.attributes.length > 0 ? (
                  <div className="space-y-2">
                    {variant.attributes.map((attribute, attributeIndex) => (
                      <div key={attributeIndex} className="flex gap-2 items-center">
                        <select
                          value={attribute.name}
                          onChange={(e) => updateVariantAttribute(variantIndex, attributeIndex, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select attribute</option>
                          {commonAttributes.map(attr => (
                            <option key={attr.name} value={attr.name}>{attr.name}</option>
                          ))}
                          <option value="custom">Custom...</option>
                        </select>
                        
                        {attribute.name && attribute.name !== 'custom' && commonAttributes.find(a => a.name === attribute.name) ? (
                          <select
                            value={attribute.value}
                            onChange={(e) => updateVariantAttribute(variantIndex, attributeIndex, 'value', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select value</option>
                            {commonAttributes.find(a => a.name === attribute.name)?.values.map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={attribute.value}
                            onChange={(e) => updateVariantAttribute(variantIndex, attributeIndex, 'value', e.target.value)}
                            placeholder="Attribute value"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariantAttribute(variantIndex, attributeIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    No attributes defined. Click "Add Attribute" to add variant attributes.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No variants</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first product variant.
          </p>
        </div>
      )}

      {/* Bulk generator modal */}
      {showBulkGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Generate Variants</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select attributes and their values to automatically generate all possible combinations.
            </p>
            
            <div className="space-y-4">
              {commonAttributes.map(attribute => (
                <div key={attribute.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {attribute.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map(value => (
                      <label key={value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAttributes[attribute.name]?.includes(value) || false}
                          onChange={(e) => {
                            const current = selectedAttributes[attribute.name] || []
                            if (e.target.checked) {
                              setSelectedAttributes({
                                ...selectedAttributes,
                                [attribute.name]: [...current, value]
                              })
                            } else {
                              setSelectedAttributes({
                                ...selectedAttributes,
                                [attribute.name]: current.filter(v => v !== value)
                              })
                            }
                          }}
                          className="mr-1 h-3 w-3"
                        />
                        <span className="text-sm">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowBulkGenerator(false)
                  setSelectedAttributes({})
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={generateVariantsFromAttributes}
                disabled={Object.keys(selectedAttributes).length === 0}
              >
                Generate Variants
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}