'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3,
  FileText,
  DollarSign,
  AlertTriangle,
  Users,
  Settings,
  Download,
  Calendar,
  Clock,
  TrendingUp
} from 'lucide-react'
import { SalesReportInterface } from './components/sales-report-interface'
import { CashCollectionReport } from './components/cash-collection-report'
import { CreditAgingReport } from './components/credit-aging-report'
import { TaxComplianceReport } from './components/tax-compliance-report'
import { UserActivityReport } from './components/user-activity-report'
import { CustomReportBuilder } from './components/custom-report-builder'
import { ReportScheduler } from './components/report-scheduler'
import { ReportTemplates } from './components/report-templates'
import { ReportDashboard } from './components/report-dashboard'

export default function ReportsPage() {
  usePageTitle('Reports - Livrili Admin Portal')
  const [activeTab, setActiveTab] = useState('dashboard')

  const reportTypes = [
    {
      id: 'sales',
      title: 'Sales Reports',
      description: 'Revenue analysis by period, category, and region',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'cash',
      title: 'Cash Collection',
      description: 'Daily cash reconciliation and collection tracking',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'credit',
      title: 'Credit Aging',
      description: 'Overdue payments and credit risk analysis',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'tax',
      title: 'Tax Compliance',
      description: 'Tax calculations and compliance reporting',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'activity',
      title: 'User Activity',
      description: 'User actions and system usage tracking',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'custom',
      title: 'Custom Reports',
      description: 'Build custom reports with flexible filters',
      icon: BarChart3,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate, schedule, and export comprehensive business reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled Reports
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 lg:grid-cols-8 w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="cash">Cash</TabsTrigger>
          <TabsTrigger value="credit">Credit</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Report Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <ReportDashboard />
        </TabsContent>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Sales Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesReportInterface />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Collection Reports */}
        <TabsContent value="cash" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Cash Collection Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CashCollectionReport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Aging Reports */}
        <TabsContent value="credit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Credit Aging Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreditAgingReport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Compliance Reports */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Tax Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaxComplianceReport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activity Reports */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                User Activity Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserActivityReport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Report Builder */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                Custom Report Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomReportBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Report Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Report Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReportTemplates />
              </CardContent>
            </Card>

            {/* Report Scheduler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Scheduled Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReportScheduler />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}