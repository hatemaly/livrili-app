'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calculator,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar as CalendarIcon,
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc'
import { toast } from 'sonner'

export function ReconciliationTools() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [actualAmount, setActualAmount] = useState('')
  const [discrepancyReason, setDiscrepancyReason] = useState('')
  const [notes, setNotes] = useState('')
  const [showReconciliationForm, setShowReconciliationForm] = useState(false)

  // Fetch users for selection
  const { data: users } = api.users.getAll.useQuery({
    role: undefined, // Get all users who might collect cash
    limit: 100,
    offset: 0
  })

  // Fetch cash collection for selected date and user
  const { data: cashReport, isLoading, refetch } = api.payments.getCashCollectionReport.useQuery({
    date_from: format(selectedDate, 'yyyy-MM-dd') + 'T00:00:00.000Z',
    date_to: format(selectedDate, 'yyyy-MM-dd') + 'T23:59:59.999Z',
    user_id: selectedUser === 'all' ? undefined : selectedUser
  }, {
    enabled: !!selectedDate
  })

  // Reconcile cash mutation
  const reconcileCash = api.payments.reconcileCash.useMutation({
    onSuccess: (data) => {
      if (data.status === 'balanced') {
        toast.success('Cash reconciliation completed - balanced!')
      } else {
        toast.warning(`Cash reconciliation completed with discrepancy: ${formatCurrency(data.discrepancy_amount)}`)
      }
      // Reset form
      setActualAmount('')
      setDiscrepancyReason('')
      setNotes('')
      setShowReconciliationForm(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reconcile cash')
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const expectedAmount = cashReport?.summary.total_amount || 0
  const actualAmountNum = parseFloat(actualAmount) || 0
  const discrepancy = actualAmountNum - expectedAmount
  const hasDiscrepancy = Math.abs(discrepancy) >= 0.01

  const handleReconcile = () => {
    if (selectedUser === 'all') {
      toast.error('Please select a user')
      return
    }

    if (!actualAmount) {
      toast.error('Please enter the actual cash amount')
      return
    }

    if (hasDiscrepancy && !discrepancyReason) {
      toast.error('Please provide a reason for the discrepancy')
      return
    }

    reconcileCash.mutate({
      user_id: selectedUser === 'all' ? undefined : selectedUser,
      date: format(selectedDate, 'yyyy-MM-dd'),
      expected_amount: expectedAmount,
      actual_amount: actualAmountNum,
      discrepancy_reason: hasDiscrepancy ? discrepancyReason : undefined,
      notes: notes || undefined
    })
  }

  return (
    <div className="space-y-6">
      {/* Date and User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Daily Cash Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Reconciliation Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Cash Collector</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users?.items?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={() => refetch()} disabled={isLoading} className="w-full">
                Load Cash Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Collection Summary */}
      {cashReport && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Cash</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(expectedAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {cashReport.summary.payment_count} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collectors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(cashReport.summary.by_user).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">
                {showReconciliationForm ? 'In Progress' : 'Ready to Reconcile'}
              </div>
              <Button
                size="sm"
                onClick={() => setShowReconciliationForm(true)}
                disabled={selectedUser === 'all' || expectedAmount === 0}
                className="mt-2"
              >
                Start Reconciliation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collection by User Breakdown */}
      {cashReport && Object.keys(cashReport.summary.by_user).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Collection Breakdown by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(cashReport.summary.by_user).map(([username, data]) => (
                <div key={username} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{username}</p>
                    <p className="text-sm text-muted-foreground">{data.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(data.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: {formatCurrency(data.amount / data.count)}
                    </p>
                  </div>
                  {selectedUser && selectedUser !== 'all' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(Object.values(users?.items || []).find(u => 
                          (u.full_name || u.username) === username
                        )?.id || '')
                        setShowReconciliationForm(true)
                      }}
                    >
                      Reconcile
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reconciliation Form */}
      {showReconciliationForm && selectedUser && selectedUser !== 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Cash Reconciliation Form
              <Badge variant="outline">
                {selectedUser !== 'all' ? (users?.items?.find(u => u.id === selectedUser)?.full_name || 
                 users?.items?.find(u => u.id === selectedUser)?.username) : 'All Users'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Expected vs Actual */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900">Expected Cash Amount</Label>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(expectedAmount)}</p>
                  <p className="text-sm text-blue-700">From {cashReport?.summary.payment_count} transactions</p>
                </div>

                <div className="space-y-2">
                  <Label>Actual Cash Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={actualAmount}
                    onChange={(e) => setActualAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Discrepancy Alert */}
              {actualAmount && hasDiscrepancy && (
                <div className={`p-4 rounded-lg border ${
                  discrepancy > 0 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${
                      discrepancy > 0 ? 'text-orange-600' : 'text-red-600'
                    }`} />
                    <span className={`font-medium ${
                      discrepancy > 0 ? 'text-orange-900' : 'text-red-900'
                    }`}>
                      Discrepancy Detected: {formatCurrency(Math.abs(discrepancy))} 
                      {discrepancy > 0 ? ' Overage' : ' Shortage'}
                    </span>
                  </div>
                </div>
              )}

              {/* Discrepancy Reason (required if there's a discrepancy) */}
              {hasDiscrepancy && (
                <div className="space-y-2">
                  <Label>Discrepancy Reason *</Label>
                  <Select value={discrepancyReason} onValueChange={setDiscrepancyReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason for discrepancy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counting_error">Counting Error</SelectItem>
                      <SelectItem value="missing_receipt">Missing Receipt</SelectItem>
                      <SelectItem value="extra_payment">Extra Payment Received</SelectItem>
                      <SelectItem value="change_given">Change Given to Customer</SelectItem>
                      <SelectItem value="petty_cash_used">Petty Cash Used</SelectItem>
                      <SelectItem value="deposit_made">Bank Deposit Made</SelectItem>
                      <SelectItem value="other">Other (explain in notes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes about the reconciliation"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={handleReconcile}
                  disabled={reconcileCash.isPending || !actualAmount || (hasDiscrepancy && !discrepancyReason)}
                  className="flex-1"
                >
                  {reconcileCash.isPending ? 'Processing...' : 'Complete Reconciliation'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowReconciliationForm(false)
                    setActualAmount('')
                    setDiscrepancyReason('')
                    setNotes('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {!isLoading && cashReport && cashReport.summary.payment_count === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No Cash Collections Found</p>
              <p className="text-muted-foreground">
                No cash payments were recorded for {format(selectedDate, 'PPP')}
                {selectedUser && selectedUser !== 'all' && ` by ${users?.items?.find(u => u.id === selectedUser)?.full_name || 'selected user'}`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}