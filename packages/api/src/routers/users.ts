import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const usersRouter = router({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data: user, error } = await ctx.supabase
      .from('users')
      .select('*, retailers(*)')
      .eq('id', ctx.session.user.id)
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return user
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        full_name: z.string().optional(),
        phone: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .update(input)
        .eq('id', ctx.session.user.id)
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

  // Admin: List all users
  list: adminProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .select('*, retailers(id, business_name)')
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data || []
    }),

  // Admin: Create user
  create: adminProcedure
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(8),
        full_name: z.string().optional(),
        phone: z.string().optional(),
        role: z.enum(['admin', 'retailer', 'driver']),
        retailer_id: z.string().uuid().optional(),
        is_active: z.boolean().default(true),
        preferred_language: z.string().default('en'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate retailer_id if role is retailer or driver
      if ((input.role === 'retailer' || input.role === 'driver') && !input.retailer_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Retailer ID is required for retailer and driver roles',
        })
      }

      // Check if username is already taken
      const { data: existingUser } = await ctx.supabase
        .from('users')
        .select('id')
        .eq('username', input.username)
        .single()

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username already exists',
        })
      }

      // Create auth user first
      const { data: authUser, error: authError } = await ctx.supabase.auth.admin.createUser({
        email: `${input.username}@temp.local`, // Temporary email
        password: input.password,
        email_confirm: true,
      })

      if (authError || !authUser.user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: authError?.message || 'Failed to create auth user',
        })
      }

      // Create user record
      const { data, error } = await ctx.supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          username: input.username,
          full_name: input.full_name,
          phone: input.phone,
          role: input.role,
          retailer_id: input.retailer_id,
          is_active: input.is_active,
          preferred_language: input.preferred_language,
        })
        .select('*, retailers(id, business_name)')
        .single()

      if (error) {
        // Clean up auth user if profile creation fails
        await ctx.supabase.auth.admin.deleteUser(authUser.user.id)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Admin: Update user
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          full_name: z.string().optional(),
          phone: z.string().optional(),
          role: z.enum(['admin', 'retailer', 'driver']).optional(),
          retailer_id: z.string().uuid().optional(),
          is_active: z.boolean().optional(),
          preferred_language: z.string().optional(),
          metadata: z.record(z.any()).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate retailer_id if role is being changed to retailer or driver
      if (input.data.role && (input.data.role === 'retailer' || input.data.role === 'driver') && !input.data.retailer_id) {
        // Get current user to check if retailer_id exists
        const { data: currentUser } = await ctx.supabase
          .from('users')
          .select('retailer_id')
          .eq('id', input.id)
          .single()

        if (!currentUser?.retailer_id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Retailer ID is required for retailer and driver roles',
          })
        }
      }

      const { data, error } = await ctx.supabase
        .from('users')
        .update(input.data)
        .eq('id', input.id)
        .select('*, retailers(id, business_name)')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Admin: Update user password
  updatePassword: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase.auth.admin.updateUserById(
        input.id,
        { password: input.password }
      )

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // Admin: Get user statistics
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const { data: users } = await ctx.supabase
        .from('users')
        .select('role, is_active')

      const stats = {
        total: users?.length || 0,
        active: users?.filter(u => u.is_active).length || 0,
        inactive: users?.filter(u => !u.is_active).length || 0,
        byRole: {
          admin: users?.filter(u => u.role === 'admin').length || 0,
          retailer: users?.filter(u => u.role === 'retailer').length || 0,
          driver: users?.filter(u => u.role === 'driver').length || 0,
        },
      }

      return stats
    }),

  // Get all users with pagination
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        role: z.enum(['admin', 'retailer', 'driver']).optional(),
        isActive: z.boolean().optional(),
        retailerId: z.string().uuid().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase
        .from('users')
        .select('*, retailers(id, business_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.role) {
        query = query.eq('role', input.role)
      }

      if (input.isActive !== undefined) {
        query = query.eq('is_active', input.isActive)
      }

      if (input.retailerId) {
        query = query.eq('retailer_id', input.retailerId)
      }

      const { data: users, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        users: users || [],
        total: count || 0,
        hasMore: (input.offset + input.limit) < (count || 0)
      }
    }),

  // Get users by retailer
  getByRetailer: protectedProcedure
    .input(
      z.object({
        retailerId: z.string().uuid()
      })
    )
    .query(async ({ input, ctx }) => {
      const { data: users, error } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('retailer_id', input.retailerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        users: users || []
      }
    }),
})