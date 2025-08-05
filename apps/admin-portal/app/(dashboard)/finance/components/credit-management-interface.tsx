'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  AlertCircle,
  CreditCard, 
  TrendingUp,
  TrendingDown,
  Edit,
  DollarSign,
  Search
} from 'lucide-react'
import { api } from '@/lib/trpc'
import { toast } from 'sonner'

interface CreditAdjustmentDialogProps {
  retailer: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreditAdjustmentDialog({ retailer, isOpen, onClose, onSuccess }: CreditAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<'credit' | 'debit' | 'credit_limit_change'>('credit')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const adjustBalance = api.payments.updateRetailerBalance.useMutation({
    onSuccess: () => {
      toast.success('Balance updated successfully')
      onSuccess()
      onClose()
      // Reset form
      setAmount('')
      setReason('')
      setNotes('')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update balance')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !reason) {
      toast.error('Please fill in all required fields')
      return
    }

    const adjustmentAmount = parseFloat(amount)
    if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    adjustBalance.mutate({
      retailer_id: retailer.id,
      adjustment_amount: adjustmentAmount,
      adjustment_type: adjustmentType,
      reason,
      notes
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Balance - {retailer?.business_name}</DialogTitle>
          <DialogDescription>
            Current Balance: {formatCurrency(retailer?.current_balance || 0)} |
            Credit Limit: {formatCurrency(retailer?.credit_limit || 0)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adjustmentType">Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select adjustment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Add Credit (Increase Balance)</SelectItem>
                <SelectItem value="debit">Add Debit (Decrease Balance)</SelectItem>
                <SelectItem value="credit_limit_change">Change Credit Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              {adjustmentType === 'credit_limit_change' ? 'New Credit Limit' : 'Amount'}
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              placeholder="e.g., Payment received, Bad debt write-off, Credit limit review"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional additional details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={adjustBalance.isPending}>
              {adjustBalance.isPending ? 'Processing...' : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreditManagementInterface() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null)
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)

  // Fetch retailers with financial data
  const { data: retailersData, isLoading, refetch } = api.retailers.getAll.useQuery({
    status: 'active',
    search: searchTerm,
    limit: 100,
    offset: 0
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const calculateCreditUsed = (creditLimit: number, currentBalance: number) => {
    return Math.max(0, -currentBalance)
  }

  const calculateAvailableCredit = (creditLimit: number, currentBalance: number) => {
    return Math.max(0, creditLimit + currentBalance)
  }

  const calculateUtilization = (creditLimit: number, currentBalance: number) => {
    if (creditLimit <= 0) return 0
    const used = calculateCreditUsed(creditLimit, currentBalance)
    return (used / creditLimit) * 100
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 70) return 'text-orange-600'
    if (utilization >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskBadge = (utilization: number, isOverLimit: boolean) => {
    if (isOverLimit) {
      return <Badge variant="destructive">Over Limit</Badge>
    }
    if (utilization >= 90) {
      return <Badge variant="destructive">High Risk</Badge>
    }
    if (utilization >= 70) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Medium Risk</Badge>
    }
    if (utilization >= 50) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Risk</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Good</Badge>
  }

  const totalStats = retailersData?.items?.reduce(
    (acc, retailer) => {
      acc.totalCreditLimit += retailer.credit_limit
      acc.totalOutstanding += Math.abs(Math.min(0, retailer.current_balance))
      acc.totalCreditUsed += calculateCreditUsed(retailer.credit_limit, retailer.current_balance)
      if (retailer.current_balance < -retailer.credit_limit) {
        acc.overLimitCount++
      }
      return acc
    },
    { totalCreditLimit: 0, totalOutstanding: 0, totalCreditUsed: 0, overLimitCount: 0 }
  ) || { totalCreditLimit: 0, totalOutstanding: 0, totalCreditUsed: 0, overLimitCount: 0 }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Limit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStats.totalCreditLimit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {retailersData?.items?.length || 0} active retailers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStats.totalCreditUsed)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats.totalCreditLimit > 0 
                ? `${((totalStats.totalCreditUsed / totalStats.totalCreditLimit) * 100).toFixed(1)}% utilization`
                : '0% utilization'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStats.totalCreditLimit - totalStats.totalCreditUsed)}
            </div>
            <p className="text-xs text-muted-foreground">
              Remaining capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Limit</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalStats.overLimitCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Retailers over limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search retailers by business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => refetch()} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Retailers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : !retailersData?.items?.length ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No retailers found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Credit Used</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retailersData.items.map((retailer) => {
                    const creditUsed = calculateCreditUsed(retailer.credit_limit, retailer.current_balance)
                    const availableCredit = calculateAvailableCredit(retailer.credit_limit, retailer.current_balance)
                    const utilization = calculateUtilization(retailer.credit_limit, retailer.current_balance)
                    const isOverLimit = retailer.current_balance < -retailer.credit_limit

                    return (
                      <TableRow key={retailer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{retailer.business_name}</p>
                            <p className="text-sm text-muted-foreground">{retailer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={retailer.current_balance < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                            {formatCurrency(retailer.current_balance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(retailer.credit_limit)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(creditUsed)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={availableCredit > 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(availableCredit)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getUtilizationColor(utilization)}>
                            {utilization.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(utilization, isOverLimit)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRetailer(retailer)
                              setAdjustmentDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Adjustment Dialog */}
      <CreditAdjustmentDialog
        retailer={selectedRetailer}
        isOpen={adjustmentDialogOpen}
        onClose={() => {
          setAdjustmentDialogOpen(false)
          setSelectedRetailer(null)
        }}
        onSuccess={() => refetch()}
      />
    </div>
  )
}