import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Input schemas
const messageTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(['welcome', 'order_update', 'payment_reminder', 'promotion', 'system', 'custom']),
  subject_en: z.string().max(500).optional(),
  subject_ar: z.string().max(500).optional(),
  subject_fr: z.string().max(500).optional(),
  content_en: z.string().optional(),
  content_ar: z.string().optional(),
  content_fr: z.string().optional(),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'date', 'boolean']),
    required: z.boolean().default(false),
    description: z.string().optional()
  })).default([]),
  metadata: z.record(z.any()).default({})
})

const sendMessageSchema = z.object({
  templateId: z.string().uuid().optional(),
  targetRetailerId: z.string().uuid().optional(),
  targetUserIds: z.array(z.string().uuid()).default([]),
  targetCriteria: z.record(z.any()).default({}),
  subject: z.string().max(500).optional(),
  content: z.string().min(1),
  language: z.enum(['en', 'ar', 'fr']).default('en'),
  deliveryChannels: z.array(z.enum(['in_app', 'email', 'sms', 'whatsapp'])).default(['in_app']),
  scheduledAt: z.string().datetime().optional(),
  conversationId: z.string().uuid().optional(),
  parentMessageId: z.string().uuid().optional(),
  variables: z.record(z.any()).default({})
})

const broadcastMessageSchema = z.object({
  templateId: z.string().uuid().optional(),
  subject: z.string().max(500).optional(),
  content: z.string().min(1),
  language: z.enum(['en', 'ar', 'fr']).default('en'),
  deliveryChannels: z.array(z.enum(['in_app', 'email', 'sms', 'whatsapp'])).default(['in_app']),
  scheduledAt: z.string().datetime().optional(),
  targetCriteria: z.object({
    retailerStatus: z.array(z.enum(['pending', 'active', 'suspended', 'rejected'])).optional(),
    retailerIds: z.array(z.string().uuid()).optional(),
    userRoles: z.array(z.enum(['admin', 'retailer', 'driver'])).optional(),
    excludeRetailerIds: z.array(z.string().uuid()).optional(),
    creditLimit: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    lastLoginBefore: z.string().datetime().optional(),
    lastLoginAfter: z.string().datetime().optional()
  }).default({}),
  variables: z.record(z.any()).default({})
})

