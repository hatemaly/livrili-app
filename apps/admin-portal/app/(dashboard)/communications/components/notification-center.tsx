'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Send, Smartphone, Mail, MessageSquare, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react'
import { api } from '@/lib/trpc'
import { format } from 'date-fns'

const notificationSchema = z.object({
  type: z.enum(['push', 'email', 'sms', 'whatsapp', 'in_app']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  title: z.string().min(1, 'Title is required').max(255),
  body: z.string().min(1, 'Body is required'),
  actionUrl: z.string().url().optional().or(z.literal('')),
  iconUrl: z.string().url().optional().or(z.literal('')),
  recipientUserId: z.string().uuid().optional(),
  recipientRetailerId: z.string().uuid().optional(),
  metadata: z.record(z.any()).default({})
})

type NotificationForm = z.infer<typeof notificationSchema>

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('in_app')

  const form = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'in_app',
      priority: 'normal',
      metadata: {}
    }
  })

  // API queries
  const { data: retailers } = api.retailers.getAll.useQuery({
    limit: 100,
    status: 'active'
  })

  const { data: users } = api.users.getAll.useQuery({
    limit: 100
  })

  const { data: notifications, refetch: refetchNotifications } = api.communications.getNotifications.useQuery({
    limit: 50
  })

  // Mutations
  const sendNotification = api.communications.sendNotification.useMutation({
    onSuccess: () => {
      form.reset()
      setIsDialogOpen(false)
      refetchNotifications()
    }
  })

  const markAsRead = api.communications.markAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications()
    }
  })

  const onSubmit = (data: NotificationForm) => {
    sendNotification.mutate(data)
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'push': return <Smartphone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />
      case 'in_app': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string, readAt?: string) => {
    if (readAt) return <Eye className="h-4 w-4 text-green-600" />
    
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const notificationTypes = [
    { value: 'in_app', label: 'In-App Notification', icon: Bell, description: 'Show notification within the app' },
    { value: 'push', label: 'Push Notification', icon: Smartphone, description: 'Send push notification to mobile devices' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Send email notification' },
    { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Send SMS notification' },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, description: 'Send WhatsApp message' }
  ]

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="history">Notification History</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Quick Send
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Quick Notification</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {notificationTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="h-4 w-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="recipientRetailerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Retailer (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select retailer or leave empty for all" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {retailers?.retailers.map((retailer) => (
                              <SelectItem key={retailer.id} value={retailer.id}>
                                {retailer.business_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter notification title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Body</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter notification message"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="actionUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://app.livrili.com/orders"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={sendNotification.isPending}>
                      {sendNotification.isPending ? 'Sending...' : 'Send Notification'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="send" className="space-y-6">
          {/* Notification Types Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notificationTypes.map((type) => (
              <Card key={type.value} className={`cursor-pointer transition-colors ${
                selectedType === type.value ? 'ring-2 ring-primary' : ''
              }`} onClick={() => setSelectedType(type.value)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <type.icon className="h-5 w-5" />
                    {type.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {type.value.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        form.setValue('type', type.value as any)
                        setIsDialogOpen(true)
                      }}
                    >
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Send Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send {notificationTypes.find(t => t.value === selectedType)?.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <input type="hidden" {...form.register('type')} value={selectedType} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    Low Priority
                                  </div>
                                </SelectItem>
                                <SelectItem value="normal">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    Normal Priority
                                  </div>
                                </SelectItem>
                                <SelectItem value="high">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                    High Priority
                                  </div>
                                </SelectItem>
                                <SelectItem value="urgent">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    Urgent
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recipientRetailerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Retailer</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="All retailers" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {retailers?.retailers.map((retailer) => (
                                  <SelectItem key={retailer.id} value={retailer.id}>
                                    {retailer.business_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actionUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action URL (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://app.livrili.com/path"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification Body</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your notification message here..."
                                rows={6}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={sendNotification.isPending} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      {sendNotification.isPending ? 'Sending...' : 'Send Notification'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {notifications?.notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationTypeIcon(notification.type)}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {notification.body}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(notification.status, notification.read_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            {getNotificationTypeIcon(notification.type)}
                            {notification.type.toUpperCase()}
                          </span>
                          <span>
                            {format(new Date(notification.sent_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.read_at && (
                            <span className="text-green-600">
                              Read {format(new Date(notification.read_at), 'MMM d, h:mm a')}
                            </span>
                          )}
                          {notification.clicked_at && (
                            <span className="text-blue-600">
                              Clicked {format(new Date(notification.clicked_at), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>

                      {notification.action_url && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Action URL: </span>
                          <span className="text-blue-600 break-all">{notification.action_url}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}