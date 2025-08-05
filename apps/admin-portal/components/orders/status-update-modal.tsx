'use client'

import { useState } from 'react'
import { Modal, Button, Label, Alert } from '@livrili/ui'
import type { OrderStatus } from '@livrili/database/types'

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (status: OrderStatus, notes?: string) => Promise<void>
  currentStatus?: OrderStatus
  isBulk: boolean
  selectedCount: number
  isLoading: boolean
}

export function StatusUpdateModal({
  isOpen,
  onClose,
  onUpdate,
  currentStatus,
  isBulk,
  selectedCount,
  isLoading,
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('confirmed')
  const [notes, setNotes] = useState('')

  const statusOptions: { value: OrderStatus; label: string; description: string }[] = [
    {
      value: 'confirmed',
      label: 'Confirmed',
      description: 'Order has been confirmed and will be processed',
    },
    {
      value: 'processing',
      label: 'Processing',
      description: 'Order is being prepared for shipment',
    },
    {
      value: 'shipped',
      label: 'Shipped',
      description: 'Order has been shipped and is in transit',
    },
    {
      value: 'delivered',
      label: 'Delivered',
      description: 'Order has been successfully delivered',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      description: 'Order has been cancelled',
    },
  ]

  // Valid transitions based on current status
  const getValidTransitions = (status?: OrderStatus) => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    }
    
    if (!status) return statusOptions.map(s => s.value)
    return transitions[status] || []
  }

  const validStatuses = isBulk 
    ? statusOptions.map(s => s.value) // Allow all statuses for bulk updates
    : getValidTransitions(currentStatus)

  const availableOptions = statusOptions.filter(option => 
    validStatuses.includes(option.value)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onUpdate(selectedStatus, notes || undefined)
      setNotes('')
      setSelectedStatus('confirmed')
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'text-yellow-700',
      confirmed: 'text-blue-700',
      processing: 'text-indigo-700',
      shipped: 'text-purple-700',
      delivered: 'text-green-700',
      cancelled: 'text-red-700',
    }
    return colors[status] || colors.pending
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBulk ? `Update Status for ${selectedCount} Orders` : 'Update Order Status'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Status Display */}
        {!isBulk && currentStatus && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm">
              <span className="text-gray-600">Current Status:</span>{' '}
              <span className={`font-medium capitalize ${getStatusColor(currentStatus)}`}>
                {currentStatus}
              </span>
            </div>
          </div>
        )}

        {/* Bulk Update Info */}
        {isBulk && (
          <Alert>
            <div className="text-sm">
              <p className="font-medium">Bulk Status Update</p>
              <p>You are updating the status for {selectedCount} selected orders.</p>
              <p className="mt-1 text-xs text-gray-600">
                Note: Only orders that allow the selected status transition will be updated.
              </p>
            </div>
          </Alert>
        )}

        {/* Status Selection */}
        <div>
          <Label htmlFor="status">New Status *</Label>
          <div className="mt-2 space-y-3">
            {availableOptions.length > 0 ? (
              availableOptions.map((option) => (
                <label key={option.value} className="flex items-start">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    className="mt-1 mr-3 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${getStatusColor(option.value)}`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  No status transitions available for the current status.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            placeholder="Add any additional notes about this status update..."
          />
        </div>

        {/* Status Change Warnings */}
        {selectedStatus === 'cancelled' && (
          <Alert variant="destructive">
            <div className="text-sm">
              <p className="font-medium">⚠️ Cancellation Warning</p>
              <p>Cancelling orders will:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Restore product stock quantities</li>
                <li>Restore retailer credit balance (if credit payment)</li>
                <li>Cannot be undone</li>
              </ul>
            </div>
          </Alert>
        )}

        {selectedStatus === 'delivered' && (
          <Alert>
            <div className="text-sm">
              <p className="font-medium">✅ Delivery Confirmation</p>
              <p>Marking orders as delivered will:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Complete the order fulfillment process</li>
                <li>Trigger any delivery notifications</li>
                <li>Update performance metrics</li>
              </ul>
            </div>
          </Alert>
        )}

        {selectedStatus === 'confirmed' && (
          <Alert>
            <div className="text-sm">
              <p className="font-medium">📦 Order Confirmation</p>
              <p>Confirming orders will:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Lock the order for processing</li>
                <li>Create delivery entries automatically</li>
                <li>Reserve stock quantities</li>
              </ul>
            </div>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || availableOptions.length === 0}
          >
            {isLoading ? 'Updating...' : isBulk ? `Update ${selectedCount} Orders` : 'Update Status'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}