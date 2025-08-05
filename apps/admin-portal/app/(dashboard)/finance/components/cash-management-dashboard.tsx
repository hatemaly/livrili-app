'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  DollarSign, 
  Users, 
  TrendingUp,
  Calendar as CalendarIcon,
  Download,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc'

export function CashManagementDashboard() {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [dateTo, setDateTo] = useState<Date>(new Date())
  const [selectedUser, setSelectedUser] = useState<string>('all')

  // Memoize query parameters to prevent infinite refetching
  const queryParams = useMemo(() => ({
    date_from: dateFrom.toISOString(),
    date_to: dateTo.toISOString(),
    user_id: selectedUser === 'all' ? undefined : selectedUser
  }), [dateFrom, dateTo, selectedUser])

  // Fetch cash collection report
  const { data: cashReport, isLoading, refetch } = api.payments.getCashCollectionReport.useQuery(queryParams)

  // Fetch users for filter
  const { data: users } = api.users.getAll.useQuery({
    role: 'admin',
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
  }

  const exportToCsv = () => {
    if (!cashReport?.payments) return

    const csvContent = [
      ['Date', 'Amount', 'Retailer', 'Order Number', 'Collected By', 'Reference'],
      ...cashReport.payments.map(payment => [
        formatDate(payment.collected_at || payment.created_at),
        payment.amount.toString(),
        payment.retailer?.business_name || '',
        payment.order?.order_number || '',
        payment.collected_by_user?.full_name || payment.collected_by_user?.username || '',
        payment.reference_number || ''
      ])
    ].map(row => row.join(',')).join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cash-collection-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Collection Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] pl-3 text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    {dateFrom ? (
                      format(dateFrom, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && setDateFrom(date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] pl-3 text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    {dateTo ? (
                      format(dateTo, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && setDateTo(date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Collected By</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All users" />
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

            <Button onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button onClick={exportToCsv} variant="outline" disabled={!cashReport?.payments?.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {cashReport && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cash Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(cashReport.summary.total_amount)}
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
                Active collectors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Per Transaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  cashReport.summary.payment_count > 0 
                    ? cashReport.summary.total_amount / cashReport.summary.payment_count 
                    : 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Per collection
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collection by User */}
      {cashReport && Object.keys(cashReport.summary.by_user).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Collection Summary by User</CardTitle>
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
                    <p className="font-bold text-lg">{formatCurrency(data.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: {formatCurrency(data.amount / data.count)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Transactions */}
      {cashReport && (
        <Card>
          <CardHeader>
            <CardTitle>Cash Collection Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : cashReport.payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No cash collections found for the selected period.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Retailer</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Collected By</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashReport.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {formatDate(payment.collected_at || payment.created_at)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.retailer?.business_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {payment.order?.order_number ? (
                            <Badge variant="outline">{payment.order.order_number}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Credit Payment</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.collected_by_user?.full_name || payment.collected_by_user?.username || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {payment.reference_number || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}