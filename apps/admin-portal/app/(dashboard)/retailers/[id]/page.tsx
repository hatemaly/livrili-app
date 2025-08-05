'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../../hooks/use-page-title'
import { useParams, useRouter } from 'next/navigation'
import { Button, Modal } from '@livrili/ui'
import { api } from '@/lib/trpc'
import Link from 'next/link'
import { RetailerForm } from '../retailer-form'
import type { RetailerWithDetails, Document, CreditStatus } from '../types'

export default function RetailerDetailPage() {
  usePageTitle('Retailer Details - Livrili Admin Portal')
  const params = useParams()
  const router = useRouter()
  const retailerId = params.id as string

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const { data: retailer, isLoading, refetch } = api.retailers.getById.useQuery(retailerId)
  const { data: stats } = api.retailers.getStats.useQuery(retailerId)

  const updateStatusMutation = api.retailers.updateStatus.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const updateCreditMutation = api.retailers.updateCreditLimit.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreditModalOpen(false)
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!retailer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Retailer not found</p>
        <Button className="mt-4" onClick={() => router.push('/retailers')}>
          Back to Retailers
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800',
    }

    return (
      <span
        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          statusClasses[status as keyof typeof statusClasses] || statusClasses.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getCreditStatus = (): CreditStatus => {
    const creditLimit = retailer.credit_limit || 0
    const currentBalance = retailer.current_balance || 0
    const availableCredit = creditLimit - currentBalance
    
    if (creditLimit === 0) {
      return { status: 'No Credit', color: 'text-gray-600', bgColor: 'bg-gray-100' }
    }
    if (currentBalance > creditLimit) {
      return { status: 'Over Limit', color: 'text-red-600', bgColor: 'bg-red-50' }
    }
    if (availableCredit < creditLimit * 0.2) {
      return { status: 'Low Credit', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    }
    return { status: 'Good Standing', color: 'text-green-600', bgColor: 'bg-green-50' }
  }

  const creditStatus = getCreditStatus()

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{retailer.business_name}</h1>
            {getStatusBadge(retailer.status)}
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${creditStatus.color} ${creditStatus.bgColor}`}>
              {creditStatus.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Retailer ID: {retailer.id}
          </p>
          <p className="text-sm text-gray-500">
            Created: {formatDate(retailer.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/retailers')}>
            Back
          </Button>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edit
          </Button>
        </div>
      </div>

      {/* Status Actions */}
      {retailer.status === 'pending' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-3">
            This retailer is pending approval. Review their information and documents before approving.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => updateStatusMutation.mutate({
                id: retailer.id,
                status: 'active',
              })}
              disabled={updateStatusMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Retailer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const reason = prompt('Rejection reason:')
                if (reason) {
                  updateStatusMutation.mutate({
                    id: retailer.id,
                    status: 'rejected',
                    rejection_reason: reason,
                  })
                }
              }}
              disabled={updateStatusMutation.isPending}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {retailer.status === 'rejected' && retailer.rejection_reason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Rejection Reason:</strong> {retailer.rejection_reason}
          </p>
        </div>
      )}

      {retailer.status === 'suspended' && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800 mb-3">
            This retailer account is currently suspended.
          </p>
          <Button
            onClick={() => updateStatusMutation.mutate({
              id: retailer.id,
              status: 'active',
            })}
            disabled={updateStatusMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Reactivate Account
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{retailer.business_type || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{retailer.registration_number || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{retailer.tax_number || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(retailer.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              {retailer.approval_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Approval Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(retailer.approval_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {retailer.email ? (
                    <a href={`mailto:${retailer.email}`} className="text-blue-600 hover:text-blue-800">
                      {retailer.email}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {retailer.phone ? (
                    <a href={`tel:${retailer.phone}`} className="text-blue-600 hover:text-blue-800">
                      {retailer.phone}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {[
                    retailer.address,
                    retailer.city,
                    retailer.state,
                    retailer.postal_code
                  ].filter(Boolean).join(', ') || 'Not provided'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Credit Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Credit Information</h2>
              <Button size="sm" variant="outline" onClick={() => setIsCreditModalOpen(true)}>
                Update Limit
              </Button>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Credit Limit</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(retailer.credit_limit || 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Balance</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(retailer.current_balance || 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Available Credit</dt>
                <dd className="mt-1 text-lg font-semibold text-green-600">
                  {formatCurrency(Math.max(0, (retailer.credit_limit || 0) - (retailer.current_balance || 0)))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Documents */}
          {retailer.documents && retailer.documents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {retailer.documents.map((doc: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(doc)
                            setIsDocumentModalOpen(true)
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Associated Users */}
          {retailer.users && retailer.users.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Associated Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {retailer.users.map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-4 py-2 text-sm">{user.full_name || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm font-medium">{user.username}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {user.last_login_at 
                            ? new Date(user.last_login_at).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          {stats && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivered Orders</p>
                  <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalPaid)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {retailer.recentOrders && retailer.recentOrders.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Link href={`/orders?retailer=${retailer.id}`}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {retailer.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                      <p className={`text-xs ${
                        order.status === 'delivered' ? 'text-green-600' :
                        order.status === 'pending' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Payments */}
          {retailer.recentPayments && retailer.recentPayments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
              <div className="space-y-2">
                {retailer.recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{payment.payment_type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                      <p className={`text-xs ${
                        payment.status === 'completed' ? 'text-green-600' :
                        payment.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Retailer"
        size="lg"
      >
        <RetailerForm
          retailer={retailer}
          onSuccess={() => {
            setIsEditModalOpen(false)
            refetch()
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Credit Limit Modal */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title="Update Credit Limit"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const creditLimit = parseFloat(formData.get('credit_limit') as string)
            updateCreditMutation.mutate({
              id: retailer.id,
              credit_limit: creditLimit,
            })
          }}
        >
          <div className="mb-4">
            <label htmlFor="credit_limit" className="block text-sm font-medium text-gray-700">
              New Credit Limit (DZD)
            </label>
            <input
              type="number"
              id="credit_limit"
              name="credit_limit"
              defaultValue={retailer.credit_limit || 0}
              min="0"
              step="1000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsCreditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCreditMutation.isPending}>
              Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Modal */}
      <Modal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false)
          setSelectedDocument(null)
        }}
        title="Document Viewer"
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{selectedDocument.name}</h3>
              <p className="text-sm text-gray-500 capitalize">
                {selectedDocument.type.replace('_', ' ')} • 
                Uploaded {new Date(selectedDocument.uploaded_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex justify-center">
              <a
                href={selectedDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Open Document
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}