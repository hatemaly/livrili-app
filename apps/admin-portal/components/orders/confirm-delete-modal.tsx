'use client'

import { useState } from 'react'
import { Modal, Button, Label, Alert } from '@livrili/ui'
import type { OrderWithDetails } from '@livrili/database/types'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, notes?: string) => Promise<void>
  order: OrderWithDetails
  isLoading: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading,
}: ConfirmDeleteModalProps) {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const reasonOptions = [
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'pricing_error', label: 'Pricing Error' },
    { value: 'delivery_issue', label: 'Delivery Issue' },
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'admin_decision', label: 'Administrative Decision' },
    { value: 'other', label: 'Other' },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!reason) {
      setErrors({ reason: 'Please select a cancellation reason' })
      return
    }

    try {
      await onConfirm(reason, notes || undefined)
      setReason('')
      setNotes('')
      setErrors({})
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  const canCancel = !['delivered', 'cancelled'].includes(order.status)

  if (!canCancel) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Cannot Cancel Order"
        size="md"
      >
        <div className="text-center py-6">
          <Alert variant="destructive">
            <div className="text-sm">
              <p className="font-medium">Order Cannot Be Cancelled</p>
              <p className="mt-2">
                Orders with status "{order.status}" cannot be cancelled.
              </p>
              {order.status === 'delivered' && (
                <p className="mt-1">This order has already been delivered to the customer.</p>
              )}
              {order.status === 'cancelled' && (
                <p className="mt-1">This order has already been cancelled.</p>
              )}
            </div>
          </Alert>
          <div className="mt-6">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Order"
      size="md"
    >
      <div className="space-y-6">
        {/* Order Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Order to Cancel</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retailer:</span>
              <span>{order.retailer?.business_name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="capitalize">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span>{order.items?.length || 0} item(s)</span>
            </div>
          </div>
        </div>

        {/* Impact Warning */}
        <Alert variant="destructive">
          <div className="text-sm">
            <p className="font-medium">⚠️ Cancellation Impact</p>
            <p className="mt-1">Cancelling this order will:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Restore product stock quantities to inventory</li>
              {order.payment_method === 'credit' && order.retailer && (
                <li>
                  Restore {formatCurrency(order.total_amount)} to retailer's credit balance
                  <br />
                  <span className="text-xs">
                    (Current: {formatCurrency(order.retailer.current_balance)} → 
                    New: {formatCurrency(order.retailer.current_balance + order.total_amount)})
                  </span>
                </li>
              )}
              <li>Send cancellation notification to the retailer</li>
              <li>Update order history and audit logs</li>
              <li className="font-medium text-red-700">This action cannot be undone</li>
            </ul>
          </div>
        </Alert>

        {/* Cancellation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div>
            <Label htmlFor="reason">Cancellation Reason *</Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="">Select a reason...</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}\n            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              placeholder="Add any additional notes about the cancellation..."
            />
            <p className="mt-1 text-xs text-gray-500">
              These notes will be visible in the order history and audit logs.
            </p>
          </div>

          {/* Stock Impact Summary */}
          {order.items && order.items.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Stock Impact</h4>
              <div className="space-y-1 text-xs text-blue-800">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.product?.name_en || 'Unknown Product'}</span>
                    <span>+{item.quantity} {item.product?.unit || 'pcs'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Keep Order
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isLoading || !reason}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}