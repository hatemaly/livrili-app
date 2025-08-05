'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingDown,
  Users,
  Filter,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { api } from '@/lib/trpc'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function CreditAgingReport() {
  const [agingBuckets, setAgingBuckets] = useState<number[]>([30, 60, 90, 120])
  const [minAmount, setMinAmount] = useState<string>('')
  const [retailerStatus, setRetailerStatus] = useState<'active' | 'inactive' | 'suspended' | 'all'>('all')
  const [includeZeroBalance, setIncludeZeroBalance] = useState(false)

  // Fetch credit aging report data
  const { data: agingReport, isLoading, refetch } = api.reports.getCreditAgingReport.useQuery({
    aging_buckets: agingBuckets,
    min_amount: minAmount ? Number(minAmount) : undefined,
    retailer_status: retailerStatus === 'all' ? undefined : retailerStatus,
    include_zero_balance: includeZeroBalance
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
        report_type: 'credit_aging',
        format,
        config: {
          aging_buckets: agingBuckets,
          min_amount: minAmount ? Number(minAmount) : undefined,
          retailer_status: retailerStatus === 'all' ? undefined : retailerStatus,
          include_zero_balance: includeZeroBalance
        }
      })

      window.open(result.download_url, '_blank')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="secondary">{riskLevel}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Chart data preparation
  const agingBucketData = agingReport ? agingBuckets.map(bucket => ({
    bucket: `${bucket} days`,
    amount: agingReport.summary.aging_bucket_totals[`${bucket}_days`] || 0
  })) : []

  const riskDistributionData = agingReport ? [
    { name: 'Critical', value: agingReport.summary.risk_distribution.critical, color: '#dc2626' },
    { name: 'High', value: agingReport.summary.risk_distribution.high, color: '#ea580c' },
    { name: 'Medium', value: agingReport.summary.risk_distribution.medium, color: '#ca8a04' },
    { name: 'Low', value: agingReport.summary.risk_distribution.low, color: '#16a34a' }
  ] : []

  const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a']

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Aging Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Aging Buckets */}
            <div className="space-y-2">
              <Label>Aging Buckets (Days)</Label>
              <Input
                placeholder="30,60,90,120"
                value={agingBuckets.join(',')}
                onChange={(e) => {
                  const buckets = e.target.value.split(',').map(Number).filter(n => !isNaN(n))
                  setAgingBuckets(buckets)
                }}
              />
            </div>

            {/* Minimum Amount */}
            <div className="space-y-2">
              <Label>Minimum Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            {/* Retailer Status */}
            <div className="space-y-2">
              <Label>Retailer Status</Label>
              <Select value={retailerStatus} onValueChange={(value: any) => setRetailerStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Zero Balance */}
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-zero"
                  checked={includeZeroBalance}
                  onCheckedChange={(checked) => setIncludeZeroBalance(checked as boolean)}
                />
                <Label htmlFor="include-zero" className="text-sm">
                  Include zero balance
                </Label>
              </div>
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
      {agingReport && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(agingReport.summary.total_outstanding)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {agingReport.summary.total_retailers} retailers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Days Overdue</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {agingReport.summary.avg_days_overdue.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Days on average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {agingReport.summary.risk_distribution.critical}
                </div>
                <p className="text-xs text-muted-foreground">
                  High priority accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {agingReport.summary.risk_distribution.high}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Aging Buckets Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Outstanding by Aging Period</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agingBucketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Outstanding']} />
                    <Bar dataKey="amount" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Aging Table */}
          <Card>
            <CardHeader>
              <CardTitle>Retailer Credit Aging Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Retailer</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-right p-2">Outstanding</th>
                      <th className="text-right p-2">Credit Usage</th>
                      <th className="text-right p-2">Days Overdue</th>
                      <th className="text-center p-2">Risk Level</th>
                      <th className="text-right p-2">Overdue Orders</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agingReport.aging_data.map((retailer, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{retailer.retailer.business_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              {retailer.retailer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {retailer.retailer.phone}
                                </span>
                              )}
                              {retailer.retailer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {retailer.retailer.email}
                                </span>
                              )}
                            </div>
                            {(retailer.retailer.city || retailer.retailer.state) && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {[retailer.retailer.city, retailer.retailer.state].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          {getStatusBadge(retailer.retailer.status)}
                        </td>
                        <td className="p-2 text-right text-red-600 font-medium">
                          {formatCurrency(retailer.outstanding_balance)}
                        </td>
                        <td className="p-2 text-right">
                          <div className="text-orange-600 font-medium">
                            {retailer.credit_utilization.toFixed(1)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                retailer.credit_utilization > 90 ? 'bg-red-500' :
                                retailer.credit_utilization > 75 ? 'bg-orange-500' :
                                retailer.credit_utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, retailer.credit_utilization)}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          <span className={`font-medium ${
                            retailer.days_overdue > 90 ? 'text-red-600' :
                            retailer.days_overdue > 60 ? 'text-orange-600' :
                            retailer.days_overdue > 30 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {retailer.days_overdue}
                          </span>
                          <div className="text-xs text-muted-foreground">days</div>
                        </td>
                        <td className="p-2 text-center">
                          {getRiskBadge(retailer.risk_level)}
                        </td>
                        <td className="p-2 text-right">
                          <div className="font-medium">{retailer.overdue_orders.length}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(retailer.overdue_orders.reduce((sum, order) => sum + order.amount, 0))}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" className="text-xs">
                              Contact
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Aging Bucket Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Aging Bucket Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {agingBuckets.map((bucket, index) => {
                  const bucketAmount = agingReport.summary.aging_bucket_totals[`${bucket}_days`] || 0
                  const percentage = agingReport.summary.total_outstanding > 0 
                    ? (bucketAmount / agingReport.summary.total_outstanding) * 100 
                    : 0

                  return (
                    <div key={bucket} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">0-{bucket} Days</span>
                        <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(bucketAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {agingReport.aging_data.filter(r => {
                          const maxDays = index === 0 ? bucket : agingBuckets[index - 1]
                          const minDays = index === 0 ? 0 : agingBuckets[index - 1]
                          return r.days_overdue > minDays && r.days_overdue <= bucket
                        }).length} retailers
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Generating credit aging report...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}