const notificationSchema = z.object({
  type: z.enum(['push', 'email', 'sms', 'whatsapp', 'in_app']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  actionUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  recipientUserId: z.string().uuid().optional(),
  recipientRetailerId: z.string().uuid().optional(),
  metadata: z.record(z.any()).default({})
})

export const communicationsRouter = router({
  // Send individual message
  sendMessage: adminProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }

      try {
        // If using template, fetch and render content
        let finalSubject = input.subject
        let finalContent = input.content

        if (input.templateId) {
          const { data: template, error: templateError } = await supabase
            .from('message_templates')
            .select('*')
            .eq('id', input.templateId)
            .eq('is_active', true)
            .single()

          if (templateError || !template) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Template not found or inactive'
            })
          }

          // Render template content with variables
          const langKey = input.language
          finalSubject = template[`subject_${langKey}`] || template.subject_en || input.subject
          finalContent = template[`content_${langKey}`] || template.content_en || input.content

          // Replace variables in template
          if (input.variables && Object.keys(input.variables).length > 0) {
            for (const [key, value] of Object.entries(input.variables)) {
              const placeholder = `{{${key}}}`
              if (finalSubject) finalSubject = finalSubject.replace(new RegExp(placeholder, 'g'), String(value))
              finalContent = finalContent.replace(new RegExp(placeholder, 'g'), String(value))
            }
          }
        }

        // Create conversation if needed
        let conversationId = input.conversationId
        if (!conversationId && input.targetRetailerId) {
          const { data: existingConversation } = await supabase
            .from('conversations')
            .select('id')
            .eq('retailer_id', input.targetRetailerId)
            .eq('status', 'active')
            .eq('type', 'support')
            .single()

          if (existingConversation) {
            conversationId = existingConversation.id
          } else {
            const { data: newConversation, error: convError } = await supabase
              .from('conversations')
              .insert({
                retailer_id: input.targetRetailerId,
                title: finalSubject || 'New Message',
                type: 'support',
                participants: [user.id]
              })
              .select('id')
              .single()

            if (convError) {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create conversation'
              })
            }
            conversationId = newConversation.id
          }
        }

        // Create message
        const { data: message, error: messageError } = await supabase
          .from('messages')
          .insert({
            message_type: 'individual',
            template_id: input.templateId,
            conversation_id: conversationId,
            parent_message_id: input.parentMessageId,
            subject: finalSubject,
            content: finalContent,
            language: input.language,
            sender_id: user.id,
            target_retailer_id: input.targetRetailerId,
            target_user_ids: input.targetUserIds,
            delivery_channels: input.deliveryChannels,
            scheduled_at: input.scheduledAt,
            status: input.scheduledAt ? 'draft' : 'sent',
            sent_at: input.scheduledAt ? null : new Date().toISOString(),
            recipient_count: input.targetUserIds.length || 1
          })
          .select()
          .single()

        if (messageError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create message'
          })
        }

        // Create message recipients
        if (input.targetRetailerId) {
          // Get all users for the retailer
          const { data: retailerUsers } = await supabase
            .from('users')
            .select('id')
            .eq('retailer_id', input.targetRetailerId)
            .eq('is_active', true)

          if (retailerUsers && retailerUsers.length > 0) {
            const recipients = retailerUsers.map(user => ({
              message_id: message.id,
              recipient_user_id: user.id,
              recipient_retailer_id: input.targetRetailerId,
              delivery_status: { in_app: 'delivered' }
            }))

            await supabase.from('message_recipients').insert(recipients)
          }
        }

        // Handle specific user targets
        if (input.targetUserIds.length > 0) {
          const recipients = input.targetUserIds.map(userId => ({
            message_id: message.id,
            recipient_user_id: userId,
            delivery_status: { in_app: 'delivered' }
          }))

          await supabase.from('message_recipients').insert(recipients)
        }

        return {
          success: true,
          messageId: message.id,
          conversationId
        }
      } catch (error) {
        console.error('Send message error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message'
        })
      }
    }),

  // Broadcast message to multiple recipients
  broadcastMessage: adminProcedure
    .input(broadcastMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }

      try {
        // Build target query based on criteria
        let targetUsersQuery = supabase
          .from('users')
          .select('id, retailer_id, retailers!inner(*)')
          .eq('is_active', true)

        // Apply filtering criteria
        if (input.targetCriteria.userRoles?.length) {
          targetUsersQuery = targetUsersQuery.in('role', input.targetCriteria.userRoles)
        }

        if (input.targetCriteria.retailerStatus?.length) {
          targetUsersQuery = targetUsersQuery.in('retailers.status', input.targetCriteria.retailerStatus)
        }

        if (input.targetCriteria.retailerIds?.length) {
          targetUsersQuery = targetUsersQuery.in('retailer_id', input.targetCriteria.retailerIds)
        }

        if (input.targetCriteria.excludeRetailerIds?.length) {
          targetUsersQuery = targetUsersQuery.not('retailer_id', 'in', `(${input.targetCriteria.excludeRetailerIds.join(',')})`)
        }

        const { data: targetUsers, error: usersError } = await targetUsersQuery

        if (usersError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch target users'
          })
        }

        if (!targetUsers || targetUsers.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No users found matching the criteria'
          })
        }

        // Process template if provided
        let finalSubject = input.subject
        let finalContent = input.content

        if (input.templateId) {
          const { data: template, error: templateError } = await supabase
            .from('message_templates')
            .select('*')
            .eq('id', input.templateId)
            .eq('is_active', true)
            .single()

          if (templateError || !template) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Template not found or inactive'
            })
          }

          const langKey = input.language
          finalSubject = template[`subject_${langKey}`] || template.subject_en || input.subject
          finalContent = template[`content_${langKey}`] || template.content_en || input.content

          // Replace variables
          if (input.variables && Object.keys(input.variables).length > 0) {
            for (const [key, value] of Object.entries(input.variables)) {
              const placeholder = `{{${key}}}`
              if (finalSubject) finalSubject = finalSubject.replace(new RegExp(placeholder, 'g'), String(value))
              finalContent = finalContent.replace(new RegExp(placeholder, 'g'), String(value))
            }
          }
        }

        // Create broadcast message
        const { data: message, error: messageError } = await supabase
          .from('messages')
          .insert({
            message_type: 'broadcast',
            template_id: input.templateId,
            subject: finalSubject,
            content: finalContent,
            language: input.language,
            sender_id: user.id,
            target_criteria: input.targetCriteria,
            delivery_channels: input.deliveryChannels,
            scheduled_at: input.scheduledAt,
            status: input.scheduledAt ? 'draft' : 'sent',
            sent_at: input.scheduledAt ? null : new Date().toISOString(),
            recipient_count: targetUsers.length
          })
          .select()
          .single()

        if (messageError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create broadcast message'
          })
        }

        // Create message recipients
        const recipients = targetUsers.map(user => ({
          message_id: message.id,
          recipient_user_id: user.id,
          recipient_retailer_id: user.retailer_id,
          delivery_status: { in_app: 'delivered' }
        }))

        await supabase.from('message_recipients').insert(recipients)

        return {
          success: true,
          messageId: message.id,
          recipientCount: targetUsers.length
        }
      } catch (error) {
        console.error('Broadcast message error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send broadcast message'
        })
      }
    }),

  // Get messages with pagination and filtering
  getMessages: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      conversationId: z.string().uuid().optional(),
      messageType: z.enum(['individual', 'broadcast', 'template', 'notification']).optional(),
      status: z.enum(['draft', 'sent', 'delivered', 'read', 'failed']).optional(),
      senderId: z.string().uuid().optional(),
      fromDate: z.string().datetime().optional(),
      toDate: z.string().datetime().optional()
    }))
    .query(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }
      
      // Get user details from database
      const { data: userData } = await supabase
        .from('users')
        .select('role, retailer_id')
        .eq('id', user.id)
        .single()

      try {
        let query = supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id(id, username, full_name),
            template:message_templates(name, category),
            conversation:conversations(title, type),
            recipients:message_recipients(
              id,
              recipient_user_id,
              recipient_retailer_id,
              delivered_at,
              read_at,
              delivery_status
            )
          `)
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        // Apply filters based on user role
        if (userData?.role !== 'admin') {
          // Regular users can only see messages for their retailer
          query = query.or(`target_retailer_id.eq.${userData?.retailer_id},recipients.recipient_user_id.eq.${user.id}`)
        }

        // Apply additional filters
        if (input.conversationId) {
          query = query.eq('conversation_id', input.conversationId)
        }

        if (input.messageType) {
          query = query.eq('message_type', input.messageType)
        }

        if (input.status) {
          query = query.eq('status', input.status)
        }

        if (input.senderId) {
          query = query.eq('sender_id', input.senderId)
        }

        if (input.fromDate) {
          query = query.gte('created_at', input.fromDate)
        }

        if (input.toDate) {
          query = query.lte('created_at', input.toDate)
        }

        const { data: messages, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch messages'
          })
        }

        return {
          messages: messages || [],
          hasMore: messages?.length === input.limit
        }
      } catch (error) {
        console.error('Get messages error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch messages'
        })
      }
    }),

  // Create message template
  createTemplate: adminProcedure
    .input(messageTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }

      try {
        const { data: template, error } = await supabase
          .from('message_templates')
          .insert({
            ...input,
            created_by: user.id
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create template'
          })
        }

        return {
          success: true,
          template
        }
      } catch (error) {
        console.error('Create template error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create template'
        })
      }
    }),

  // Get message templates
  getTemplates: protectedProcedure
    .input(z.object({
      category: z.enum(['welcome', 'order_update', 'payment_reminder', 'promotion', 'system', 'custom']).optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input, ctx }) => {
      const { supabase } = ctx

      try {
        let query = supabase
          .from('message_templates')
          .select('*')
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        if (input.category) {
          query = query.eq('category', input.category)
        }

        if (input.isActive !== undefined) {
          query = query.eq('is_active', input.isActive)
        }

        const { data: templates, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch templates'
          })
        }

        return {
          templates: templates || [],
          hasMore: templates?.length === input.limit
        }
      } catch (error) {
        console.error('Get templates error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch templates'
        })
      }
    }),

  // Send notification
  sendNotification: adminProcedure
    .input(notificationSchema)
    .mutation(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }

      try {
        const { data: notification, error } = await supabase
          .from('notifications')
          .insert({
            ...input,
            sent_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send notification'
          })
        }

        // TODO: Integrate with external notification services (FCM, email, SMS, WhatsApp)
        // This would be handled by a background job service

        return {
          success: true,
          notificationId: notification.id
        }
      } catch (error) {
        console.error('Send notification error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send notification'
        })
      }
    }),

  // Get notifications for user
  getNotifications: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      type: z.enum(['push', 'email', 'sms', 'whatsapp', 'in_app']).optional(),
      unreadOnly: z.boolean().default(false)
    }))
    .query(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }
      
      // Get user details from database
      const { data: userData } = await supabase
        .from('users')
        .select('retailer_id')
        .eq('id', user.id)
        .single()

      try {
        let query = supabase
          .from('notifications')
          .select('*')
          .or(`recipient_user_id.eq.${user.id},recipient_retailer_id.eq.${userData?.retailer_id}`)
          .order('sent_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        if (input.type) {
          query = query.eq('type', input.type)
        }

        if (input.unreadOnly) {
          query = query.is('read_at', null)
        }

        const { data: notifications, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch notifications'
          })
        }

        return {
          notifications: notifications || [],
          hasMore: notifications?.length === input.limit
        }
      } catch (error) {
        console.error('Get notifications error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications'
        })
      }
    }),

  // Get retailer-specific messages
  getRetailerMessages: protectedProcedure
    .input(z.object({
      retailerId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      conversationId: z.string().uuid().optional()
    }))
    .query(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }
      
      // Get user details from database
      const { data: userData } = await supabase
        .from('users')
        .select('role, retailer_id')
        .eq('id', user.id)
        .single()

      // Check permissions
      if (userData?.role !== 'admin' && userData?.retailer_id !== input.retailerId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied'
        })
      }

      try {
        let query = supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id(id, username, full_name),
            template:message_templates(name, category),
            conversation:conversations(title, type),
            recipients:message_recipients!inner(
              id,
              delivered_at,
              read_at,
              delivery_status
            )
          `)
          .eq('recipients.recipient_retailer_id', input.retailerId)
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        if (input.conversationId) {
          query = query.eq('conversation_id', input.conversationId)
        }

        const { data: messages, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch retailer messages'
          })
        }

        return {
          messages: messages || [],
          hasMore: messages?.length === input.limit
        }
      } catch (error) {
        console.error('Get retailer messages error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch retailer messages'
        })
      }
    }),

  // Mark message as read
  markAsRead: protectedProcedure
    .input(z.object({
      messageId: z.string().uuid().optional(),
      notificationId: z.string().uuid().optional(),
      conversationId: z.string().uuid().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }

      try {
        const now = new Date().toISOString()

        if (input.messageId) {
          // Mark message recipient as read
          const { error } = await supabase
            .from('message_recipients')
            .update({ read_at: now })
            .eq('message_id', input.messageId)
            .eq('recipient_user_id', user.id)

          if (error) throw error
        }

        if (input.notificationId) {
          // Mark notification as read
          const { error } = await supabase
            .from('notifications')
            .update({ read_at: now })
            .eq('id', input.notificationId)
            .eq('recipient_user_id', user.id)

          if (error) throw error
        }

        if (input.conversationId) {
          // Mark all unread messages in conversation as read
          const { data: messageIds } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', input.conversationId)

          if (messageIds && messageIds.length > 0) {
            const { error } = await supabase
              .from('message_recipients')
              .update({ read_at: now })
              .in('message_id', messageIds.map(m => m.id))
              .eq('recipient_user_id', user.id)
              .is('read_at', null)

            if (error) throw error
          }
        }

        return { success: true }
      } catch (error) {
        console.error('Mark as read error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark as read'
        })
      }
    }),

  // Get conversations
  getConversations: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: z.enum(['active', 'closed', 'archived']).optional(),
      retailerId: z.string().uuid().optional()
    }))
    .query(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }
      
      // Get user details from database
      const { data: userData } = await supabase
        .from('users')
        .select('role, retailer_id')
        .eq('id', user.id)
        .single()

      try {
        let query = supabase
          .from('conversations')
          .select(`
            *,
            retailer:retailers(id, business_name),
            last_message:messages(
              id, subject, content, created_at, 
              sender:users!sender_id(username, full_name)
            )
          `)
          .order('last_message_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        // Apply permissions
        if (userData?.role !== 'admin') {
          query = query.eq('retailer_id', userData?.retailer_id)
        } else if (input.retailerId) {
          query = query.eq('retailer_id', input.retailerId)
        }

        if (input.status) {
          query = query.eq('status', input.status)
        }

        const { data: conversations, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch conversations'
          })
        }

        return {
          conversations: conversations || [],
          hasMore: conversations?.length === input.limit
        }
      } catch (error) {
        console.error('Get conversations error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch conversations'
        })
      }
    }),

  // Update template
  updateTemplate: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      ...messageTemplateSchema.partial().shape
    }))
    .mutation(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }

      try {
        const { id, ...updateData } = input

        // Check if template is system template
        const { data: existingTemplate } = await supabase
          .from('message_templates')
          .select('is_system')
          .eq('id', id)
          .single()

        if (existingTemplate?.is_system) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot modify system templates'
          })
        }

        const { data: template, error } = await supabase
          .from('message_templates')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update template'
          })
        }

        return {
          success: true,
          template
        }
      } catch (error) {
        console.error('Update template error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update template'
        })
      }
    }),

  // Delete template
  deleteTemplate: adminProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .mutation(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }

      try {
        // Check if template is system template
        const { data: template } = await supabase
          .from('message_templates')
          .select('is_system')
          .eq('id', input.id)
          .single()

        if (template?.is_system) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot delete system templates'
          })
        }

        const { error } = await supabase
          .from('message_templates')
          .delete()
          .eq('id', input.id)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete template'
          })
        }

        return { success: true }
      } catch (error) {
        console.error('Delete template error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete template'
        })
      }
    }),

  // Get message analytics
  getMessageAnalytics: adminProcedure
    .input(z.object({
      messageId: z.string().uuid().optional(),
      fromDate: z.string().datetime().optional(),
      toDate: z.string().datetime().optional(),
      messageType: z.enum(['individual', 'broadcast', 'template', 'notification']).optional()
    }))
    .query(async ({ input, ctx }) => {
      const { supabase, session } = ctx
      const user = session?.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        })
      }

      try {
        let query = supabase
          .from('message_analytics')
          .select(`
            *,
            message:messages(
              id, subject, message_type, status, created_at,
              sender:users!sender_id(username, full_name)
            )
          `)

        if (input.messageId) {
          query = query.eq('message_id', input.messageId)
        }

        if (input.fromDate || input.toDate || input.messageType) {
          query = query.select(`
            *,
            message:messages!inner(
              id, subject, message_type, status, created_at,
              sender:users!sender_id(username, full_name)
            )
          `)

          if (input.fromDate) {
            query = query.gte('message.created_at', input.fromDate)
          }

          if (input.toDate) {
            query = query.lte('message.created_at', input.toDate)
          }

          if (input.messageType) {
            query = query.eq('message.message_type', input.messageType)
          }
        }

        const { data: analytics, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch analytics'
          })
        }

        return {
          analytics: analytics || []
        }
      } catch (error) {
        console.error('Get analytics error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch analytics'
        })
      }
    })
})