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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Send, Users, Target, Filter, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { api } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

const broadcastSchema = z.object({
  templateId: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').max(500),
  content: z.string().min(1, 'Content is required'),
  language: z.enum(['en', 'ar', 'fr']).default('en'),
  deliveryChannels: z.array(z.enum(['in_app', 'email', 'sms', 'whatsapp'])).min(1),
  scheduledAt: z.date().optional(),
  targetCriteria: z.object({
    retailerStatus: z.array(z.enum(['pending', 'active', 'suspended', 'rejected'])).optional(),
    retailerIds: z.array(z.string()).optional(),
    userRoles: z.array(z.enum(['admin', 'retailer', 'driver'])).optional(),
    excludeRetailerIds: z.array(z.string()).optional(),
    creditLimit: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    lastLoginBefore: z.date().optional(),
    lastLoginAfter: z.date().optional()
  }).default({}),
  variables: z.record(z.any()).optional()
})

type BroadcastForm = z.infer<typeof broadcastSchema>

export function BroadcastInterface() {
  const [estimatedRecipients, setEstimatedRecipients] = useState<number>(0)
  const [previewMode, setPreviewMode] = useState(false)

  const form = useForm<BroadcastForm>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      language: 'en',
      deliveryChannels: ['in_app'],
      targetCriteria: {},
      variables: {}
    }
  })

  // API queries
  const { data: retailers } = api.retailers.getAll.useQuery({
    limit: 1000
  })

  const { data: templates } = api.communications.getTemplates.useQuery({
    isActive: true,
    category: 'promotion' // Focus on broadcast-friendly templates
  })

  // Mutations
  const broadcastMessage = api.communications.broadcastMessage.useMutation({
    onSuccess: () => {
      form.reset()
      setEstimatedRecipients(0)
    }
  })

  const onSubmit = (data: BroadcastForm) => {
    broadcastMessage.mutate(data)
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

  // Calculate estimated recipients based on criteria
  const calculateEstimatedRecipients = () => {
    if (!retailers?.retailers) return 0

    const criteria = form.getValues('targetCriteria')
    let filteredRetailers = retailers.retailers

    // Apply status filter
    if (criteria.retailerStatus?.length) {
      filteredRetailers = filteredRetailers.filter(r => 
        criteria.retailerStatus?.includes(r.status as any)
      )
    }

    // Apply specific retailer filter
    if (criteria.retailerIds?.length) {
      filteredRetailers = filteredRetailers.filter(r => 
        criteria.retailerIds?.includes(r.id)
      )
    }

    // Apply exclusion filter
    if (criteria.excludeRetailerIds?.length) {
      filteredRetailers = filteredRetailers.filter(r => 
        !criteria.excludeRetailerIds?.includes(r.id)
      )
    }

    // Apply credit limit filter
    if (criteria.creditLimit?.min !== undefined) {
      filteredRetailers = filteredRetailers.filter(r => 
        r.credit_limit >= (criteria.creditLimit?.min || 0)
      )
    }

    if (criteria.creditLimit?.max !== undefined) {
      filteredRetailers = filteredRetailers.filter(r => 
        r.credit_limit <= (criteria.creditLimit?.max || 0)
      )
    }

    // Estimate users per retailer (average 2-3 users per retailer)
    const estimatedUsers = filteredRetailers.length * 2.5

    setEstimatedRecipients(Math.round(estimatedUsers))
    return Math.round(estimatedUsers)
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Target Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetCriteria.retailerStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retailer Status</FormLabel>
                      <div className="space-y-2">
                        {[
                          { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
                          { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                          { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' }
                        ].map((status) => (
                          <div key={status.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={status.value}
                              checked={field.value?.includes(status.value as any) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || []
                                if (checked) {
                                  field.onChange([...currentValue, status.value])
                                } else {
                                  field.onChange(currentValue.filter(s => s !== status.value))
                                }
                                setTimeout(calculateEstimatedRecipients, 100)
                              }}
                            />
                            <Badge className={status.color}>{status.label}</Badge>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetCriteria.userRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Roles</FormLabel>
                      <div className="space-y-2">
                        {[
                          { value: 'retailer', label: 'Retailers' },
                          { value: 'admin', label: 'Admins' },
                          { value: 'driver', label: 'Drivers' }
                        ].map((role) => (
                          <div key={role.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={role.value}
                              checked={field.value?.includes(role.value as any) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || []
                                if (checked) {
                                  field.onChange([...currentValue, role.value])
                                } else {
                                  field.onChange(currentValue.filter(r => r !== role.value))
                                }
                                setTimeout(calculateEstimatedRecipients, 100)
                              }}
                            />
                            <span className="text-sm">{role.label}</span>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetCriteria.creditLimit.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Credit Limit (DZD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            setTimeout(calculateEstimatedRecipients, 100)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetCriteria.creditLimit.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Credit Limit (DZD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="No limit"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            setTimeout(calculateEstimatedRecipients, 100)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Estimated Recipients */}
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>Estimated Recipients:</strong> {estimatedRecipients} users
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={calculateEstimatedRecipients}
                    className="ml-2 p-0 h-auto"
                  >
                    Recalculate
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Message Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Message Settings</CardTitle>
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
                              id={`broadcast-${channel.value}`}
                              checked={field.value.includes(channel.value as any)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, channel.value])
                                } else {
                                  field.onChange(field.value.filter(c => c !== channel.value))
                                }
                              }}
                            />
                            <span className="text-sm">{channel.label}</span>
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

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
              </CardHeader>
              <CardContent>
                {templates?.templates.length ? (
                  <div className="space-y-2">
                    {templates.templates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplateSelect(template.id)}
                        className="w-full text-left justify-start"
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.category}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No templates available</p>
                )}
              </CardContent>
            </Card>
          </div>

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
                      <Input placeholder="Enter broadcast subject" {...field} />
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
                    <FormDescription>
                      Use variables like {'{{customerName}}'}, {'{{businessName}}'} for personalization
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Type your broadcast message here..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {estimatedRecipients > 1000 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Large Broadcast Warning:</strong> This message will be sent to {estimatedRecipients} recipients. 
                    Please review your targeting criteria and message content carefully.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? 'Edit Mode' : 'Preview Mode'}
                </Button>
                
                <Button
                  type="submit"
                  disabled={broadcastMessage.isPending || estimatedRecipients === 0}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {broadcastMessage.isPending ? 'Sending...' : `Send to ${estimatedRecipients} Recipients`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}