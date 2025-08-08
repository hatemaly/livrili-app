import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { getServiceSupabase } from '@livrili/database'
import type { 
  Payment, 
  PaymentMethod, 
  PaymentType, 
  PaymentStatus,
  Retailer,
  Order 
} from '@livrili/database/types'

// Input validation schemas
const PaymentFiltersSchema = z.object({
  retailer_id: z.string().uuid().optional(),
  payment_method: z.enum(['cash', 'credit']).optional(),
  payment_type: z.enum(['order_payment', 'credit_payment']).optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  collected_by_user_id: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['created_at', 'amount', 'collected_at', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

const RecordPaymentSchema = z.object({
  order_id: z.string().uuid().optional(),
  retailer_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_type: z.enum(['order_payment', 'credit_payment']),
  payment_method: z.enum(['cash', 'credit']),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

const UpdateRetailerBalanceSchema = z.object({
  retailer_id: z.string().uuid(),
  adjustment_amount: z.number(),
  adjustment_type: z.enum(['credit', 'debit', 'credit_limit_change']),
  reason: z.string(),
  notes: z.string().optional()
})

const CashReconciliationSchema = z.object({
  user_id: z.string().uuid(),
  expected_amount: z.number(),
  actual_amount: z.number(),
  date: z.string(),
  discrepancy_reason: z.string().optional(),
  notes: z.string().optional()
})

const InvoiceGenerationSchema = z.object({
  retailer_id: z.string().uuid(),
  order_ids: z.array(z.string().uuid()).optional(),
  date_from: z.string(),
  date_to: z.string(),
  include_pending: z.boolean().default(false)
})

// Financial calculations utility functions
const calculateCreditUsed = (creditLimit: number, currentBalance: number): number => {
  return Math.max(0, creditLimit + currentBalance)
}

const calculateAvailableCredit = (creditLimit: number, currentBalance: number): number => {
  return Math.max(0, creditLimit + currentBalance)
}

const isOverdue = (dueDate: string, gracePeriodDays: number = 30): boolean => {
  const due = new Date(dueDate)
  const grace = new Date()
  grace.setDate(grace.getDate() - gracePeriodDays)
  return due < grace
}

export const paymentsRouter = router({
  // Test endpoint for debugging
  test: adminProcedure
    .query(async () => {
      return {
        message: 'Payments router is working!',
        timestamp: new Date().toISOString()
      }
    }),
  // Get all payments with filtering
  getAll: adminProcedure
    .input(PaymentFiltersSchema)
    .query(async ({ input, ctx }) => {
      const supabase = getServiceSupabase()

      // Build query with filters
      let query = supabase
        .from('payments')
        .select(`
          *,
          retailer:retailer_id(id, business_name),
          collected_by_user:collected_by_user_id(id, username, full_name),
          order:order_id(id, order_number, total_amount, status)
        `)

      // Apply filters
      if (input.retailer_id) {
        query = query.eq('retailer_id', input.retailer_id)
      }
      if (input.payment_method) {
        query = query.eq('payment_method', input.payment_method)
      }
      if (input.payment_type) {
        query = query.eq('payment_type', input.payment_type)
      }
      if (input.status) {
        query = query.eq('status', input.status)
      }
      if (input.collected_by_user_id) {
        query = query.eq('collected_by_user_id', input.collected_by_user_id)
      }
      if (input.date_from) {
        query = query.gte('created_at', input.date_from)
      }
      if (input.date_to) {
        query = query.lte('created_at', input.date_to)
      }

      // Apply search
      if (input.search) {
        query = query.or(`
          reference_number.ilike.%${input.search}%,
          retailer.business_name.ilike.%${input.search}%,
          notes.ilike.%${input.search}%
        `)
      }

      // Apply sorting and pagination
      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data: payments, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch payments: ${error.message}`
        })
      }

      return {
        items: payments || [],
        total: count || 0,
        limit: input.limit,
        offset: input.offset
      }
    }),

  // Get payment by ID with details
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = getServiceSupabase()

      const { data: payment, error } = await supabase
        .from('payments')
        .select(`
          *,
          retailer:retailer_id(
            id, business_name, credit_limit, current_balance, phone, email
          ),
          collected_by_user:collected_by_user_id(
            id, username, full_name
          ),
          order:order_id(
            id, order_number, total_amount, status, delivery_address,
            created_at, delivery_date
          )
        `)
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found'
        })
      }

      return payment
    }),

  // Record a new payment
  recordPayment: adminProcedure
    .input(RecordPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = getServiceSupabase()

      // Validate order exists if provided
      if (input.order_id) {
        const { data: order } = await supabase
          .from('orders')
          .select('id, retailer_id, total_amount, status')
          .eq('id', input.order_id)
          .single()

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found'
          })
        }

        if (order.retailer_id !== input.retailer_id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Order does not belong to specified retailer'
          })
        }
      }

      // Validate retailer exists
      const { data: retailer } = await supabase
        .from('retailers')
        .select('id, current_balance, credit_limit')
        .eq('id', input.retailer_id)
        .single()

      if (!retailer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retailer not found'
        })
      }

      // Start transaction
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: input.order_id,
          retailer_id: input.retailer_id,
          amount: input.amount,
          payment_type: input.payment_type,
          payment_method: input.payment_method,
          reference_number: input.reference_number,
          collected_by_user_id: ctx.user.id,
          collected_at: new Date().toISOString(),
          status: 'completed',
          notes: input.notes,
          metadata: input.metadata || {}
        })
        .select()
        .single()

      if (paymentError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to record payment: ${paymentError.message}`
        })
      }

      // Update retailer balance
      const newBalance = retailer.current_balance + input.amount
      
      const { error: balanceError } = await supabase
        .from('retailers')
        .update({ 
          current_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.retailer_id)

      if (balanceError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update retailer balance: ${balanceError.message}`
        })
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        user_id: ctx.user.id,
        action: 'payment_recorded',
        resource_type: 'payment',
        resource_id: payment.id,
        new_values: {
          payment_amount: input.amount,
          payment_type: input.payment_type,
          retailer_id: input.retailer_id,
          new_balance: newBalance
        }
      })

      return payment
    }),

  // Daily cash reconciliation
  reconcileCash: adminProcedure
    .input(CashReconciliationSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = getServiceSupabase()

      // Get cash payments for the day
      const startDate = new Date(input.date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(input.date)
      endDate.setHours(23, 59, 59, 999)

      const { data: cashPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('payment_method', 'cash')
        .eq('collected_by_user_id', input.user_id)
        .gte('collected_at', startDate.toISOString())
        .lte('collected_at', endDate.toISOString())
        .eq('status', 'completed')

      if (paymentsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch cash payments: ${paymentsError.message}`
        })
      }

      const totalCashCollected = cashPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
      const discrepancy = input.actual_amount - totalCashCollected
      const reconcilationStatus = Math.abs(discrepancy) < 0.01 ? 'balanced' : 'discrepancy'

      // Record reconciliation
      const reconciliation = {
        user_id: input.user_id,
        reconciliation_date: input.date,
        expected_amount: totalCashCollected,
        reported_amount: input.actual_amount,
        discrepancy_amount: discrepancy,
        status: reconcilationStatus,
        discrepancy_reason: input.discrepancy_reason,
        notes: input.notes,
        reconciled_by: ctx.user.id,
        created_at: new Date().toISOString()
      }

      // Store in metadata for now (could create separate reconciliation table)
      await supabase.from('audit_logs').insert({
        user_id: ctx.user.id,
        action: 'cash_reconciliation',
        resource_type: 'cash_reconciliation',
        new_values: reconciliation
      })

      return {
        ...reconciliation,
        cash_payments_count: cashPayments?.length || 0
      }
    }),

  // Get cash collection report for a user/date range
  getCashCollectionReport: adminProcedure
    .input(z.object({
      user_id: z.string().uuid().optional(),
      date_from: z.string(),
      date_to: z.string()
    }))
    .query(async ({ input }) => {
      const supabase = getServiceSupabase()

      let query = supabase
        .from('payments')
        .select(`
          *,
          retailer:retailer_id(business_name),
          collected_by_user:collected_by_user_id(username, full_name),
          order:order_id(order_number)
        `)
        .eq('payment_method', 'cash')
        .eq('status', 'completed')
        .gte('collected_at', input.date_from)
        .lte('collected_at', input.date_to)

      if (input.user_id) {
        query = query.eq('collected_by_user_id', input.user_id)
      }

      const { data: payments, error } = await query.order('collected_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch cash collection report: ${error.message}`
        })
      }

      const totalAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
      const paymentsByUser = payments?.reduce((acc, p) => {
        const userId = p.collected_by_user?.username || 'Unknown'
        if (!acc[userId]) {
          acc[userId] = { count: 0, amount: 0, payments: [] }
        }
        acc[userId].count++
        acc[userId].amount += p.amount
        acc[userId].payments.push(p)
        return acc
      }, {} as Record<string, any>) || {}

      return {
        payments: payments || [],
        summary: {
          total_amount: totalAmount,
          payment_count: payments?.length || 0,
          by_user: paymentsByUser
        }
      }
    }),

  // Update retailer balance (credit/debit adjustments)
  updateRetailerBalance: adminProcedure
    .input(UpdateRetailerBalanceSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = getServiceSupabase()

      // Get current retailer data
      const { data: retailer, error: retailerError } = await supabase
        .from('retailers')
        .select('current_balance, credit_limit, business_name')
        .eq('id', input.retailer_id)
        .single()

      if (retailerError || !retailer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retailer not found'
        })
      }

      let newBalance = retailer.current_balance
      let newCreditLimit = retailer.credit_limit

      // Apply adjustment based on type
      switch (input.adjustment_type) {
        case 'credit':
          newBalance += input.adjustment_amount
          break
        case 'debit':
          newBalance -= input.adjustment_amount
          break
        case 'credit_limit_change':
          newCreditLimit = input.adjustment_amount
          break
      }

      // Update retailer
      const updateData: any = { updated_at: new Date().toISOString() }
      if (input.adjustment_type !== 'credit_limit_change') {
        updateData.current_balance = newBalance
      } else {
        updateData.credit_limit = newCreditLimit
      }

      const { error: updateError } = await supabase
        .from('retailers')
        .update(updateData)
        .eq('id', input.retailer_id)

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update retailer: ${updateError.message}`
        })
      }

      // Create adjustment record as payment entry
      if (input.adjustment_type !== 'credit_limit_change') {
        await supabase.from('payments').insert({
          retailer_id: input.retailer_id,
          amount: input.adjustment_type === 'credit' ? input.adjustment_amount : -input.adjustment_amount,
          payment_type: 'credit_payment',
          payment_method: 'credit',
          status: 'completed',
          collected_by_user_id: ctx.user.id,
          collected_at: new Date().toISOString(),
          reference_number: `ADJ-${Date.now()}`,
          notes: `${input.adjustment_type.toUpperCase()}: ${input.reason}${input.notes ? ' - ' + input.notes : ''}`,
          metadata: {
            adjustment_type: input.adjustment_type,
            reason: input.reason,
            previous_balance: retailer.current_balance
          }
        })
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        user_id: ctx.user.id,
        action: 'balance_adjustment',
        resource_type: 'retailer',
        resource_id: input.retailer_id,
        old_values: {
          current_balance: retailer.current_balance,
          credit_limit: retailer.credit_limit
        },
        new_values: {
          current_balance: newBalance,
          credit_limit: newCreditLimit,
          adjustment_type: input.adjustment_type,
          adjustment_amount: input.adjustment_amount,
          reason: input.reason
        }
      })

      return {
        previous_balance: retailer.current_balance,
        new_balance: newBalance,
        previous_credit_limit: retailer.credit_limit,
        new_credit_limit: newCreditLimit
      }
    }),

  // Get retailer financial details
  getRetailerFinancials: adminProcedure
    .input(z.object({ 
      retailer_id: z.string().uuid(),
      include_payment_history: z.boolean().default(true),
      payment_limit: z.number().default(10)
    }))
    .query(async ({ input }) => {
      const supabase = getServiceSupabase()

      // Get retailer data
      const { data: retailer, error: retailerError } = await supabase
        .from('retailers')
        .select('*')
        .eq('id', input.retailer_id)
        .single()

      if (retailerError || !retailer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retailer not found'
        })
      }

      let recentPayments = []
      if (input.include_payment_history) {
        const { data: payments } = await supabase
          .from('payments')
          .select(`
            *,
            collected_by_user:collected_by_user_id(username, full_name),
            order:order_id(order_number)
          `)
          .eq('retailer_id', input.retailer_id)
          .order('created_at', { ascending: false })
          .limit(input.payment_limit)

        recentPayments = payments || []
      }

      // Calculate financial metrics
      const creditUsed = calculateCreditUsed(retailer.credit_limit, retailer.current_balance)
      const availableCredit = calculateAvailableCredit(retailer.credit_limit, retailer.current_balance)
      const creditUtilization = retailer.credit_limit > 0 ? (creditUsed / retailer.credit_limit) * 100 : 0

      return {
        retailer,
        financial_summary: {
          current_balance: retailer.current_balance,
          credit_limit: retailer.credit_limit,
          credit_used: creditUsed,
          available_credit: availableCredit,
          credit_utilization_percentage: creditUtilization,
          is_overlimit: retailer.current_balance < -retailer.credit_limit,
          days_since_last_payment: recentPayments.length > 0 ? 
            Math.floor((Date.now() - new Date(recentPayments[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
            null
        },
        recent_payments: recentPayments
      }
    }),

  // Get overdue payments
  getOverduePayments: adminProcedure
    .input(z.object({
      grace_period_days: z.number().default(30),
      limit: z.number().default(50)
    }))
    .query(async ({ input, ctx }) => {
      // Check if user is admin
      const { data: userData } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.user.id)
        .single()
      
      if (userData?.role !== 'admin') {
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'Admin access required for overdue payments' 
        })
      }

      const supabase = getServiceSupabase()

      // Get orders with outstanding balances (simplified - would need more complex logic for partial payments)
      const gracePeriodDate = new Date()
      gracePeriodDate.setDate(gracePeriodDate.getDate() - input.grace_period_days)

      const { data: overdueOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          retailer:retailer_id(id, business_name, phone, current_balance, credit_limit),
          payments:payments(amount, status)
        `)
        .eq('payment_method', 'credit')
        .in('status', ['delivered', 'confirmed'])
        .lt('delivery_date', gracePeriodDate.toISOString())
        .limit(input.limit)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch overdue payments: ${error.message}`
        })
      }

      // Filter orders with outstanding balances
      const overdueWithBalances = overdueOrders?.filter(order => {
        const totalPaid = order.payments?.reduce((sum: number, p: any) => 
          p.status === 'completed' ? sum + p.amount : sum, 0) || 0
        return totalPaid < order.total_amount
      }).map(order => {
        const totalPaid = order.payments?.reduce((sum: number, p: any) => 
          p.status === 'completed' ? sum + p.amount : sum, 0) || 0
        const outstandingAmount = order.total_amount - totalPaid
        const daysPastDue = Math.floor((Date.now() - new Date(order.delivery_date).getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          ...order,
          total_paid: totalPaid,
          outstanding_amount: outstandingAmount,
          days_past_due: daysPastDue
        }
      }) || []

      const totalOverdueAmount = overdueWithBalances.reduce((sum, order) => sum + order.outstanding_amount, 0)
      
      return {
        overdue_orders: overdueWithBalances,
        summary: {
          total_overdue_amount: totalOverdueAmount,
          overdue_count: overdueWithBalances.length,
          average_days_overdue: overdueWithBalances.length > 0 ? 
            overdueWithBalances.reduce((sum, order) => sum + order.days_past_due, 0) / overdueWithBalances.length : 0
        }
      }
    }),

  // Generate invoice (basic implementation)
  generateInvoice: adminProcedure
    .input(InvoiceGenerationSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = getServiceSupabase()

      // Get retailer
      const { data: retailer } = await supabase
        .from('retailers')
        .select('*')
        .eq('id', input.retailer_id)
        .single()

      if (!retailer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Retailer not found'
        })
      }

      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:product_id(name_en, sku)),
          payments:payments(amount, status, created_at)
        `)
        .eq('retailer_id', input.retailer_id)
        .gte('created_at', input.date_from)
        .lte('created_at', input.date_to)

      if (input.order_ids && input.order_ids.length > 0) {
        query = query.in('id', input.order_ids)
      }

      if (!input.include_pending) {
        query = query.in('status', ['confirmed', 'processing', 'shipped', 'delivered'])
      }

      const { data: orders, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch orders for invoice: ${error.message}`
        })
      }

      // Calculate invoice totals
      const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        retailer,
        orders: orders || [],
        date_from: input.date_from,
        date_to: input.date_to,
        generated_by: ctx.user.id,
        generated_at: new Date().toISOString(),
        totals: {
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          total_paid: 0,
          balance_due: 0
        }
      }

      // Calculate totals
      orders?.forEach(order => {
        invoiceData.totals.subtotal += order.subtotal
        invoiceData.totals.tax_amount += order.tax_amount
        invoiceData.totals.total_amount += order.total_amount
        
        const orderPaid = order.payments?.reduce((sum: number, p: any) => 
          p.status === 'completed' ? sum + p.amount : sum, 0) || 0
        invoiceData.totals.total_paid += orderPaid
      })

      invoiceData.totals.balance_due = invoiceData.totals.total_amount - invoiceData.totals.total_paid

      // Log invoice generation
      await supabase.from('audit_logs').insert({
        user_id: ctx.user.id,
        action: 'invoice_generated',
        resource_type: 'invoice',
        new_values: {
          invoice_number: invoiceData.invoice_number,
          retailer_id: input.retailer_id,
          order_count: orders?.length || 0,
          total_amount: invoiceData.totals.total_amount
        }
      })

      return invoiceData
    }),

  // Get financial summary/dashboard data
  getFinancialSummary: adminProcedure
    .input(z.object({
      date_from: z.string().optional(),
      date_to: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Check if user is admin
        const { data: userData } = await ctx.supabase
          .from('users')
          .select('role')
          .eq('id', ctx.session.user.id)
          .single()
        
        if (userData?.role !== 'admin') {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'Admin access required for financial summary' 
          })
        }

        const supabase = getServiceSupabase()

        const dateFrom = input.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const dateTo = input.date_to || new Date().toISOString()

        // Get payment statistics
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, payment_method, payment_type, status, created_at')
          .gte('created_at', dateFrom)
          .lte('created_at', dateTo)

        if (paymentsError) {
          console.error('Payment statistics error:', paymentsError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch payment statistics: ${paymentsError.message}`
          })
        }

        // Get retailer statistics
        const { data: retailers, error: retailersError } = await supabase
          .from('retailers')
          .select('current_balance, credit_limit, status')

        if (retailersError) {
          console.error('Retailer statistics error:', retailersError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch retailer statistics: ${retailersError.message}`
          })
        }

      const paymentStats = {
        total_cash_collected: 0,
        total_credit_payments: 0,
        total_payments: 0,
        payment_count: payments?.length || 0,
        cash_payment_count: 0,
        credit_payment_count: 0
      }

      payments?.forEach(payment => {
        if (payment.status === 'completed') {
          paymentStats.total_payments += payment.amount
          
          if (payment.payment_method === 'cash') {
            paymentStats.total_cash_collected += payment.amount
            paymentStats.cash_payment_count++
          } else {
            paymentStats.total_credit_payments += payment.amount
            paymentStats.credit_payment_count++
          }
        }
      })

      const retailerStats = {
        total_retailers: retailers?.length || 0,
        active_retailers: retailers?.filter(r => r.status === 'active').length || 0,
        total_credit_limit: retailers?.reduce((sum, r) => sum + r.credit_limit, 0) || 0,
        total_outstanding_balance: retailers?.reduce((sum, r) => sum + Math.min(0, r.current_balance), 0) || 0,
        total_credit_used: 0
      }

      retailers?.forEach(retailer => {
        if (retailer.status === 'active') {
          retailerStats.total_credit_used += calculateCreditUsed(retailer.credit_limit, retailer.current_balance)
        }
      })

      return {
        period: {
          from: dateFrom,
          to: dateTo
        },
        payment_statistics: paymentStats,
        retailer_statistics: retailerStats,
        cash_flow: {
          total_inflow: paymentStats.total_payments,
          cash_inflow: paymentStats.total_cash_collected,
          credit_inflow: paymentStats.total_credit_payments
        }
      }
    } catch (error) {
        console.error('Financial summary error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate financial summary: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    })
})