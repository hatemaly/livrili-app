'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Button, DataTable, Modal, Input, Label, Alert } from '@livrili/ui'
import { api } from '@/lib/trpc'
import { CreateOrderForm } from '@/components/orders/create-order-form'
import { EditOrderForm } from '@/components/orders/edit-order-form'
import { OrderDetailsModal } from '@/components/orders/order-details-modal'
import { StatusUpdateModal } from '@/components/orders/status-update-modal'
import { ConfirmDeleteModal } from '@/components/orders/confirm-delete-modal'
import type { OrderWithDetails, OrderStatus } from '@livrili/database/types'

export default function OrdersPage() {
  usePageTitle('Orders - Livrili Admin Portal')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>()
  const [paymentFilter, setPaymentFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [bulkStatusUpdate, setBulkStatusUpdate] = useState(false)

  const limit = 20
  const offset = currentPage * limit

  // Fetch orders with filters
  const { data: ordersData, isLoading, refetch } = api.orders.getAll.useQuery({
    status: statusFilter || undefined,
    payment_method: paymentFilter as 'cash' | 'credit' || undefined,
    date_from: dateFromFilter || undefined,
    date_to: dateToFilter || undefined,
    search: searchQuery || undefined,
    limit,
    offset,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // Mutations
  const createMutation = api.orders.create.useMutation()
  const updateMutation = api.orders.update.useMutation()
  const updateStatusMutation = api.orders.updateStatus.useMutation()
  const bulkUpdateStatusMutation = api.orders.bulkUpdateStatus.useMutation()
  const cancelMutation = api.orders.cancel.useMutation()

  const orders = ordersData?.items || []
  const totalOrders = ordersData?.total || 0
  const totalPages = Math.ceil(totalOrders / limit)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCreateOrder = async (orderData: any) => {
    try {
      await createMutation.mutateAsync(orderData)
      setShowCreateModal(false)
      refetch()
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  const handleEditOrder = async (orderData: any) => {
    if (!selectedOrder) return
    
    try {
      await updateMutation.mutateAsync({
        id: selectedOrder.id,
        data: orderData,
      })
      setShowEditModal(false)
      setSelectedOrder(null)
      refetch()
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const handleStatusUpdate = async (status: OrderStatus, notes?: string) => {
    if (bulkStatusUpdate && selectedOrders.length > 0) {
      try {
        await bulkUpdateStatusMutation.mutateAsync({
          order_ids: selectedOrders,
          status,
          notes,
        })
        setSelectedOrders([])
        setBulkStatusUpdate(false)
        setShowStatusModal(false)
        refetch()
      } catch (error) {
        console.error('Failed to bulk update status:', error)
      }
    } else if (selectedOrder) {
      try {
        await updateStatusMutation.mutateAsync({
          id: selectedOrder.id,
          status,
          notes,
        })
        setSelectedOrder(null)
        setShowStatusModal(false)
        refetch()
      } catch (error) {
        console.error('Failed to update status:', error)
      }
    }
  }

  const handleCancelOrder = async (reason: string, notes?: string) => {
    if (!selectedOrder) return
    
    try {
      await cancelMutation.mutateAsync({
        id: selectedOrder.id,
        reason,
        notes,
      })
      setSelectedOrder(null)
      setShowDeleteModal(false)
      refetch()
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  const handleViewDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const handleEditClick = (order: OrderWithDetails) => {
    if (order.status !== 'pending') {
      alert('Only pending orders can be edited')
      return
    }
    setSelectedOrder(order)
    setShowEditModal(true)
  }

  const handleStatusClick = (order: OrderWithDetails) => {
    setSelectedOrder(order)
    setBulkStatusUpdate(false)
    setShowStatusModal(true)
  }

  const handleCancelClick = (order: OrderWithDetails) => {
    if (['delivered', 'cancelled'].includes(order.status)) {
      alert('This order cannot be cancelled')
      return
    }
    setSelectedOrder(order)
    setShowDeleteModal(true)
  }

  const handleBulkStatusUpdate = () => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to update')
      return
    }
    setBulkStatusUpdate(true)
    setShowStatusModal(true)
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(order => order.id))
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setPaymentFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setCurrentPage(0)
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedOrders.length === orders.length && orders.length > 0}
          onChange={handleSelectAll}
          className="rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
      ),
      accessor: (order: OrderWithDetails) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(order.id)}
          onChange={() => handleSelectOrder(order.id)}
          className="rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
      ),
      className: 'w-12',
    },
    {
      key: 'orderNumber',
      header: 'Order #',
      accessor: (order: OrderWithDetails) => (
        <div>
          <button
            onClick={() => handleViewDetails(order)}
            className="font-medium text-primary hover:text-primary-dark"
          >
            {order.order_number}
          </button>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'retailer',
      header: 'Retailer',
      accessor: (order: OrderWithDetails) => (
        <div>
          <p className="font-medium text-gray-900">{order.retailer?.business_name || 'Unknown'}</p>
          <p className="text-sm text-gray-500">{order.retailer?.city || ''}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      accessor: (order: OrderWithDetails) => (
        <div className="text-sm text-gray-900">
          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      accessor: (order: OrderWithDetails) => (
        <div className="text-right">
          <p className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</p>
        </div>
      ),
      className: 'text-right',
    },
    {
      key: 'paymentMethod',
      header: 'Payment',
      accessor: (order: OrderWithDetails) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
          {order.payment_method}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (order: OrderWithDetails) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          confirmed: 'bg-blue-100 text-blue-800 border-blue-200', 
          processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          shipped: 'bg-purple-100 text-purple-800 border-purple-200',
          delivered: 'bg-green-100 text-green-800 border-green-200',
          cancelled: 'bg-red-100 text-red-800 border-red-200',
        }

        return (
          <button
            onClick={() => handleStatusClick(order)}
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
              statusColors[order.status as keyof typeof statusColors] || statusColors.pending
            } hover:opacity-75 transition-opacity`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </button>
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (order: OrderWithDetails) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(order)}
            className="text-xs px-2 py-1"
          >
            View
          </Button>
          {order.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditClick(order)}
              className="text-xs px-2 py-1"
            >
              Edit
            </Button>
          )}
          {!['delivered', 'cancelled'].includes(order.status) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancelClick(order)}
              className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          {selectedOrders.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkStatusUpdate}
              disabled={bulkUpdateStatusMutation.isLoading}
            >
              Update Status ({selectedOrders.length})
            </Button>
          )}
          <Button
            onClick={() => setShowCreateModal(true)}
            disabled={createMutation.isLoading}
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Order number, retailer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <Label htmlFor="payment">Payment</Label>
            <select
              id="payment"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="">All Payment</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div>
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {offset + 1} to {Math.min(offset + limit, totalOrders)} of {totalOrders} orders
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Loading and Error States */}
      {createMutation.error && (
        <Alert variant="destructive">
          Failed to create order: {createMutation.error.message}
        </Alert>
      )}
      {updateMutation.error && (
        <Alert variant="destructive">
          Failed to update order: {updateMutation.error.message}
        </Alert>
      )}
      {updateStatusMutation.error && (
        <Alert variant="destructive">
          Failed to update status: {updateStatusMutation.error.message}
        </Alert>
      )}
      {cancelMutation.error && (
        <Alert variant="destructive">
          Failed to cancel order: {cancelMutation.error.message}
        </Alert>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={orders}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="No orders found. Try adjusting your filters or create a new order."
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Order"
          size="xl"
        >
          <CreateOrderForm
            onSubmit={handleCreateOrder}
            onCancel={() => setShowCreateModal(false)}
            isLoading={createMutation.isLoading}
          />
        </Modal>
      )}

      {showEditModal && selectedOrder && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Order"
          size="xl"
        >
          <EditOrderForm
            order={selectedOrder}
            onSubmit={handleEditOrder}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedOrder(null)
            }}
            isLoading={updateMutation.isLoading}
          />
        </Modal>
      )}

      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedOrder(null)
          }}
        />
      )}

      {showStatusModal && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false)
            setSelectedOrder(null)
            setBulkStatusUpdate(false)
          }}
          onUpdate={handleStatusUpdate}
          currentStatus={selectedOrder?.status}
          isBulk={bulkStatusUpdate}
          selectedCount={selectedOrders.length}
          isLoading={updateStatusMutation.isLoading || bulkUpdateStatusMutation.isLoading}
        />
      )}

      {showDeleteModal && selectedOrder && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedOrder(null)
          }}
          onConfirm={handleCancelOrder}
          order={selectedOrder}
          isLoading={cancelMutation.isLoading}
        />
      )}
    </div>
  )
}