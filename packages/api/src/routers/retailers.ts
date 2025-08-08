import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const retailerSchema = z.object({
  business_name: z.string().min(1),
  business_type: z.string().optional(),
  registration_number: z.string().optional(),
  tax_number: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
  documents: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    uploaded_at: z.string(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
})

export const retailersRouter = router({
  // List retailers with filters and pagination
  list: adminProcedure
    .input(z.object({
      status: z.enum(['pending', 'active', 'suspended', 'rejected']).optional(),
      search: z.string().optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().min(0).default(0),
      sortBy: z.enum(['created_at', 'business_name', 'status', 'credit_limit']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const {
        status,
        search,
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = input || {}

      let query = ctx.supabase
        .from('retailers')
        .select('*', { count: 'exact' })

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }

      if (search) {
        query = query.or(`business_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,registration_number.ilike.%${search}%`)
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

  // Get retailer by ID
  getById: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { data: retailer, error: retailerError } = await ctx.supabase
        .from('retailers')
        .select('*')
        .eq('id', input)
        .single()

      if (retailerError) {
        if (retailerError.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Retailer not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: retailerError.message,
        })
      }

      // Get associated user profiles
      const { data: users } = await ctx.supabase
        .from('user_profiles')
        .select('id, username, full_name, role, is_active')
        .eq('retailer_id', input)

      // Get recent orders
      const { data: recentOrders } = await ctx.supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at')
        .eq('retailer_id', input)
        .order('created_at', { ascending: false })
        .limit(5)

      // Get payment history
      const { data: recentPayments } = await ctx.supabase
        .from('payments')
        .select('id, amount, payment_type, payment_method, status, created_at')
        .eq('retailer_id', input)
        .order('created_at', { ascending: false })
        .limit(5)

      return {
        ...retailer,
        users: users || [],
        recentOrders: recentOrders || [],
        recentPayments: recentPayments || [],
      }
    }),

  // Get retailer statistics
  getStats: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      // Get order statistics
      const { data: orderStats } = await ctx.supabase
        .from('orders')
        .select('status, total_amount')
        .eq('retailer_id', input)

      const totalOrders = orderStats?.length || 0
      const totalRevenue = orderStats?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const pendingOrders = orderStats?.filter(o => o.status === 'pending').length || 0
      const deliveredOrders = orderStats?.filter(o => o.status === 'delivered').length || 0

      // Get payment statistics
      const { data: paymentStats } = await ctx.supabase
        .from('payments')
        .select('amount, status')
        .eq('retailer_id', input)
        .eq('status', 'completed')

      const totalPaid = paymentStats?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

      // Get current balance from retailer
      const { data: retailer } = await ctx.supabase
        .from('retailers')
        .select('current_balance, credit_limit')
        .eq('id', input)
        .single()

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        totalPaid,
        currentBalance: retailer?.current_balance || 0,
        creditLimit: retailer?.credit_limit || 0,
        creditUsed: (retailer?.credit_limit || 0) - (retailer?.current_balance || 0),
      }
    }),

  // Create retailer
  create: adminProcedure
    .input(retailerSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('retailers')
        .insert({
          ...input,
          status: 'pending',
          current_balance: 0,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Update retailer
  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: retailerSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('retailers')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Retailer not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Update retailer status
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['pending', 'active', 'suspended', 'rejected']),
      rejection_reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {
        status: input.status,
      }

      if (input.status === 'active') {
        updateData.approval_date = new Date().toISOString()
        updateData.approved_by = ctx.session?.user.id
      }

      if (input.status === 'rejected' && input.rejection_reason) {
        updateData.rejection_reason = input.rejection_reason
      }

      const { data, error } = await ctx.supabase
        .from('retailers')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Retailer not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // If approved, activate all associated users
      if (input.status === 'active') {
        await ctx.supabase
          .from('user_profiles')
          .update({ is_active: true })
          .eq('retailer_id', input.id)
      }

      return data
    }),

  // Update credit limit
  updateCreditLimit: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      credit_limit: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('retailers')
        .update({ credit_limit: input.credit_limit })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Retailer not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get retailer for current user
  getCurrentUserRetailer: adminProcedure
    .query(async ({ ctx }) => {
      const { data: user } = await ctx.supabase
        .from('user_profiles')
        .select('retailer_id')
        .eq('id', ctx.session.user.id)
        .single()

      if (!user?.retailer_id) {
        return null
      }

      const { data: retailer, error } = await ctx.supabase
        .from('retailers')
        .select('*')
        .eq('id', user.retailer_id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return retailer
    }),

  // Get all retailers (simplified for selectors)
  getAll: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(1000).default(100),
      offset: z.number().min(0).default(0),
      status: z.enum(['pending', 'active', 'suspended', 'rejected']).optional(),
      search: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('retailers')
        .select('id, business_name, status, email, phone, credit_limit, current_balance', { count: 'exact' })
        .order('business_name', { ascending: true })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) {
        query = query.eq('status', input.status)
      }

      if (input.search) {
        query = query.or(`business_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        retailers: data || [],
        total: count || 0,
        hasMore: (input.offset + input.limit) < (count || 0)
      }
    }),
})