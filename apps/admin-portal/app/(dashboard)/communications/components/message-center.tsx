'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Send, Users, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { api } from '@/lib/trpc'
import { cn } from '@/lib/utils'

const sendMessageSchema = z.object({
  targetRetailerId: z.string().optional(),
  targetUserIds: z.array(z.string()).default([]),
  templateId: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').max(500),
  content: z.string().min(1, 'Content is required'),
  language: z.enum(['en', 'ar', 'fr']).default('en'),
  deliveryChannels: z.array(z.enum(['in_app', 'email', 'sms', 'whatsapp'])).min(1),
  scheduledAt: z.date().optional(),
  variables: z.record(z.any()).optional()
})

type SendMessageForm = z.infer<typeof sendMessageSchema>

export function MessageCenter() {
  const [activeView, setActiveView] = useState<'compose' | 'history'>('compose')
  const [selectedRetailer, setSelectedRetailer] = useState<string>('')

  const form = useForm<SendMessageForm>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      targetUserIds: [],
      language: 'en',
      deliveryChannels: ['in_app'],
      variables: {}
    }
  })

  // API queries
  const { data: retailers } = api.retailers.getAll.useQuery({
    limit: 100,
    status: 'active'
  })

  const { data: templates } = api.communications.getTemplates.useQuery({
    isActive: true
  })

  const { data: messages, refetch: refetchMessages } = api.communications.getMessages.useQuery({
    limit: 50
  })

  const { data: retailerUsers } = api.users.getByRetailer.useQuery(
    { retailerId: selectedRetailer },
    { enabled: !!selectedRetailer }
  )

  // Mutations
  const sendMessage = api.communications.sendMessage.useMutation({
    onSuccess: () => {
      form.reset()
      refetchMessages()
    }
  })

  const onSubmit = (data: SendMessageForm) => {
    sendMessage.mutate(data)
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.templates.find(t => t.id === templateId)
    if (template) {
      const lang = form.getValues('language')
      const subject = template[`subject_${lang}` as keyof typeof template] as string || template.subject_en
      const content = template[`content_${lang}` as keyof typeof template] as string || template.content_en
      
      form.setValue('subject', subject || '')
      form.setValue('content', content || '')
      form.setValue('templateId', templateId)
    }
  }

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-purple-100 text-purple-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList>
          <TabsTrigger value="compose">Compose Message</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recipient Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Recipients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="targetRetailerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Retailer</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value)
                            setSelectedRetailer(value)
                          }}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a retailer" />
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

                    {selectedRetailer && retailerUsers?.users && (
                      <FormField
                        control={form.control}
                        name="targetUserIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Specific Users (Optional)</FormLabel>
                            <div className="space-y-2">
                              {retailerUsers.users.map((user) => (
                                <div key={user.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={user.id}
                                    checked={field.value.includes(user.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, user.id])
                                      } else {
                                        field.onChange(field.value.filter(id => id !== user.id))
                                      }
                                    }}
                                  />
                                  <Label htmlFor={user.id} className="text-sm">
                                    {user.full_name || user.username} ({user.role})
                                  </Label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Message Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Message Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="ar">العربية</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryChannels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Channels</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'in_app', label: 'In-App' },
                              { value: 'email', label: 'Email' },
                              { value: 'sms', label: 'SMS' },
                              { value: 'whatsapp', label: 'WhatsApp' }
                            ].map((channel) => (
                              <div key={channel.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={channel.value}
                                  checked={field.value.includes(channel.value as any)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, channel.value])
                                    } else {
                                      field.onChange(field.value.filter(c => c !== channel.value))
                                    }
                                  }}
                                />
                                <Label htmlFor={channel.value} className="text-sm">
                                  {channel.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Send immediately</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Template Selection */}
              {templates?.templates.length && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {templates.templates.slice(0, 8).map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleTemplateSelect(template.id)}
                          className="text-left justify-start"
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message Composition */}
              <Card>
                <CardHeader>
                  <CardTitle>Message Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter message subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type your message here..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={sendMessage.isPending}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sendMessage.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {messages?.messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{message.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            To: {message.target_retailer_id ? 'Retailer' : 'Multiple Recipients'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getMessageStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {message.recipient_count} recipients
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {message.delivered_count} delivered
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {message.read_count} read
                        </span>
                      </div>
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