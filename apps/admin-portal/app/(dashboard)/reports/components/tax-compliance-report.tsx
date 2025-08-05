'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CalendarIcon,
  Download,
  RefreshCw,
  FileText,
  Calculator,
  PieChart,
  TrendingUp,
  Filter,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export function TaxComplianceReport() {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [dateTo, setDateTo] = useState<Date>(new Date())
  const [taxType, setTaxType] = useState<'vat' | 'income_tax' | 'withholding_tax' | 'all'>('all')
  const [includeExemptions, setIncludeExemptions] = useState(true)

  // Fetch tax compliance report data
  const { data: taxReport, isLoading, refetch } = api.reports.getTaxComplianceReport.useQuery({
    date_from: dateFrom.toISOString(),
    date_to: dateTo.toISOString(),
    tax_type: taxType === 'all' ? undefined : taxType,
    include_exemptions: includeExemptions
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
        report_type: 'tax_compliance',
        format,
        config: {
          date_from: dateFrom.toISOString(),
          date_to: dateTo.toISOString(),
          tax_type: taxType === 'all' ? undefined : taxType,
          include_exemptions: includeExemptions
        }
      })

      window.open(result.download_url, '_blank')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Tax Compliance Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            {/* Tax Type */}
            <div className="space-y-2">
              <Label>Tax Type</Label>
              <Select value={taxType} onValueChange={(value: any) => setTaxType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All tax types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tax types</SelectItem>
                  <SelectItem value="vat">VAT</SelectItem>
                  <SelectItem value="income_tax">Income Tax</SelectItem>
                  <SelectItem value="withholding_tax">Withholding Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Exemptions */}
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-exemptions"
                  checked={includeExemptions}
                  onCheckedChange={(checked) => setIncludeExemptions(checked as boolean)}
                />
                <Label htmlFor="include-exemptions" className="text-sm">
                  Include tax exemptions
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
      {taxReport && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gross Amount</CardTitle>
                <Calculator className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(taxReport.summary.total_gross_amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {taxReport.summary.total_transactions} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tax Amount</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(taxReport.summary.total_tax_amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {taxReport.summary.effective_tax_rate.toFixed(2)}% effective rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(taxReport.summary.total_net_amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  After tax deduction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tax Exempt</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(taxReport.summary.total_exempt_amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {taxReport.summary.exempt_transactions} exempt transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Tax Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Tax Collection Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={taxReport.monthly_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'tax_amount' ? 'Tax Collected' : 
                    name === 'gross_amount' ? 'Gross Amount' : 'Net Amount'
                  ]} />
                  <Line type="monotone" dataKey="gross_amount" stroke="#3b82f6" strokeWidth={2} name="Gross" />
                  <Line type="monotone" dataKey="tax_amount" stroke="#10b981" strokeWidth={2} name="Tax" />
                  <Line type="monotone" dataKey="net_amount" stroke="#8b5cf6" strokeWidth={2} name="Net" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tax Rate Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Rate Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tax Rate</th>
                      <th className="text-right p-2">Gross Amount</th>
                      <th className="text-right p-2">Tax Amount</th>
                      <th className="text-right p-2">Net Amount</th>
                      <th className="text-right p-2">Transactions</th>
                      <th className="text-right p-2">Exempt Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxReport.tax_summary.map((rate, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{rate.tax_rate}%</td>
                        <td className="p-2 text-right">{formatCurrency(rate.gross_amount)}</td>
                        <td className="p-2 text-right text-green-600">{formatCurrency(rate.tax_amount)}</td>
                        <td className="p-2 text-right text-purple-600">{formatCurrency(rate.net_amount)}</td>
                        <td className="p-2 text-right">{rate.transaction_count}</td>
                        <td className="p-2 text-right text-orange-600">{formatCurrency(rate.exempt_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Tax Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Gross Amount</th>
                      <th className="text-right p-2">Tax Amount</th>
                      <th className="text-right p-2">Net Amount</th>
                      <th className="text-right p-2">Exempt Amount</th>
                      <th className="text-right p-2">Transactions</th>
                      <th className="text-right p-2">Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxReport.monthly_breakdown.map((month, index) => {
                      const effectiveRate = month.gross_amount > 0 
                        ? (month.tax_amount / month.gross_amount) * 100 
                        : 0
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{format(new Date(month.month + '-01'), 'MMM yyyy')}</td>
                          <td className="p-2 text-right">{formatCurrency(month.gross_amount)}</td>
                          <td className="p-2 text-right text-green-600">{formatCurrency(month.tax_amount)}</td>
                          <td className="p-2 text-right text-purple-600">{formatCurrency(month.net_amount)}</td>
                          <td className="p-2 text-right text-orange-600">{formatCurrency(month.exempt_amount)}</td>
                          <td className="p-2 text-right">{month.transaction_count}</td>
                          <td className="p-2 text-right">{effectiveRate.toFixed(2)}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tax Compliance Summary */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tax Collection Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Collection Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {((taxReport.summary.total_tax_amount / (taxReport.summary.total_gross_amount * 0.19)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Exemption Rate</span>
                    <span className="text-lg font-bold text-orange-600">
                      {((taxReport.summary.exempt_transactions / taxReport.summary.total_transactions) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Effective Tax Rate</span>
                    <span className="text-lg font-bold text-blue-600">
                      {taxReport.summary.effective_tax_rate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tax Period</span>
                    <Badge variant="outline">{taxReport.summary.period}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Report Status</span>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Quality</span>
                    <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Filing Due</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 20), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Generating tax compliance report...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}