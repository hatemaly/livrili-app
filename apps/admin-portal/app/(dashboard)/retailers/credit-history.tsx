'use client'

import { useState } from 'react'
import { Button, Modal } from '@livrili/ui'
import { api } from '@/lib/trpc'

interface CreditHistoryEntry {
  id: string
  retailer_id: string
  old_limit: number
  new_limit: number
  changed_by: string
  reason?: string
  created_at: string
}

interface CreditHistoryProps {
  retailerId: string
  isOpen: boolean
  onClose: () => void
}

export function CreditHistory({ retailerId, isOpen, onClose }: CreditHistoryProps) {
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    new_limit: 0,
    reason: '',
  })

  // Note: This would need to be implemented in the API
  const { data: history, isLoading, refetch } = api.retailers.getCreditHistory?.useQuery(
    retailerId,
    { enabled: isOpen }
  ) || { data: [], isLoading: false, refetch: () => {} }

  const updateCreditMutation = api.retailers.updateCreditLimit.useMutation({
    onSuccess: () => {
      refetch()
      setIsAddEntryOpen(false)
      setNewEntry({ new_limit: 0, reason: '' })
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()
    updateCreditMutation.mutate({
      id: retailerId,
      credit_limit: newEntry.new_limit,
      // Note: reason would need to be added to the API
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Credit Limit History" size="lg">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            View and manage credit limit changes for this retailer
          </p>
          <Button onClick={() => setIsAddEntryOpen(true)} size="sm">
            Update Credit Limit
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((entry: CreditHistoryEntry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {formatCurrency(entry.old_limit)} → {formatCurrency(entry.new_limit)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        entry.new_limit > entry.old_limit
                          ? 'bg-green-100 text-green-800'
                          : entry.new_limit < entry.old_limit
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.new_limit > entry.old_limit
                          ? '+' + formatCurrency(entry.new_limit - entry.old_limit)
                          : entry.new_limit < entry.old_limit
                          ? formatCurrency(entry.new_limit - entry.old_limit)
                          : 'No change'
                        }
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Changed by {entry.changed_by} on {formatDate(entry.created_at)}
                    </p>
                    {entry.reason && (
                      <p className="text-sm text-gray-700 mt-1">{entry.reason}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No credit limit history found</p>
            <Button className="mt-4" onClick={() => setIsAddEntryOpen(true)}>
              Set Initial Credit Limit
            </Button>
          </div>
        )}

        {/* Add Entry Modal */}
        <Modal
          isOpen={isAddEntryOpen}
          onClose={() => setIsAddEntryOpen(false)}
          title="Update Credit Limit"
          size="sm"
        >
          <form onSubmit={handleAddEntry}>
            <div className="space-y-4">
              <div>
                <label htmlFor="new_limit" className="block text-sm font-medium text-gray-700">
                  New Credit Limit (DZD)
                </label>
                <input
                  type="number"
                  id="new_limit"
                  value={newEntry.new_limit}
                  onChange={(e) => setNewEntry({ ...newEntry, new_limit: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason for Change (Optional)
                </label>
                <textarea
                  id="reason"
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Explain why the credit limit is being changed..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddEntryOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateCreditMutation.isPending}>
                {updateCreditMutation.isPending ? 'Updating...' : 'Update Credit Limit'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Modal>
  )
}