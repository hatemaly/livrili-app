'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Download,
  Eye,
  Clock,
  ArrowRight
} from 'lucide-react'
import { api } from '@/lib/trpc'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function ReportDashboard() {
  const [dateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  })

  // Fetch dashboard metrics
  const { data: dashboardMetrics, isLoading: metricsLoading } = api.analytics.getDashboardMetrics.useQuery({
    date_from: dateRange.from.toISOString(),
    date_to: dateRange.to.toISOString()
  })

  // Fetch order trends
  const { data: orderTrends, isLoading: trendsLoading } = api.analytics.getOrderTrends.useQuery({
    period: 'daily',
    days: 30
  })

  // Fetch performance metrics
  const { data: performanceMetrics, isLoading: performanceLoading } = api.analytics.getPerformanceMetrics.useQuery({
    date_from: dateRange.from.toISOString(),
    date_to: dateRange.to.toISOString()
  })

  const commonReports = [
    {
      title: 'Daily Sales Summary',
      description: 'Quick overview of today\'s sales performance',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: 'Generate Now',
      frequency: 'Daily',
      lastRun: '2 hours ago'
    },
    {
      title: 'Cash Collection Report',
      description: 'Daily cash reconciliation and collection tracking',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: 'Generate Now',
      frequency: 'Daily',
      lastRun: '4 hours ago'
    },
    {
      title: 'Overdue Payments',
      description: 'Credit aging and overdue payment analysis',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: 'Generate Now',
      frequency: 'Weekly',
      lastRun: '1 day ago'
    },
    {
      title: 'Monthly Tax Report',
      description: 'Monthly tax compliance and calculations',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: 'Generate Now',
      frequency: 'Monthly',
      lastRun: '3 days ago'
    }
  ]

  const recentExports = [
    { name: 'Sales Report - November 2024', type: 'PDF', size: '2.4 MB', date: '2 hours ago', status: 'completed' },
    { name: 'Cash Collection - Week 47', type: 'Excel', size: '1.8 MB', date: '1 day ago', status: 'completed' },
    { name: 'Credit Aging Report', type: 'CSV', size: '0.9 MB', date: '2 days ago', status: 'completed' },
    { name: 'User Activity - October', type: 'PDF', size: '3.1 MB', date: '1 week ago', status: 'completed' }
  ]

  const scheduledReports = [
    { name: 'Daily Sales Summary', nextRun: 'Today at 09:00', frequency: 'Daily', recipients: 3 },
    { name: 'Weekly Performance', nextRun: 'Monday at 08:00', frequency: 'Weekly', recipients: 5 },
    { name: 'Monthly Financial', nextRun: 'Dec 1 at 07:00', frequency: 'Monthly', recipients: 8 }
  ]

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledReports.length}</div>
            <p className="text-xs text-muted-foreground">
              3 active schedules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +18% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Processed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4K</div>
            <p className="text-xs text-muted-foreground">
              Records in last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {orderTrends && !trendsLoading ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orderTrends.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceMetrics && !performanceLoading ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Delivered', value: performanceMetrics.distribution.delivered, color: COLORS[0] },
                      { name: 'Processing', value: performanceMetrics.distribution.processing, color: COLORS[1] },
                      { name: 'Shipped', value: performanceMetrics.distribution.shipped, color: COLORS[2] },
                      { name: 'Pending', value: performanceMetrics.distribution.pending, color: COLORS[3] },
                      { name: 'Cancelled', value: performanceMetrics.distribution.cancelled, color: COLORS[4] }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceMetrics && Object.values(performanceMetrics.distribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Common Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Common Reports</CardTitle>
          <p className="text-sm text-muted-foreground">
            Frequently generated reports for daily operations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {commonReports.map((report, index) => (
              <div key={index} className={`p-4 rounded-lg border ${report.bgColor}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-white`}>
                    <report.icon className={`w-5 h-5 ${report.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {report.frequency}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm mb-1">{report.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last: {report.lastRun}</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Exports
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExports.map((export_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm">{export_.name}</span>
                      <Badge variant="outline" className="text-xs">{export_.type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{export_.size}</span>
                      <span>{export_.date}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Scheduled Reports
              <Button variant="outline" size="sm">
                Manage
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm">{schedule.name}</span>
                      <Badge variant="outline" className="text-xs">{schedule.frequency}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Next: {schedule.nextRun}</span>
                      <span>{schedule.recipients} recipients</span>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}