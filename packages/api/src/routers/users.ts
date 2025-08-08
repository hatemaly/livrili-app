import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { router, protectedProcedure, adminProcedure } from '../trpc'

export const usersRouter = router({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data: user, error } = await ctx.supabase
      .from('user_profiles')
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
        username: z.string().optional(),
        full_name: z.string().optional(),
        preferred_language: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
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

  // Admin: List all user profiles
  list: adminProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
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
        .from('user_profiles')
        .select('id')
        .eq('username', input.username)
        .single()

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username already exists',
        })
      }

      // Create auth user first using admin client
      const { data: authUser, error: authError } = await ctx.adminSupabase.auth.admin.createUser({
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

      // Create user profile record
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          username: input.username,
          full_name: input.full_name,
          role: input.role,
          retailer_id: input.retailer_id,
          is_active: input.is_active,
          preferred_language: input.preferred_language,
        })
        .select('*, retailers(id, business_name)')
        .single()

      if (error) {
        // Clean up auth user if profile creation fails
        await ctx.adminSupabase.auth.admin.deleteUser(authUser.user.id)
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
        // Get current user profile to check if retailer_id exists
        const { data: currentUser } = await ctx.supabase
          .from('user_profiles')
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
        .from('user_profiles')
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

  // Update own password (for authenticated users)
  updateOwnPassword: protectedProcedure
    .input(
      z.object({
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user profile exists in our system
      const { data: user, error: userError } = await ctx.supabase
        .from('user_profiles')
        .select('id, is_active')
        .eq('id', ctx.session.user.id)
        .single()

      if (userError || !user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      if (!user.is_active) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Account is inactive',
        })
      }

      // Update password using admin API (user is already authenticated)
      const { error: updateError } = await ctx.adminSupabase.auth.admin.updateUserById(
        ctx.session.user.id,
        { password: input.newPassword }
      )

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      return { success: true }
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
      // Update in Supabase Auth
      const { error: authError } = await ctx.adminSupabase.auth.admin.updateUserById(
        input.id,
        { password: input.password }
      )

      if (authError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: authError.message,
        })
      }

      // Note: We no longer need to store temp_password in user_profiles
      // The password is managed entirely by Supabase Auth

      if (dbError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update password in database',
        })
      }

      return { success: true }
    }),

  // Admin: Get user statistics
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const { data: users } = await ctx.supabase
        .from('user_profiles')
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
        .from('user_profiles')
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
  getByRetailer: adminProcedure
    .input(
      z.object({
        retailerId: z.string().uuid()
      })
    )
    .query(async ({ input, ctx }) => {
      const { data: users, error } = await ctx.supabase
        .from('user_profiles')
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