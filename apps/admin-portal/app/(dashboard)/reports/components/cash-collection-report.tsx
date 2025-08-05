'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  CalendarIcon,
  Download,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export function CashCollectionReport() {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [dateTo, setDateTo] = useState<Date>(new Date())
  const [driverId, setDriverId] = useState<string>('all')
  const [routeId, setRouteId] = useState<string>('')
  const [reconciliationStatus, setReconciliationStatus] = useState<'pending' | 'reconciled' | 'discrepancy' | 'all'>('all')

  // Fetch cash collection report data
  const { data: cashReport, isLoading, refetch } = api.reports.getCashCollectionReport.useQuery({
    date_from: dateFrom.toISOString(),
    date_to: dateTo.toISOString(),
    driver_id: driverId === 'all' ? undefined : driverId,
    route_id: routeId || undefined,
    reconciliation_status: reconciliationStatus === 'all' ? undefined : reconciliationStatus
  })

  // Fetch drivers for filter
  const { data: drivers } = api.users.getUsers.useQuery({
    role: 'driver'
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const exportReport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      const result = await api.reports.exportReport.mutate({
        report_type: 'cash_collection',
        format,
        config: {
          date_from: dateFrom.toISOString(),
          date_to: dateTo.toISOString(),
          driver_id: driverId === 'all' ? undefined : driverId,
          route_id: routeId || undefined,
          reconciliation_status: reconciliationStatus === 'all' ? undefined : reconciliationStatus
        }
      })

      window.open(result.download_url, '_blank')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reconciled':
        return <Badge className="bg-green-100 text-green-800">Reconciled</Badge>
      case 'discrepancy':
        return <Badge className="bg-red-100 text-red-800">Discrepancy</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const calculateCollectionRate = (collected: number, expected: number) => {
    if (expected === 0) return 100
    return ((collected / expected) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Collection Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Date From */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && setDateFrom(date)}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && setDateTo(date)}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Driver Filter */}
            <div className="space-y-2">
              <Label>Driver</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="All drivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All drivers</SelectItem>
                  {drivers?.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.full_name || driver.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Route Filter */}
            <div className="space-y-2">
              <Label>Route</Label>
              <Input
                placeholder="Route ID"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={reconciliationStatus} onValueChange={(value: any) => setReconciliationStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reconciled">Reconciled</SelectItem>
                  <SelectItem value="discrepancy">Discrepancy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                <Download className="w-4 h-4 mr-1" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {cashReport && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(cashReport.summary.total_collected)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {cashReport.summary.total_payments} payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(cashReport.summary.total_expected)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Collection rate: {calculateCollectionRate(cashReport.summary.total_collected, cashReport.summary.total_expected)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Discrepancy</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(cashReport.summary.total_discrepancy)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((cashReport.summary.total_discrepancy / cashReport.summary.total_expected) * 100).toFixed(1)}% variance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {cashReport.summary.collection_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Reconciliation progress
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Collections Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Cash Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashReport.daily_collections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'total_collected' ? 'Collected' : 'Expected'
                    ]} 
                  />
                  <Bar dataKey="total_expected" fill="#94a3b8" name="Expected" />
                  <Bar dataKey="total_collected" fill="#10b981" name="Collected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Collections Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Collection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-right p-2">Expected</th>
                      <th className="text-right p-2">Collected</th>
                      <th className="text-right p-2">Discrepancy</th>
                      <th className="text-right p-2">Payments</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-right p-2">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashReport.daily_collections.map((day, index) => {
                      const collectionRate = calculateCollectionRate(day.total_collected, day.total_expected)
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{format(new Date(day.date), 'MMM dd, yyyy')}</td>
                          <td className="p-2 text-right">{formatCurrency(day.total_expected)}</td>
                          <td className="p-2 text-right text-green-600">{formatCurrency(day.total_collected)}</td>
                          <td className="p-2 text-right text-orange-600">{formatCurrency(day.discrepancy_amount)}</td>
                          <td className="p-2 text-right">{day.payment_count}</td>
                          <td className="p-2 text-center">{getStatusBadge(day.reconciliation_status)}</td>
                          <td className="p-2 text-right">
                            <span className={`font-medium ${
                              Number(collectionRate) >= 95 ? 'text-green-600' : 
                              Number(collectionRate) >= 90 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {collectionRate}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Collections by User */}
          {cashReport.daily_collections.length > 0 && cashReport.daily_collections[0].collections_by_user && (
            <Card>
              <CardHeader>
                <CardTitle>Collections by User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(cashReport.daily_collections[0].collections_by_user).map((userCollection: any, index) => {
                    const userCollectionRate = calculateCollectionRate(userCollection.collected, userCollection.expected)
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{userCollection.user?.full_name || userCollection.user?.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {userCollection.count} collections
                              {userCollection.discrepancies > 0 && (
                                <span className="text-orange-600 ml-2">
                                  • {userCollection.discrepancies} discrepancies
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            {formatCurrency(userCollection.collected)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {userCollectionRate}% collection rate
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Generating cash collection report...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}