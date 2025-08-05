'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { MessageSquare, Send, Users, Clock, CheckCircle, Circle, Archive, Search, Filter } from 'lucide-react'
import { api } from '@/lib/trpc'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const replySchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  subject: z.string().optional()
})

type ReplyForm = z.infer<typeof replySchema>

export function ConversationView() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const form = useForm<ReplyForm>({
    resolver: zodResolver(replySchema)
  })

  // API queries
  const { data: conversations, refetch: refetchConversations } = api.communications.getConversations.useQuery({
    limit: 100,
    status: statusFilter === 'all' ? undefined : statusFilter as any
  })

  const { data: conversationMessages, refetch: refetchMessages } = api.communications.getMessages.useQuery(
    {
      conversationId: selectedConversation!,
      limit: 100
    },
    { enabled: !!selectedConversation }
  )

  // Mutations
  const sendReply = api.communications.sendMessage.useMutation({
    onSuccess: () => {
      form.reset()
      refetchMessages()
      refetchConversations()
    }
  })

  const markAsRead = api.communications.markAsRead.useMutation({
    onSuccess: () => {
      refetchConversations()
      refetchMessages()
    }
  })

  const onSubmit = (data: ReplyForm) => {
    if (!selectedConversation) return

    sendReply.mutate({
      conversationId: selectedConversation,
      content: data.content,
      subject: data.subject
    })
  }

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId)
    // Mark conversation as read
    markAsRead.mutate({ conversationId })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const filteredConversations = conversations?.conversations.filter(conversation =>
    conversation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.retailer?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const selectedConversationData = conversations?.conversations.find(c => c.id === selectedConversation)

  return (
    <div className="h-[800px] flex border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-muted/10">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-120px)]">
          <div className="p-2 space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation.id)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                  selectedConversation === conversation.id ? "bg-accent" : ""
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <AvatarInitials name={conversation.retailer?.business_name || 'Unknown'} />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.title || 'Untitled Conversation'}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {conversation.last_message_at && formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.retailer?.business_name}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(conversation.status)} size="sm">
                          {conversation.status}
                        </Badge>
                        <Badge className={getPriorityColor(conversation.priority)} size="sm">
                          {conversation.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {conversation.message_count}
                        </span>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" size="sm">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Conversation Detail */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <AvatarInitials name={selectedConversationData?.retailer?.business_name || 'Unknown'} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {selectedConversationData?.title || 'Untitled Conversation'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversationData?.retailer?.business_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedConversationData?.status || 'active')}>
                    {selectedConversationData?.status}
                  </Badge>
                  <Badge className={getPriorityColor(selectedConversationData?.priority || 'normal')}>
                    {selectedConversationData?.priority}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversationMessages?.messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <AvatarInitials name={message.sender?.full_name || message.sender?.username || 'Unknown'} />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {message.sender?.full_name || message.sender?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </span>
                        {message.recipients.some(r => r.read_at) && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      
                      {message.subject && (
                        <p className="text-sm font-medium text-muted-foreground">
                          {message.subject}
                        </p>
                      )}
                      
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Reply Form */}
            <div className="p-4 border-t bg-background">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Subject (optional)"
                            {...field}
                          />
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
                        <FormControl>
                          <Textarea
                            placeholder="Type your reply..."
                            rows={3}
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
                      disabled={sendReply.isPending}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sendReply.isPending ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No Conversation Selected</h3>
                <p className="text-muted-foreground">
                  Select a conversation from the list to view messages and replies
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}