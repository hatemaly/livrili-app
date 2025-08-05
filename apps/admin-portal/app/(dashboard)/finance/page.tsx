'use client'

import { useState, useMemo } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Users,
  FileText,
  Calculator,
  BarChart3
} from 'lucide-react'
import { CashManagementDashboard } from './components/cash-management-dashboard'
import { CreditManagementInterface } from './components/credit-management-interface'
import { PaymentRecordingForm } from './components/payment-recording-form'
import { ReconciliationTools } from './components/reconciliation-tools'
import { InvoiceGeneration } from './components/invoice-generation'
import { FinancialReports } from './components/financial-reports'
import { OverduePaymentsView } from './components/overdue-payments-view'
import { api } from '@/lib/trpc'

export default function FinancePage() {
  usePageTitle('Finance - Livrili Admin Portal')
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Memoize date values to prevent infinite refetching
  const dateRange = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const now = new Date()
    return {
      date_from: thirtyDaysAgo.toISOString(),
      date_to: now.toISOString()
    }
  }, []) // Empty dependency array means this only runs once
  
  // Get financial summary data
  const { data: financialSummary, isLoading: summaryLoading, error: summaryError } = api.payments.getFinancialSummary.useQuery(dateRange)

  // Get overdue payments count
  const { data: overdueData, error: overdueError } = api.payments.getOverduePayments.useQuery({
    grace_period_days: 30,
    limit: 5
  })

  // Test endpoint
  const { data: testData } = api.payments.test.useQuery()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading financial data...</p>
          {testData && (
            <p className="mt-2 text-xs text-gray-500">API Test: {testData.message}</p>
          )}
        </div>
      </div>
    )
  }

  if (summaryError) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Error Loading Financial Data</h3>
          <p className="mt-2 text-sm text-gray-600">{summaryError.message}</p>
          {summaryError.message.includes('Admin access required') && (
            <p className="mt-2 text-sm text-gray-500">Please ensure you have admin privileges to access financial data.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">
            Manage payments, credit, cash flow, and generate financial reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab('record-payment')}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
          <Button 
            onClick={() => setActiveTab('reconciliation')}
            variant="outline"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Reconcile Cash
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialSummary?.payment_statistics.total_cash_collected || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialSummary?.payment_statistics.cash_payment_count || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialSummary?.payment_statistics.total_credit_payments || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialSummary?.payment_statistics.credit_payment_count || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.abs(financialSummary?.retailer_statistics.total_outstanding_balance || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialSummary?.retailer_statistics.active_retailers || 0} active retailers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(overdueData?.summary.total_overdue_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueData?.summary.overdue_count || 0} overdue orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="cash-management" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cash
          </TabsTrigger>
          <TabsTrigger value="credit-management" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Credit
          </TabsTrigger>
          <TabsTrigger value="record-payment" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Record Payment
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Reconcile
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6">
            <CashManagementDashboard />
            {overdueData && overdueData.overdue_orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Overdue Payments Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OverduePaymentsView data={overdueData} preview={true} />
                  <Button 
                    onClick={() => setActiveTab('reports')} 
                    variant="outline" 
                    className="mt-4"
                  >
                    View All Overdue Payments
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cash-management">
          <CashManagementDashboard />
        </TabsContent>

        <TabsContent value="credit-management">
          <CreditManagementInterface />
        </TabsContent>

        <TabsContent value="record-payment">
          <PaymentRecordingForm onSuccess={() => {
            // Refresh data and show success message
            window.location.reload()
          }} />
        </TabsContent>

        <TabsContent value="reconciliation">
          <ReconciliationTools />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceGeneration />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}