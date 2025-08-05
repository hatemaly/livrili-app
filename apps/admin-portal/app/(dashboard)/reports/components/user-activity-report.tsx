'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  CalendarIcon,
  Download,
  RefreshCw,
  Users,
  Activity,
  Clock,
  MousePointer,
  Eye,
  Filter,
  User,
  Shield
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export function UserActivityReport() {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [dateTo, setDateTo] = useState<Date>(new Date())
  const [userId, setUserId] = useState<string>('all')
  const [actionType, setActionType] = useState<'login' | 'logout' | 'order_created' | 'order_modified' | 'payment_processed' | 'user_created' | 'user_modified' | 'all'>('all')
  const [entityType, setEntityType] = useState<'order' | 'payment' | 'user' | 'retailer' | 'product' | 'all'>('all')

  // Fetch user activity report data
  const { data: activityReport, isLoading, refetch } = api.reports.getUserActivityReport.useQuery({
    date_from: dateFrom.toISOString(),
    date_to: dateTo.toISOString(),
    user_id: userId === 'all' ? undefined : userId,
    action_type: actionType === 'all' ? undefined : actionType,
    entity_type: entityType === 'all' ? undefined : entityType
  })

  // Fetch users for filter
  const { data: users } = api.users.getUsers.useQuery()

  const exportReport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      const result = await api.reports.exportReport.mutate({
        report_type: 'user_activity',
        format,
        config: {
          date_from: dateFrom.toISOString(),
          date_to: dateTo.toISOString(),
          user_id: userId || undefined,
          action_type: actionType || undefined,
          entity_type: entityType || undefined
        }
      })

      window.open(result.download_url, '_blank')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <User className="w-4 h-4" />
      case 'order_created':
      case 'order_modified':
        return <MousePointer className="w-4 h-4" />
      case 'payment_processed':
        return <Activity className="w-4 h-4" />
      case 'user_created':
      case 'user_modified':
        return <Users className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      order_created: 'bg-blue-100 text-blue-800',
      order_modified: 'bg-yellow-100 text-yellow-800',
      payment_processed: 'bg-purple-100 text-purple-800',
      user_created: 'bg-indigo-100 text-indigo-800',
      user_modified: 'bg-orange-100 text-orange-800'
    }

    return (
      <Badge className={colors[action] || 'bg-gray-100 text-gray-800'}>
        {action.replace('_', ' ')}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
      driver: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    )
  }

  // Chart data preparation
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  const actionTypeData = activityReport ? Object.entries(
    activityReport.user_activity_summary.reduce((acc, user) => {
      Object.entries(user.action_breakdown).forEach(([action, count]) => {
        acc[action] = (acc[action] || 0) + count
      })
      return acc
    }, {} as Record<string, number>)
  ).map(([action, count]) => ({ name: action, value: count })) : []

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Activity Filters
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

            {/* User Filter */}
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Type Filter */}
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={actionType} onValueChange={(value: any) => setActionType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="order_created">Order Created</SelectItem>
                  <SelectItem value="order_modified">Order Modified</SelectItem>
                  <SelectItem value="payment_processed">Payment Processed</SelectItem>
                  <SelectItem value="user_created">User Created</SelectItem>
                  <SelectItem value="user_modified">User Modified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type Filter */}
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select value={entityType} onValueChange={(value: any) => setEntityType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="retailer">Retailer</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
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
      {activityReport && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {activityReport.summary.total_actions}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activityReport.summary.period}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activityReport.summary.unique_users}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Active User</CardTitle>
                <User className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-purple-600">
                  {activityReport.summary.most_active_user?.user?.full_name || 
                   activityReport.summary.most_active_user?.user?.username || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activityReport.summary.most_active_user?.total_actions || 0} actions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Common Action</CardTitle>
                <MousePointer className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-orange-600">
                  {activityReport.summary.most_common_action || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Most frequent activity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily Activity Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityReport.daily_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total_actions" stroke="#2563eb" strokeWidth={2} name="Actions" />
                    <Line type="monotone" dataKey="unique_users" stroke="#10b981" strokeWidth={2} name="Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Action Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Action Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={actionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.replace('_', ' ')} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {actionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* User Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">User</th>
                      <th className="text-center p-2">Role</th>
                      <th className="text-right p-2">Total Actions</th>
                      <th className="text-center p-2">Top Actions</th>
                      <th className="text-center p-2">Last Activity</th>
                      <th className="text-right p-2">Active Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityReport.user_activity_summary.map((user, index) => {
                      const topAction = Object.entries(user.action_breakdown)
                        .sort(([,a], [,b]) => b - a)[0]
                      const avgActiveHour = user.active_hours.length > 0 
                        ? user.active_hours.reduce((a, b) => a + b, 0) / user.active_hours.length 
                        : 0

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">
                                {user.user?.full_name || user.user?.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {user.user?.id}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            {getRoleBadge(user.user?.role || 'user')}
                          </td>
                          <td className="p-2 text-right font-medium text-blue-600">
                            {user.total_actions}
                          </td>
                          <td className="p-2 text-center">
                            {topAction && getActionBadge(topAction[0])}
                            {topAction && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {topAction[1]} times
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <div className="text-xs">
                              {format(new Date(user.last_activity), 'MMM dd, HH:mm')}
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <div className="text-sm">{user.active_hours.length}</div>
                            <div className="text-xs text-muted-foreground">
                              Avg: {avgActiveHour.toFixed(0)}:00
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityReport.recent_activities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {getActionIcon(activity.action_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {activity.users?.full_name || activity.users?.username}
                          </span>
                          {getActionBadge(activity.action_type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.entity_type} • {activity.entity_id}
                          {activity.details && (
                            <span className="ml-2">• {JSON.stringify(activity.details).substring(0, 50)}...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {format(new Date(activity.created_at), 'HH:mm')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(activity.created_at), 'MMM dd')}
                      </div>
                    </div>
                  </div>
                ))}
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
              <span className="ml-2">Generating user activity report...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}