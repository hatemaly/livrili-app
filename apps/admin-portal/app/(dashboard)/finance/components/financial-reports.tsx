'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Calendar as CalendarIcon,
  Download,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc'
import { OverduePaymentsView } from './overdue-payments-view'

export function FinancialReports() {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [dateTo, setDateTo] = useState<Date>(new Date())

  // Memoize query parameters to prevent infinite refetching
  const summaryQueryParams = useMemo(() => ({
    date_from: dateFrom.toISOString(),
    date_to: dateTo.toISOString()
  }), [dateFrom, dateTo])

  // Fetch financial summary
  const { data: financialSummary, isLoading: summaryLoading, refetch: refetchSummary } = api.payments.getFinancialSummary.useQuery(summaryQueryParams)

  // Fetch overdue payments
  const { data: overdueData, isLoading: overdueLoading, refetch: refetchOverdue } = api.payments.getOverduePayments.useQuery({
    grace_period_days: 30,
    limit: 100
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const exportFinancialReport = () => {
    if (!financialSummary) return

    const csvContent = [
      ['Financial Summary Report'],
      ['Period', `${format(dateFrom, 'dd/MM/yyyy')} - ${format(dateTo, 'dd/MM/yyyy')}`],
      ['Generated', format(new Date(), 'dd/MM/yyyy HH:mm')],
      [''],
      ['Payment Statistics'],
      ['Total Payments', financialSummary.payment_statistics.total_payments.toString()],
      ['Cash Collected', financialSummary.payment_statistics.total_cash_collected.toString()],
      ['Credit Payments', financialSummary.payment_statistics.total_credit_payments.toString()],
      ['Payment Count', financialSummary.payment_statistics.payment_count.toString()],
      ['Cash Payment Count', financialSummary.payment_statistics.cash_payment_count.toString()],
      ['Credit Payment Count', financialSummary.payment_statistics.credit_payment_count.toString()],
      [''],
      ['Retailer Statistics'],
      ['Total Retailers', financialSummary.retailer_statistics.total_retailers.toString()],
      ['Active Retailers', financialSummary.retailer_statistics.active_retailers.toString()],
      ['Total Credit Limit', financialSummary.retailer_statistics.total_credit_limit.toString()],
      ['Total Outstanding Balance', Math.abs(financialSummary.retailer_statistics.total_outstanding_balance).toString()],
      ['Total Credit Used', financialSummary.retailer_statistics.total_credit_used.toString()]
    ].map(row => row.join(',')).join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const refetchAll = () => {
    refetchSummary()
    refetchOverdue()
  }

  return (
    <div className="space-y-6">
      {/* Date Range and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Financial Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
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
              <label className="text-sm font-medium">To Date</label>
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

            <Button onClick={refetchAll} disabled={summaryLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button onClick={exportFinancialReport} variant="outline" disabled={!financialSummary}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Statistics */}
      {financialSummary && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(financialSummary.payment_statistics.total_payments)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialSummary.payment_statistics.payment_count} payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Collections</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialSummary.payment_statistics.total_cash_collected)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialSummary.payment_statistics.cash_payment_count} cash payments
                </p>
                <p className="text-xs text-green-600">
                  {formatPercentage(
                    financialSummary.payment_statistics.total_payments > 0
                      ? (financialSummary.payment_statistics.total_cash_collected / financialSummary.payment_statistics.total_payments) * 100
                      : 0
                  )} of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(financialSummary.payment_statistics.total_credit_payments)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialSummary.payment_statistics.credit_payment_count} credit payments
                </p>
                <p className="text-xs text-blue-600">
                  {formatPercentage(
                    financialSummary.payment_statistics.total_payments > 0
                      ? (financialSummary.payment_statistics.total_credit_payments / financialSummary.payment_statistics.total_payments) * 100
                      : 0
                  )} of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(Math.abs(financialSummary.retailer_statistics.total_outstanding_balance))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialSummary.retailer_statistics.active_retailers} active retailers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Credit Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Credit Limit</span>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(financialSummary.retailer_statistics.total_credit_limit)}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Credit Used</span>
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(financialSummary.retailer_statistics.total_credit_used)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(
                      financialSummary.retailer_statistics.total_credit_limit > 0
                        ? (financialSummary.retailer_statistics.total_credit_used / financialSummary.retailer_statistics.total_credit_limit) * 100
                        : 0
                    )} utilization
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Available Credit</span>
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      financialSummary.retailer_statistics.total_credit_limit - 
                      financialSummary.retailer_statistics.total_credit_used
                    )}
                  </div>
                </div>
              </div>

              {/* Credit Utilization Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Credit Utilization</span>
                  <span className="text-sm text-muted-foreground">
                    {formatPercentage(
                      financialSummary.retailer_statistics.total_credit_limit > 0
                        ? (financialSummary.retailer_statistics.total_credit_used / financialSummary.retailer_statistics.total_credit_limit) * 100
                        : 0
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      (financialSummary.retailer_statistics.total_credit_used / financialSummary.retailer_statistics.total_credit_limit) * 100 > 80
                        ? 'bg-red-500'
                        : (financialSummary.retailer_statistics.total_credit_used / financialSummary.retailer_statistics.total_credit_limit) * 100 > 60
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (financialSummary.retailer_statistics.total_credit_used / financialSummary.retailer_statistics.total_credit_limit) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Mix Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">By Amount</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm">Cash</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(financialSummary.payment_statistics.total_cash_collected)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-sm">Credit</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(financialSummary.payment_statistics.total_credit_payments)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">By Count</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm">Cash</span>
                      </div>
                      <span className="text-sm font-medium">
                        {financialSummary.payment_statistics.cash_payment_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-sm">Credit</span>
                      </div>
                      <span className="text-sm font-medium">
                        {financialSummary.payment_statistics.credit_payment_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Overdue Payments Section */}
      {overdueData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Overdue Payments
              {overdueData.summary.overdue_count > 0 && (
                <Badge variant="destructive">{overdueData.summary.overdue_count}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OverduePaymentsView data={overdueData} />
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(summaryLoading || overdueLoading) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading financial reports...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}