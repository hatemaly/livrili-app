'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Button, DataTable, Modal } from '@livrili/ui'
import { api } from '@/lib/trpc'
import Link from 'next/link'
import { RetailerForm } from './retailer-form'
import type { Retailer, RetailerStatus, BusinessType, CreditStatus } from './types'

export default function RetailersPage() {
  usePageTitle('Retailers - Livrili Admin Portal')
  const [statusFilter, setStatusFilter] = useState<RetailerStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [businessTypeFilter, setBusinessTypeFilter] = useState<BusinessType | ''>('')
  const [creditStatusFilter, setCreditStatusFilter] = useState<'good' | 'overlimit' | 'nocredit' | ''>('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data, isLoading, refetch } = api.retailers.list.useQuery({
    status: statusFilter as any || undefined,
    search: searchQuery || undefined,
  })

  const updateStatusMutation = api.retailers.updateStatus.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
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
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusClasses[status as keyof typeof statusClasses] || statusClasses.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getCreditStatus = (retailer: Retailer): CreditStatus => {
    const creditLimit = retailer.credit_limit || 0
    const currentBalance = retailer.current_balance || 0
    const availableCredit = creditLimit - currentBalance
    
    if (creditLimit === 0) {
      return { status: 'No Credit', color: 'text-gray-600' }
    }
    if (currentBalance > creditLimit) {
      return { status: 'Over Limit', color: 'text-red-600' }
    }
    if (availableCredit < creditLimit * 0.2) {
      return { status: 'Low Credit', color: 'text-yellow-600' }
    }
    return { status: 'Good Standing', color: 'text-green-600' }
  }

  // Filter data based on additional filters
  const filteredData = data?.items?.filter(retailer => {
    if (businessTypeFilter && retailer.business_type !== businessTypeFilter) {
      return false
    }
    
    if (creditStatusFilter) {
      const creditStatus = getCreditStatus(retailer)
      const statusMap = {
        good: 'Good Standing',
        overlimit: 'Over Limit',
        nocredit: 'No Credit'
      }
      if (creditStatus.status !== statusMap[creditStatusFilter as keyof typeof statusMap]) {
        return false
      }
    }
    
    return true
  }) || []

  const columns = [
    {
      key: 'business',
      header: 'Business',
      accessor: (retailer: Retailer) => (
        <div>
          <p className="font-medium text-gray-900">{retailer.business_name}</p>
          <p className="text-sm text-gray-500">{retailer.email || 'No email'}</p>
          <p className="text-xs text-gray-400">{retailer.business_type || 'Unspecified'}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      accessor: (retailer: Retailer) => (
        <div>
          <p className="text-sm">{retailer.phone || 'No phone'}</p>
          <p className="text-sm text-gray-500">{retailer.city || 'No city'}</p>
          <p className="text-xs text-gray-400">
            Tax ID: {retailer.tax_number || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      key: 'credit',
      header: 'Credit Info',
      accessor: (retailer: Retailer) => {
        const creditStatus = getCreditStatus(retailer)
        return (
          <div>
            <p className="text-sm">
              Limit: {formatCurrency(retailer.credit_limit || 0)}
            </p>
            <p className="text-sm text-gray-500">
              Balance: {formatCurrency(retailer.current_balance || 0)}
            </p>
            <p className={`text-xs font-medium ${creditStatus.color}`}>
              {creditStatus.status}
            </p>
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (retailer: Retailer) => getStatusBadge(retailer.status),
    },
    {
      key: 'created',
      header: 'Created',
      accessor: (retailer: Retailer) => 
        new Date(retailer.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (retailer: Retailer) => (
        <div className="flex gap-1 flex-wrap">
          <Link href={`/retailers/${retailer.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRetailer(retailer)
              setIsEditModalOpen(true)
            }}
          >
            Edit
          </Button>
          {retailer.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => updateStatusMutation.mutate({
                  id: retailer.id,
                  status: 'active',
                })}
                disabled={updateStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
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
            </>
          )}
          {retailer.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatusMutation.mutate({
                id: retailer.id,
                status: 'suspended',
              })}
              disabled={updateStatusMutation.isPending}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              Suspend
            </Button>
          )}
          {retailer.status === 'suspended' && (
            <Button
              size="sm"
              onClick={() => updateStatusMutation.mutate({
                id: retailer.id,
                status: 'active',
              })}
              disabled={updateStatusMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Retailers</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage retailer accounts and approvals
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, phone, tax ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add New Retailer
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="">All Business Types</option>
            <option value="grocery">Grocery Store</option>
            <option value="supermarket">Supermarket</option>
            <option value="convenience">Convenience Store</option>
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="other">Other</option>
          </select>
          
          <select
            value={creditStatusFilter}
            onChange={(e) => setCreditStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="">All Credit Status</option>
            <option value="good">Good Standing</option>
            <option value="overlimit">Over Limit</option>
            <option value="nocredit">No Credit</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="No retailers found."
        />
      </div>

      {data && data.total > data.limit && (
        <div className="mt-4 flex justify-center">
          <p className="text-sm text-gray-600">
            Showing {filteredData.length} of {data.total} retailers
          </p>
        </div>
      )}
      
      {/* Add Retailer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Retailer"
        size="lg"
      >
        <RetailerForm
          onSuccess={() => {
            setIsAddModalOpen(false)
            refetch()
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Retailer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRetailer(null)
        }}
        title="Edit Retailer"
        size="lg"
      >
        {selectedRetailer && (
          <RetailerForm
            retailer={selectedRetailer}
            onSuccess={() => {
              setIsEditModalOpen(false)
              setSelectedRetailer(null)
              refetch()
            }}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedRetailer(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}