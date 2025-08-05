import { z } from 'zod'
import { router, publicProcedure, adminProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Order item schema for creating/updating orders
const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
  tax_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  notes: z.string().optional(),
})

// Order creation schema
const createOrderSchema = z.object({
  retailer_id: z.string().uuid(),
  items: z.array(orderItemSchema).min(1),
  delivery_address: z.string().min(1),
  delivery_date: z.string().optional(),
  delivery_time_slot: z.string().optional(),
  payment_method: z.enum(['cash', 'credit']).default('cash'),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Order update schema
const updateOrderSchema = z.object({
  items: z.array(orderItemSchema).optional(),
  delivery_address: z.string().min(1).optional(),
  delivery_date: z.string().optional(),
  delivery_time_slot: z.string().optional(),
  payment_method: z.enum(['cash', 'credit']).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Status update schema
const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional(),
})

// Cancel order schema
const cancelOrderSchema = z.object({
  reason: z.string().min(1),
  notes: z.string().optional(),
})

// Helper function to generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `ORD-${timestamp.slice(-6)}-${random}`
}

// Helper function to create audit log
const createAuditLog = async (
  supabase: any,
  userId: string,
  action: string,
  resourceId: string,
  oldValues?: any,
  newValues?: any
) => {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: 'order',
    resource_id: resourceId,
    old_values: oldValues || null,
    new_values: newValues || null,
  })
}

