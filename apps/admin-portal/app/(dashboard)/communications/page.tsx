'use client'

import { useState } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send, Settings, BarChart3, Users, Bell } from 'lucide-react'
import { MessageCenter } from './components/message-center'
import { BroadcastInterface } from './components/broadcast-interface'
import { TemplateManager } from './components/template-manager'
import { NotificationCenter } from './components/notification-center'
import { ConversationView } from './components/conversation-view'
import { CommunicationAnalytics } from './components/communication-analytics'

export default function CommunicationsPage() {
  usePageTitle('Communications - Livrili Admin Portal')
  const [activeTab, setActiveTab] = useState('messages')

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications Hub</h1>
          <p className="text-muted-foreground mt-2">
            Manage messages, notifications, and conversations with retailers
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Broadcast
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Center</CardTitle>
              <CardDescription>
                Send individual messages to retailers and manage conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageCenter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Messages</CardTitle>
              <CardDescription>
                Send messages to multiple retailers based on criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BroadcastInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Create and manage reusable message templates with multi-language support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Center</CardTitle>
              <CardDescription>
                Manage push notifications, email alerts, and SMS communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationCenter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>
                View and manage ongoing conversations with retailers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversationView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Analytics</CardTitle>
              <CardDescription>
                Track message delivery, engagement, and communication performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommunicationAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}