'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  AlertTriangle,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  TrendingDown,
  Download
} from 'lucide-react'
import { format } from 'date-fns'

interface OverduePaymentsViewProps {
  data: {
    overdue_orders: Array<{
      id: string
      order_number: string
      retailer: {
        id: string
        business_name: string
        phone?: string
        email?: string
      }
      total_amount: number
      delivery_date: string
      total_paid: number
      outstanding_amount: number
      days_past_due: number
    }>
    summary: {
      total_overdue_amount: number
      overdue_count: number
      average_days_overdue: number
    }
  }
  preview?: boolean
}

export function OverduePaymentsView({ data, preview = false }: OverduePaymentsViewProps) {
  const [sortBy, setSortBy] = useState<'days_past_due' | 'outstanding_amount' | 'delivery_date'>('days_past_due')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getSeverityBadge = (daysPastDue: number) => {
    if (daysPastDue >= 90) {
      return <Badge variant="destructive">Critical ({daysPastDue}d)</Badge>
    } else if (daysPastDue >= 60) {
      return <Badge variant="destructive" className="bg-orange-500">High ({daysPastDue}d)</Badge>
    } else if (daysPastDue >= 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium ({daysPastDue}d)</Badge>
    } else {
      return <Badge variant="outline">Low ({daysPastDue}d)</Badge>
    }
  }

  const sortedOrders = [...data.overdue_orders].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortBy) {
      case 'days_past_due':
        aValue = a.days_past_due
        bValue = b.days_past_due
        break
      case 'outstanding_amount':
        aValue = a.outstanding_amount
        bValue = b.outstanding_amount
        break
      case 'delivery_date':
        aValue = new Date(a.delivery_date).getTime()
        bValue = new Date(b.delivery_date).getTime()
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const displayOrders = preview ? sortedOrders.slice(0, 5) : sortedOrders

  const exportOverdueReport = () => {
    const csvContent = [
      ['Overdue Payments Report'],
      ['Generated', format(new Date(), 'dd/MM/yyyy HH:mm')],
      [''],
      ['Summary'],
      ['Total Overdue Amount', data.summary.total_overdue_amount.toString()],
      ['Overdue Count', data.summary.overdue_count.toString()],
      ['Average Days Overdue', data.summary.average_days_overdue.toFixed(1)],
      [''],
      ['Order Number', 'Retailer', 'Phone', 'Email', 'Delivery Date', 'Total Amount', 'Paid', 'Outstanding', 'Days Past Due'],
      ...data.overdue_orders.map(order => [
        order.order_number,
        order.retailer.business_name,
        order.retailer.phone || '',
        order.retailer.email || '',
        format(new Date(order.delivery_date), 'dd/MM/yyyy'),
        order.total_amount.toString(),
        order.total_paid.toString(),
        order.outstanding_amount.toString(),
        order.days_past_due.toString()
      ])
    ].map(row => row.join(',')).join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `overdue-payments-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (data.overdue_orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-green-900 mb-2">No Overdue Payments</h3>
        <p className="text-green-700">All payments are current. Great job!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {!preview && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.summary.total_overdue_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.summary.overdue_count} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Days Overdue</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {data.summary.average_days_overdue.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                days past due
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  (data.overdue_orders.reduce((sum, order) => sum + order.total_paid, 0) /
                  data.overdue_orders.reduce((sum, order) => sum + order.total_amount, 0)) * 100
                ).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                of overdue orders
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      {!preview && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'days_past_due' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (sortBy === 'days_past_due') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy('days_past_due')
                  setSortOrder('desc')
                }
              }}
            >
              Sort by Days Overdue {sortBy === 'days_past_due' && (sortOrder === 'desc' ? '↓' : '↑')}
            </Button>
            <Button
              variant={sortBy === 'outstanding_amount' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (sortBy === 'outstanding_amount') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy('outstanding_amount')
                  setSortOrder('desc')
                }
              }}
            >
              Sort by Amount {sortBy === 'outstanding_amount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </Button>
          </div>

          <Button onClick={exportOverdueReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      )}

      {/* Overdue Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Retailer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Badge variant="outline">{order.order_number}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.retailer.business_name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {order.retailer.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        <span>{order.retailer.phone}</span>
                      </div>
                    )}
                    {order.retailer.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{order.retailer.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(order.delivery_date), 'dd/MM/yyyy')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(order.total_amount)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(order.total_paid)}
                </TableCell>
                <TableCell className="text-right font-medium text-red-600">
                  {formatCurrency(order.outstanding_amount)}
                </TableCell>
                <TableCell>
                  {getSeverityBadge(order.days_past_due)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {order.retailer.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:${order.retailer.phone}`)}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                    )}
                    {order.retailer.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`mailto:${order.retailer.email}?subject=Overdue Payment - Order ${order.order_number}`)}
                      >
                        <Mail className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Preview footer */}
      {preview && data.overdue_orders.length > 5 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing 5 of {data.overdue_orders.length} overdue orders
        </div>
      )}

      {/* Severity Legend */}
      {!preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Severity Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Low</Badge>
                <span>Less than 30 days</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                <span>30-59 days</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="bg-orange-500">High</Badge>
                <span>60-89 days</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Critical</Badge>
                <span>90+ days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}