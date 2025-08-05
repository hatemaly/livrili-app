/**
 * Orders API Usage Examples
 * 
 * This file demonstrates how to use the orders router endpoints
 * in your frontend applications (admin portal, retail portal).
 */

import { type AppRouter } from '../src/root'
import { createTRPCReact } from '@trpc/react-query'

// Create tRPC React hooks
const trpc = createTRPCReact<AppRouter>()

// ============================================================================
// ADMIN PORTAL USAGE EXAMPLES
// ============================================================================

/**
 * Orders List Page Component
 */
export function OrdersListPage() {
  // Get orders with filtering
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = trpc.orders.getAll.useQuery({
    status: 'pending',
    limit: 20,
    offset: 0,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // Get order statistics for dashboard
  const { data: stats } = trpc.orders.getOrderStats.useQuery({
    date_from: '2024-01-01',
    date_to: '2024-12-31',
  })

  if (isLoading) return <div>Loading orders...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Orders ({ordersData?.total})</h1>
      
      {/* Order Statistics Cards */}
      {stats && (
        <div className="stats-cards">
          <div>Total Orders: {stats.totalOrders}</div>
          <div>Total Revenue: ${stats.totalRevenue}</div>
          <div>Pending: {stats.statusBreakdown.pending}</div>
          <div>Delivered: {stats.statusBreakdown.delivered}</div>
        </div>
      )}

      {/* Orders Table */}
      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Retailer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ordersData?.items.map((order) => (
            <tr key={order.id}>
              <td>{order.order_number}</td>
              <td>{order.retailers?.business_name}</td>
              <td>${order.total_amount}</td>
              <td>{order.status}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => window.location.href = `/orders/${order.id}`}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Order Details Page Component
 */
export function OrderDetailsPage({ orderId }: { orderId: string }) {
  // Get order details
  const { data: order, isLoading } = trpc.orders.getById.useQuery(orderId)

  // Status update mutation
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      // Refetch order data after successful update
      trpc.orders.getById.invalidate(orderId)
      alert('Order status updated successfully!')
    },
    onError: (error) => {
      alert(`Error updating status: ${error.message}`)
    },
  })

  // Cancel order mutation
  const cancelOrderMutation = trpc.orders.cancel.useMutation({
    onSuccess: () => {
      trpc.orders.getById.invalidate(orderId)
      alert('Order cancelled successfully!')
    },
    onError: (error) => {
      alert(`Error cancelling order: ${error.message}`)
    },
  })

  const handleStatusUpdate = (newStatus: string) => {
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus as any,
      notes: `Status updated to ${newStatus} by admin`,
    })
  }

  const handleCancelOrder = () => {
    const reason = prompt('Please provide cancellation reason:')
    if (reason) {
      cancelOrderMutation.mutate({
        id: orderId,
        reason,
        notes: 'Cancelled by admin',
      })
    }
  }

  if (isLoading) return <div>Loading order details...</div>
  if (!order) return <div>Order not found</div>

  return (
    <div>
      <h1>Order {order.order_number}</h1>
      
      {/* Order Summary */}
      <div className="order-summary">
        <h2>Order Information</h2>
        <p>Status: {order.status}</p>
        <p>Total: ${order.total_amount}</p>
        <p>Payment Method: {order.payment_method}</p>
        <p>Delivery Address: {order.delivery_address}</p>
        <p>Created: {new Date(order.created_at).toLocaleString()}</p>
      </div>

      {/* Retailer Information */}
      <div className="retailer-info">
        <h2>Retailer</h2>
        <p>Business: {order.retailers?.business_name}</p>
        <p>Phone: {order.retailers?.phone}</p>
        <p>Email: {order.retailers?.email}</p>
      </div>

      {/* Order Items */}
      <div className="order-items">
        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td>{item.products?.name_en}</td>
                <td>{item.quantity}</td>
                <td>${item.unit_price}</td>
                <td>${item.total_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="order-actions">
        <h2>Actions</h2>
        {order.status === 'pending' && (
          <button onClick={() => handleStatusUpdate('confirmed')}>
            Confirm Order
          </button>
        )}
        {order.status === 'confirmed' && (
          <button onClick={() => handleStatusUpdate('processing')}>
            Start Processing
          </button>
        )}
        {order.status === 'processing' && (
          <button onClick={() => handleStatusUpdate('shipped')}>
            Mark as Shipped
          </button>
        )}
        {order.status === 'shipped' && (
          <button onClick={() => handleStatusUpdate('delivered')}>
            Mark as Delivered
          </button>
        )}
        {!['delivered', 'cancelled'].includes(order.status) && (
          <button onClick={handleCancelOrder} className="cancel-btn">
            Cancel Order
          </button>
        )}
      </div>

      {/* Payment History */}
      {order.payments && order.payments.length > 0 && (
        <div className="payment-history">
          <h2>Payment History</h2>
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {order.payments.map((payment) => (
                <tr key={payment.id}>
                  <td>${payment.amount}</td>
                  <td>{payment.payment_method}</td>
                  <td>{payment.status}</td>
                  <td>{new Date(payment.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/**
 * Create Order Page Component
 */
export function CreateOrderPage() {
  const [selectedRetailer, setSelectedRetailer] = useState<string>('')
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [deliveryAddress, setDeliveryAddress] = useState('')

  // Get retailers for selection
  const { data: retailers } = trpc.retailers.list.useQuery({
    status: 'active',
    limit: 100,
  })

  // Get products for selection
  const { data: products } = trpc.products.list.useQuery({
    includeInactive: false,
    limit: 100,
  })

  // Create order mutation
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      alert(`Order ${order.order_number} created successfully!`)
      // Redirect to order details
      window.location.href = `/orders/${order.id}`
    },
    onError: (error) => {
      alert(`Error creating order: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRetailer || orderItems.length === 0) {
      alert('Please select retailer and add items')
      return
    }

    createOrderMutation.mutate({
      retailer_id: selectedRetailer,
      items: orderItems,
      delivery_address: deliveryAddress,
      payment_method: 'cash',
    })
  }

  const addItem = (productId: string, unitPrice: number) => {
    setOrderItems([
      ...orderItems,
      {
        product_id: productId,
        quantity: 1,
        unit_price: unitPrice,
      },
    ])
  }

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    const updated = [...orderItems]
    updated[index].quantity = quantity
    setOrderItems(updated)
  }

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  return (
    <div>
      <h1>Create New Order</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Retailer Selection */}
        <div>
          <label>Select Retailer:</label>
          <select
            value={selectedRetailer}
            onChange={(e) => setSelectedRetailer(e.target.value)}
            required
          >
            <option value="">Choose retailer...</option>
            {retailers?.items.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>
                {retailer.business_name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection */}
        <div>
          <h3>Add Products</h3>
          <div className="product-grid">
            {products?.items.map((product) => (
              <div key={product.id} className="product-card">
                <h4>{product.name_en}</h4>
                <p>Price: ${product.base_price}</p>
                <p>Stock: {product.stock_quantity}</p>
                <button
                  type="button"
                  onClick={() => addItem(product.id, product.base_price)}
                  disabled={product.stock_quantity === 0}
                >
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <div>
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => {
                  const product = products?.items.find(p => p.id === item.product_id)
                  return (
                    <tr key={index}>
                      <td>{product?.name_en}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={product?.stock_quantity || 1}
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                        />
                      </td>
                      <td>${item.unit_price}</td>
                      <td>${item.quantity * item.unit_price}</td>
                      <td>
                        <button type="button" onClick={() => removeItem(index)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total:</td>
                  <td>${totalAmount}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Delivery Information */}
        <div>
          <label>Delivery Address:</label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
            rows={3}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createOrderMutation.isLoading || orderItems.length === 0}
        >
          {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  )
}

/**
 * Bulk Operations Component
 */
export function BulkOrderOperations({ selectedOrderIds }: { selectedOrderIds: string[] }) {
  const [bulkStatus, setBulkStatus] = useState<string>('')

  // Bulk status update mutation
  const bulkUpdateMutation = trpc.orders.bulkUpdateStatus.useMutation({
    onSuccess: (result) => {
      alert(`Successfully updated ${result.updated_count} orders`)
      // Refresh orders list
      trpc.orders.getAll.invalidate()
    },
    onError: (error) => {
      alert(`Error updating orders: ${error.message}`)
    },
  })

  const handleBulkUpdate = () => {
    if (!bulkStatus || selectedOrderIds.length === 0) {
      alert('Please select status and orders')
      return
    }

    bulkUpdateMutation.mutate({
      order_ids: selectedOrderIds,
      status: bulkStatus as any,
      notes: `Bulk status update to ${bulkStatus}`,
    })
  }

  return (
    <div className="bulk-operations">
      <h3>Bulk Operations ({selectedOrderIds.length} selected)</h3>
      
      <div>
        <select
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
        >
          <option value="">Select new status...</option>
          <option value="confirmed">Confirm Orders</option>
          <option value="processing">Start Processing</option>
          <option value="shipped">Mark as Shipped</option>
          <option value="delivered">Mark as Delivered</option>
        </select>
        
        <button
          onClick={handleBulkUpdate}
          disabled={!bulkStatus || selectedOrderIds.length === 0 || bulkUpdateMutation.isLoading}
        >
          {bulkUpdateMutation.isLoading ? 'Updating...' : 'Update Selected Orders'}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// RETAIL PORTAL USAGE EXAMPLES
// ============================================================================

/**
 * Retailer Orders Page Component (for retail portal)
 */
export function RetailerOrdersPage() {
  // Get retailer's orders
  const {
    data: ordersData,
    isLoading,
    error,
  } = trpc.orders.getRetailerOrders.useQuery({
    limit: 20,
    offset: 0,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  if (isLoading) return <div>Loading your orders...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>My Orders ({ordersData?.total})</h1>
      
      {/* Orders List */}
      <div className="orders-list">
        {ordersData?.items.map((order) => (
          <div key={order.id} className="order-card">
            <h3>Order {order.order_number}</h3>
            <p>Status: <span className={`status-${order.status}`}>{order.status}</span></p>
            <p>Total: ${order.total_amount}</p>
            <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <button onClick={() => window.location.href = `/my-orders/${order.id}`}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// UTILITY HOOKS AND HELPERS
// ============================================================================

/**
 * Custom hook for order status management
 */
export function useOrderStatus(orderId: string) {
  const utils = trpc.useContext()
  
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      // Invalidate and refetch order data
      utils.orders.getById.invalidate(orderId)
    },
  })

  const cancelOrderMutation = trpc.orders.cancel.useMutation({
    onSuccess: () => {
      utils.orders.getById.invalidate(orderId)
    },
  })

  return {
    updateStatus: updateStatusMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    isUpdating: updateStatusMutation.isLoading,
    isCancelling: cancelOrderMutation.isLoading,
  }
}

/**
 * Custom hook for order statistics
 */
export function useOrderStats(filters?: {
  date_from?: string
  date_to?: string
  retailer_id?: string
}) {
  return trpc.orders.getOrderStats.useQuery(filters, {
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

/**
 * Order status color utility
 */
export function getOrderStatusColor(status: string) {
  const colors = {
    pending: '#fbbf24',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#06b6d4',
    delivered: '#10b981',
    cancelled: '#ef4444',
  }
  return colors[status as keyof typeof colors] || '#6b7280'
}