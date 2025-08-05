'use client'

import { Modal, Button, Alert } from '@livrili/ui'
import { api } from '@/lib/trpc'
import type { OrderWithDetails } from '@livrili/database/types'

interface OrderDetailsModalProps {
  order: OrderWithDetails
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  // Fetch full order details including items
  const { data: fullOrder, isLoading } = api.orders.getById.useQuery(
    order.id,
    { enabled: isOpen }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const orderData = fullOrder || order

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details - ${orderData.order_number}`}
      size="xl"
      footer={
        <Button onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading order details...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Information</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{orderData.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(orderData.status)}`}>
                      {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDateTime(orderData.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span>{formatDateTime(orderData.updated_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="capitalize font-medium">{orderData.payment_method}</span>
                  </div>
                  {orderData.created_by_user && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created By:</span>
                      <span>{orderData.created_by_user.full_name || orderData.created_by_user.username}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Retailer Information</h3>
                {orderData.retailer ? (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Name:</span>
                      <span className="font-medium">{orderData.retailer.business_name}</span>
                    </div>
                    {orderData.retailer.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{orderData.retailer.phone}</span>
                      </div>
                    )}
                    {orderData.retailer.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{orderData.retailer.email}</span>
                      </div>
                    )}
                    {orderData.retailer.city && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">City:</span>
                        <span>{orderData.retailer.city}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credit Limit:</span>
                      <span>{formatCurrency(orderData.retailer.credit_limit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Balance:</span>
                      <span className={orderData.retailer.current_balance < 0 ? 'text-red-600 font-medium' : ''}>
                        {formatCurrency(orderData.retailer.current_balance)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">Retailer information not available</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Address:</span>
                <p className="mt-1">{orderData.delivery_address}</p>
              </div>
              <div className="space-y-2">
                {orderData.delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Date:</span>
                    <span>{new Date(orderData.delivery_date).toLocaleDateString()}</span>
                  </div>
                )}
                {orderData.delivery_time_slot && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Slot:</span>
                    <span className="capitalize">{orderData.delivery_time_slot}</span>
                  </div>
                )}
                {orderData.delivery_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span>{formatCurrency(orderData.delivery_fee)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            {orderData.items && orderData.items.length > 0 ? (
              <div className="mt-2 overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.name_en || 'Unknown Product'}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.product?.sku || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.quantity} {item.product?.unit || 'pcs'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCurrency(item.tax_amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.discount_amount > 0 ? formatCurrency(item.discount_amount) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No items found</p>
            )}
          </div>

          {/* Order Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm max-w-md ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(orderData.tax_amount)}</span>
              </div>
              {orderData.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{formatCurrency(orderData.delivery_fee)}</span>
                </div>
              )}
              {orderData.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(orderData.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(orderData.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {orderData.payments && orderData.payments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
              <div className="mt-2 overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderData.payments.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTime(payment.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                          {payment.payment_method}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {payment.reference_number || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {orderData.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{orderData.notes}</p>
              </div>
            </div>
          )}

          {/* Cancellation Details */}
          {orderData.status === 'cancelled' && orderData.metadata?.cancellation && (
            <Alert variant="destructive">
              <div className="text-sm">
                <p className="font-medium">Order Cancelled</p>
                <p><strong>Reason:</strong> {orderData.metadata.cancellation.reason}</p>
                {orderData.metadata.cancellation.notes && (
                  <p><strong>Notes:</strong> {orderData.metadata.cancellation.notes}</p>
                )}
                <p><strong>Cancelled at:</strong> {formatDateTime(orderData.metadata.cancellation.cancelled_at)}</p>
              </div>
            </Alert>
          )}
        </div>
      )}
    </Modal>
  )
}