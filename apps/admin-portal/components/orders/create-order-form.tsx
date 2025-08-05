'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Label, Alert } from '@livrili/ui'
import { api } from '@/lib/trpc'
import { z } from 'zod'
import type { CreateOrderInput, Retailer, Product } from '@livrili/database/types'

// Zod schema for form validation
const orderItemSchema = z.object({
  product_id: z.string().uuid('Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Price must be positive'),
  tax_amount: z.number().min(0, 'Tax amount must be positive').default(0),
  discount_amount: z.number().min(0, 'Discount amount must be positive').default(0),
  notes: z.string().optional(),
})

const createOrderSchema = z.object({
  retailer_id: z.string().uuid('Please select a retailer'),
  items: z.array(orderItemSchema).min(1, 'Please add at least one item'),
  delivery_address: z.string().min(1, 'Delivery address is required'),
  delivery_date: z.string().optional(),
  delivery_time_slot: z.string().optional(),
  payment_method: z.enum(['cash', 'credit']).default('cash'),
  notes: z.string().optional(),
})

interface OrderItem {
  product_id: string
  quantity: number
  unit_price: number
  tax_amount: number
  discount_amount: number
  notes?: string
  // UI helpers
  product?: Product
  total: number
}

interface CreateOrderFormProps {
  onSubmit: (data: CreateOrderInput) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function CreateOrderForm({ onSubmit, onCancel, isLoading }: CreateOrderFormProps) {
  const [selectedRetailerId, setSelectedRetailerId] = useState('')
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null)
  const [items, setItems] = useState<OrderItem[]>([{
    product_id: '',
    quantity: 1,
    unit_price: 0,
    tax_amount: 0,
    discount_amount: 0,
    notes: '',
    total: 0,
  }])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Search states
  const [retailerSearch, setRetailerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')

  // Fetch data
  const { data: retailersData } = api.retailers.list.useQuery({
    status: 'active',
    search: retailerSearch || undefined,
    limit: 10,
  })

  const { data: productsData } = api.products.list.useQuery({
    search: productSearch || undefined,
    includeInactive: false,
    limit: 20,
  })

  const retailers = retailersData?.items || []
  const products = productsData?.items || []

  // Update delivery address when retailer changes
  useEffect(() => {
    if (selectedRetailer?.address) {
      setDeliveryAddress(selectedRetailer.address)
    }
  }, [selectedRetailer])

  const handleRetailerSelect = (retailerId: string) => {
    const retailer = retailers.find(r => r.id === retailerId)
    setSelectedRetailerId(retailerId)
    setSelectedRetailer(retailer || null)
    setRetailerSearch(retailer?.business_name || '')
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const quantity = item.quantity || 1
        const unitPrice = product.base_price
        const taxAmount = unitPrice * quantity * (product.tax_rate / 100)
        return {
          ...item,
          product_id: productId,
          unit_price: unitPrice,
          tax_amount: taxAmount,
          product: product,
          total: (quantity * unitPrice) + taxAmount - item.discount_amount
        }
      }
      return item
    }))
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value }
        
        // Recalculate total when quantity, price, or discount changes
        if (field === 'quantity' || field === 'unit_price' || field === 'discount_amount') {
          const quantity = Number(updated.quantity) || 0
          const unitPrice = Number(updated.unit_price) || 0
          const discountAmount = Number(updated.discount_amount) || 0
          const taxAmount = unitPrice * quantity * ((updated.product?.tax_rate || 0) / 100)
          
          updated.tax_amount = taxAmount
          updated.total = (quantity * unitPrice) + taxAmount - discountAmount
        }
        
        return updated
      }
      return item
    }))
  }

  const addItem = () => {
    setItems(prev => [...prev, {
      product_id: '',
      quantity: 1,
      unit_price: 0,
      tax_amount: 0,
      discount_amount: 0,
      notes: '',
      total: 0,
    }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const calculateOrderTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const totalTax = items.reduce((sum, item) => sum + item.tax_amount, 0)
    const totalDiscount = items.reduce((sum, item) => sum + item.discount_amount, 0)
    const total = subtotal + totalTax - totalDiscount
    
    return { subtotal, totalTax, totalDiscount, total }
  }

  const { subtotal, totalTax, totalDiscount, total } = calculateOrderTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const formData = {
        retailer_id: selectedRetailerId,
        items: items.map(({ product, total, ...item }) => item),
        delivery_address: deliveryAddress,
        delivery_date: deliveryDate || undefined,
        delivery_time_slot: deliveryTimeSlot || undefined,
        payment_method: paymentMethod,
        notes: notes || undefined,
      }

      const validatedData = createOrderSchema.parse(formData)
      await onSubmit(validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          fieldErrors[path] = err.message
        })
        setErrors(fieldErrors)
      } else {
        console.error('Validation error:', error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Retailer Selection */}
      <div>
        <Label htmlFor="retailer">Retailer *</Label>
        <div className="relative">
          <input
            type="text"
            id="retailer"
            value={retailerSearch}
            onChange={(e) => setRetailerSearch(e.target.value)}
            placeholder="Search and select retailer..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          {retailerSearch && retailers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
              {retailers.map((retailer) => (
                <button
                  key={retailer.id}
                  type="button"
                  onClick={() => handleRetailerSelect(retailer.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="font-medium">{retailer.business_name}</div>
                  <div className="text-sm text-gray-500">{retailer.city}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.retailer_id && (
          <p className="mt-1 text-sm text-red-600">{errors.retailer_id}</p>
        )}
      </div>

      {/* Retailer Info */}
      {selectedRetailer && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900">Retailer Information</h3>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Business:</span>{' '}
              {selectedRetailer.business_name}
            </div>
            <div>
              <span className="text-blue-700 font-medium">Phone:</span>{' '}
              {selectedRetailer.phone || 'N/A'}
            </div>
            <div>
              <span className="text-blue-700 font-medium">Credit Limit:</span>{' '}
              {new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' })
                .format(selectedRetailer.credit_limit)}
            </div>
            <div>
              <span className="text-blue-700 font-medium">Current Balance:</span>{' '}
              {new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' })
                .format(selectedRetailer.current_balance)}
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div>
        <div className="flex justify-between items-center">
          <Label>Order Items *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            Add Item
          </Button>
        </div>
        
        <div className="space-y-4 mt-2">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Item {index + 1}</h4>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Product Selection */}
                <div className="md:col-span-2">
                  <Label>Product *</Label>
                  <select
                    value={item.product_id}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <option value="">Select product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name_en} - {new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(product.base_price)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Quantity */}
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                {/* Unit Price */}
                <div>
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                {/* Discount */}
                <div>
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount_amount}
                    onChange={(e) => handleItemChange(index, 'discount_amount', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                {/* Tax Amount (readonly) */}
                <div>
                  <Label>Tax Amount</Label>
                  <Input
                    type="number"
                    value={item.tax_amount.toFixed(2)}
                    readOnly
                    className="w-full bg-gray-50"
                  />
                </div>
                
                {/* Item Total (readonly) */}
                <div>
                  <Label>Item Total</Label>
                  <Input
                    type="number"
                    value={item.total.toFixed(2)}
                    readOnly
                    className="w-full bg-gray-50 font-medium"
                  />
                </div>
                
                {/* Notes */}
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Input
                    type="text"
                    value={item.notes || ''}
                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                    placeholder="Optional notes for this item..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {errors.items && (
          <p className="mt-1 text-sm text-red-600">{errors.items}</p>
        )}
      </div>

      {/* Order Totals */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(totalTax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(totalDiscount)}</span>
          </div>
          <div className="flex justify-between font-medium text-lg border-t pt-2">
            <span>Total:</span>
            <span>{new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliveryAddress">Delivery Address *</Label>
          <textarea
            id="deliveryAddress"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            placeholder="Enter delivery address..."
          />
          {errors.delivery_address && (
            <p className="mt-1 text-sm text-red-600">{errors.delivery_address}</p>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="deliveryDate">Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <Label htmlFor="deliveryTimeSlot">Time Slot</Label>
            <select
              id="deliveryTimeSlot"
              value={deliveryTimeSlot}
              onChange={(e) => setDeliveryTimeSlot(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="">Any time</option>
              <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
              <option value="afternoon">Afternoon (12:00 PM - 6:00 PM)</option>
              <option value="evening">Evening (6:00 PM - 9:00 PM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <Label>Payment Method *</Label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
              className="mr-2"
            />
            Cash on Delivery
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="credit"
              checked={paymentMethod === 'credit'}
              onChange={(e) => setPaymentMethod(e.target.value as 'credit')}
              className="mr-2"
            />
            Credit
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Order Notes</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          placeholder="Optional notes for this order..."
        />
      </div>

      {/* Credit Warning */}
      {paymentMethod === 'credit' && selectedRetailer && (
        <Alert>
          <div className="text-sm">
            <p className="font-medium">Credit Payment Selected</p>
            <p>Current balance: {new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(selectedRetailer.current_balance)}</p>
            <p>Credit limit: {new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(selectedRetailer.credit_limit)}</p>
            <p>New balance after order: {new Intl.NumberFormat('en-DZ', { style: 'currency', currency: 'DZD' }).format(selectedRetailer.current_balance - total)}</p>
          </div>
        </Alert>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Order'}
        </Button>
      </div>
    </form>
  )
}