export const ordersRouter = router({
  // Get all orders with filtering and pagination
  getAll: adminProcedure
    .input(z.object({
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
      retailer_id: z.string().uuid().optional(),
      payment_method: z.enum(['cash', 'credit']).optional(),
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      search: z.string().optional(), // Search by order number or retailer name
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().min(0).default(0),
      sortBy: z.enum(['created_at', 'order_number', 'total_amount', 'status', 'delivery_date']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const {
        status,
        retailer_id,
        payment_method,
        date_from,
        date_to,
        search,
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = input || {}

      let query = ctx.supabase
        .from('orders')
        .select(`
          *,
          retailers(id, business_name, phone, email),
          users(id, username, full_name)
        `, { count: 'exact' })

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }

      if (retailer_id) {
        query = query.eq('retailer_id', retailer_id)
      }

      if (payment_method) {
        query = query.eq('payment_method', payment_method)
      }

      if (date_from) {
        query = query.gte('created_at', date_from)
      }

      if (date_to) {
        query = query.lte('created_at', date_to)
      }

      if (search) {
        // Search in order number or join with retailers for business name search
        query = query.or(`order_number.ilike.%${search}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: data || [],
        total: count || 0,
        limit,
        offset,
      }
    }),

  // Get order by ID with full details
  getById: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      // Get order with retailer and user details
      const { data: order, error: orderError } = await ctx.supabase
        .from('orders')
        .select(`
          *,
          retailers(
            id, business_name, business_type, phone, email, address, 
            city, state, credit_limit, current_balance
          ),
          users(id, username, full_name)
        `)
        .eq('id', input)
        .single()

      if (orderError) {
        if (orderError.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: orderError.message,
        })
      }

      // Get order items with product details
      const { data: items, error: itemsError } = await ctx.supabase
        .from('order_items')
        .select(`
          *,
          products(
            id, sku, name_en, name_ar, name_fr, base_price, 
            stock_quantity, unit, images
          )
        `)
        .eq('order_id', input)
        .order('created_at', { ascending: true })

      if (itemsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: itemsError.message,
        })
      }

      // Get payments for this order
      const { data: payments } = await ctx.supabase
        .from('payments')
        .select('*')
        .eq('order_id', input)
        .order('created_at', { ascending: false })

      return {
        ...order,
        items: items || [],
        payments: payments || [],
      }
    }),

  // Create new order (manual order creation by admin)
  create: adminProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const { items, ...orderData } = input

      // Validate retailer exists and is active
      const { data: retailer, error: retailerError } = await ctx.supabase
        .from('retailers')
        .select('id, business_name, status, credit_limit, current_balance')
        .eq('id', input.retailer_id)
        .single()

      if (retailerError || !retailer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retailer not found',
        })
      }

      if (retailer.status !== 'active') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Retailer is not active',
        })
      }

      // Validate all products exist and calculate totals
      let subtotal = 0
      let taxAmount = 0
      let discountAmount = 0
      const validatedItems = []

      for (const item of items) {
        const { data: product, error: productError } = await ctx.supabase
          .from('products')
          .select('id, name_en, base_price, stock_quantity, is_active')
          .eq('id', item.product_id)
          .single()

        if (productError || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Product not found: ${item.product_id}`,
          })
        }

        if (!product.is_active) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Product is not active: ${product.name_en}`,
          })
        }

        if (product.stock_quantity < item.quantity) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Insufficient stock for product: ${product.name_en}`,
          })
        }

        const itemTotal = (item.quantity * item.unit_price) + item.tax_amount - item.discount_amount
        subtotal += item.quantity * item.unit_price
        taxAmount += item.tax_amount
        discountAmount += item.discount_amount

        validatedItems.push({
          ...item,
          total_price: itemTotal,
        })
      }

      const totalAmount = subtotal + taxAmount - discountAmount

      // Check credit limit if payment method is credit
      if (input.payment_method === 'credit') {
        const newBalance = retailer.current_balance - totalAmount
        if (newBalance < -retailer.credit_limit) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Order exceeds available credit limit',
          })
        }
      }

      // Create order
      const orderNumber = generateOrderNumber()
      const { data: newOrder, error: orderError } = await ctx.supabase
        .from('orders')
        .insert({
          ...orderData,
          order_number: orderNumber,
          created_by_user_id: ctx.session.user.id,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: orderError.message,
        })
      }

      // Create order items
      const orderItemsToInsert = validatedItems.map(item => ({
        ...item,
        order_id: newOrder.id,
      }))

      const { error: itemsError } = await ctx.supabase
        .from('order_items')
        .insert(orderItemsToInsert)

      if (itemsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: itemsError.message,
        })
      }

      // Update product stock
      for (const item of items) {
        const { error: stockError } = await ctx.supabase.rpc('decrement_stock', {
          product_id: item.product_id,
          quantity: item.quantity,
        })

        if (stockError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update stock for product: ${stockError.message}`,
          })
        }
      }

      // Update retailer balance if credit payment
      if (input.payment_method === 'credit') {
        await ctx.supabase
          .from('retailers')
          .update({
            current_balance: retailer.current_balance - totalAmount,
          })
          .eq('id', input.retailer_id)
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'order_created',
        newOrder.id,
        null,
        newOrder
      )

      return newOrder
    }),

  // Update order (only for pending orders)
  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateOrderSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Get current order
      const { data: currentOrder, error: fetchError } = await ctx.supabase
        .from('orders')
        .select('*')
        .eq('id', input.id)
        .single()

      if (fetchError || !currentOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      // Only allow updates for pending orders
      if (currentOrder.status !== 'pending') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Only pending orders can be updated',
        })
      }

      const { items, ...updateData } = input.data

      // If items are being updated, recalculate totals
      if (items) {
        // Restore stock from current items
        const { data: currentItems } = await ctx.supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', input.id)

        for (const item of currentItems || []) {
          const { error: stockError } = await ctx.supabase.rpc('increment_stock', {
            product_id: item.product_id,
            quantity: item.quantity,
          })

          if (stockError) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Failed to restore stock: ${stockError.message}`,
            })
          }
        }

        // Delete current items
        await ctx.supabase
          .from('order_items')
          .delete()
          .eq('order_id', input.id)

        // Validate and add new items (similar to create logic)
        let subtotal = 0
        let taxAmount = 0
        let discountAmount = 0
        const validatedItems = []

        for (const item of items) {
          const { data: product } = await ctx.supabase
            .from('products')
            .select('id, name_en, stock_quantity, is_active')
            .eq('id', item.product_id)
            .single()

          if (!product?.is_active) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message: `Product is not active`,
            })
          }

          if (product.stock_quantity < item.quantity) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message: `Insufficient stock`,
            })
          }

          const itemTotal = (item.quantity * item.unit_price) + item.tax_amount - item.discount_amount
          subtotal += item.quantity * item.unit_price
          taxAmount += item.tax_amount
          discountAmount += item.discount_amount

          validatedItems.push({
            ...item,
            total_price: itemTotal,
            order_id: input.id,
          })
        }

        // Insert new items
        await ctx.supabase
          .from('order_items')
          .insert(validatedItems)

        // Update stock
        for (const item of items) {
          const { error: stockError } = await ctx.supabase.rpc('decrement_stock', {
            product_id: item.product_id,
            quantity: item.quantity,
          })

          if (stockError) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Failed to update stock: ${stockError.message}`,
            })
          }
        }

        updateData.subtotal = subtotal
        updateData.tax_amount = taxAmount
        updateData.discount_amount = discountAmount
        updateData.total_amount = subtotal + taxAmount - discountAmount
      }

      // Update order
      const { data: updatedOrder, error: updateError } = await ctx.supabase
        .from('orders')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'order_updated',
        input.id,
        currentOrder,
        updatedOrder
      )

      return updatedOrder
    }),

  // Update order status
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      ...statusUpdateSchema.shape,
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, notes } = input

      // Get current order
      const { data: currentOrder, error: fetchError } = await ctx.supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !currentOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: [],
      }

      if (!validTransitions[currentOrder.status]?.includes(status)) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Invalid status transition from ${currentOrder.status} to ${status}`,
        })
      }

      // Update order status
      const updateData: any = { status }
      if (notes) {
        updateData.notes = notes
      }

      const { data: updatedOrder, error: updateError } = await ctx.supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Auto-create delivery when order is confirmed
      if (status === 'confirmed' && currentOrder.status === 'pending') {
        const deliveryNumber = `DEL-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        
        await ctx.supabase.from('deliveries').insert({
          order_id: id,
          delivery_number: deliveryNumber,
          status: 'pending',
          priority: 1,
          pickup_address: 'Warehouse Address', // Configure this
          delivery_address: currentOrder.delivery_address,
          delivery_contact: currentOrder.phone || 'Contact via retailer',
          cash_to_collect: currentOrder.payment_method === 'cash' ? currentOrder.total_amount : 0,
          delivery_fee: currentOrder.delivery_fee || 0,
          tracking_updates: [{
            status: 'pending',
            timestamp: new Date().toISOString(),
            notes: 'Delivery created automatically when order confirmed'
          }],
          metadata: {
            auto_created: true,
            order_number: currentOrder.order_number
          }
        })
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'order_status_updated',
        id,
        { status: currentOrder.status },
        { status, notes }
      )

      return updatedOrder
    }),

  // Cancel order
  cancel: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      ...cancelOrderSchema.shape,
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, reason, notes } = input

      // Get current order
      const { data: currentOrder, error: fetchError } = await ctx.supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !currentOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      // Check if order can be cancelled
      if (['delivered', 'cancelled'].includes(currentOrder.status)) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Order cannot be cancelled',
        })
      }

      // Restore stock if order was confirmed or processing
      if (['confirmed', 'processing', 'shipped'].includes(currentOrder.status)) {
        const { data: orderItems } = await ctx.supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', id)

        for (const item of orderItems || []) {
          const { error: stockError } = await ctx.supabase.rpc('increment_stock', {
            product_id: item.product_id,
            quantity: item.quantity,
          })

          if (stockError) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Failed to restore stock: ${stockError.message}`,
            })
          }
        }
      }

      // Restore retailer balance if credit payment
      if (currentOrder.payment_method === 'credit') {
        const { data: retailer } = await ctx.supabase
          .from('retailers')
          .select('current_balance')
          .eq('id', currentOrder.retailer_id)
          .single()

        if (retailer) {
          await ctx.supabase
            .from('retailers')
            .update({
              current_balance: retailer.current_balance + currentOrder.total_amount,
            })
            .eq('id', currentOrder.retailer_id)
        }
      }

      // Update order status and add cancellation details
      const { data: cancelledOrder, error: updateError } = await ctx.supabase
        .from('orders')
        .update({
          status: 'cancelled',
          metadata: {
            ...currentOrder.metadata,
            cancellation: {
              reason,
              notes,
              cancelled_at: new Date().toISOString(),
              cancelled_by: ctx.session.user.id,
            },
          },
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'order_cancelled',
        id,
        currentOrder,
        { reason, notes }
      )

      return cancelledOrder
    }),

  // Get order statistics for dashboard
  getOrderStats: adminProcedure
    .input(z.object({
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      retailer_id: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { date_from, date_to, retailer_id } = input || {}

      let baseQuery = ctx.supabase.from('orders')

      if (date_from) {
        baseQuery = baseQuery.gte('created_at', date_from)
      }

      if (date_to) {
        baseQuery = baseQuery.lte('created_at', date_to)
      }

      if (retailer_id) {
        baseQuery = baseQuery.eq('retailer_id', retailer_id)
      }

      // Get order counts by status
      const { data: statusCounts } = await baseQuery
        .select('status, total_amount')

      // Calculate statistics
      const totalOrders = statusCounts?.length || 0
      const totalRevenue = statusCounts?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      const statusBreakdown = {
        pending: statusCounts?.filter(o => o.status === 'pending').length || 0,
        confirmed: statusCounts?.filter(o => o.status === 'confirmed').length || 0,
        processing: statusCounts?.filter(o => o.status === 'processing').length || 0,
        shipped: statusCounts?.filter(o => o.status === 'shipped').length || 0,
        delivered: statusCounts?.filter(o => o.status === 'delivered').length || 0,
        cancelled: statusCounts?.filter(o => o.status === 'cancelled').length || 0,
      }

      // Get average order value
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Get recent order trend (last 7 days vs previous 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

      const { data: recentOrders } = await ctx.supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', fourteenDaysAgo.toISOString())

      const lastWeekOrders = recentOrders?.filter(o => 
        new Date(o.created_at) >= sevenDaysAgo
      ).length || 0

      const previousWeekOrders = recentOrders?.filter(o => 
        new Date(o.created_at) < sevenDaysAgo && new Date(o.created_at) >= fourteenDaysAgo
      ).length || 0

      const orderTrend = previousWeekOrders > 0 ? 
        ((lastWeekOrders - previousWeekOrders) / previousWeekOrders) * 100 : 0

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        statusBreakdown,
        orderTrend,
        recentOrdersCount: lastWeekOrders,
      }
    }),

  // Bulk update order status
  bulkUpdateStatus: adminProcedure
    .input(z.object({
      order_ids: z.array(z.string().uuid()).min(1).max(50),
      status: z.enum(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { order_ids, status, notes } = input

      // Get all orders to validate transitions
      const { data: orders, error: fetchError } = await ctx.supabase
        .from('orders')
        .select('id, status, retailer_id, total_amount, payment_method')
        .in('id', order_ids)

      if (fetchError || !orders) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: fetchError?.message || 'Failed to fetch orders',
        })
      }

      if (orders.length !== order_ids.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Some orders were not found',
        })
      }

      // Validate all status transitions
      const validTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: [],
      }

      const invalidOrders = orders.filter(order => 
        !validTransitions[order.status]?.includes(status)
      )

      if (invalidOrders.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Invalid status transitions for orders: ${invalidOrders.map(o => o.id).join(', ')}`,
        })
      }

      // Update all orders
      const updateData: any = { status }
      if (notes) {
        updateData.notes = notes
      }

      const { data: updatedOrders, error: updateError } = await ctx.supabase
        .from('orders')
        .update(updateData)
        .in('id', order_ids)
        .select()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Create audit logs for all orders
      for (const order of orders) {
        await createAuditLog(
          ctx.supabase,
          ctx.session.user.id,
          'order_bulk_status_updated',
          order.id,
          { status: order.status },
          { status, notes }
        )
      }

      return {
        updated_count: updatedOrders?.length || 0,
        updated_orders: updatedOrders || [],
      }
    }),

  // Get retailer's orders (for retail portal)
  getRetailerOrders: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().min(0).default(0),
      sortBy: z.enum(['created_at', 'order_number', 'total_amount', 'status']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }).optional())
    .query(async ({ ctx, input }) => {
      // Get user's retailer ID
      const { data: user } = await ctx.supabase
        .from('users')
        .select('retailer_id')
        .eq('id', ctx.session.user.id)
        .single()

      if (!user?.retailer_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User is not associated with a retailer',
        })
      }

      const {
        status,
        date_from,
        date_to,
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = input || {}

      let query = ctx.supabase
        .from('orders')
        .select('*, users(username, full_name)', { count: 'exact' })
        .eq('retailer_id', user.retailer_id)

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }

      if (date_from) {
        query = query.gte('created_at', date_from)
      }

      if (date_to) {
        query = query.lte('created_at', date_to)
      }

      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: data || [],
        total: count || 0,
        limit,
        offset,
      }
    }),
})