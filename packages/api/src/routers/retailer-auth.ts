import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const retailerAuthRouter = router({
  // Login using the admin-managed password system
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
        deviceInfo: z.object({
          deviceType: z.string().optional(),
          browser: z.string().optional(),
          os: z.string().optional(),
          screen: z.object({
            width: z.number().optional(),
            height: z.number().optional(),
          }).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Extract device information from request
        const userAgent = ctx.headers?.get('user-agent') || 'Unknown'
        const ipAddress = ctx.headers?.get('x-forwarded-for') || 
                         ctx.headers?.get('x-real-ip') || 
                         '127.0.0.1'

        // Prepare device info JSONB
        const deviceInfo = {
          ...input.deviceInfo,
          timestamp: new Date().toISOString(),
        }

        // Call the authenticate_user SQL function
        const { data, error } = await ctx.supabase.rpc('authenticate_user', {
          p_username: input.username,
          p_password: input.password,
          p_device_info: deviceInfo,
          p_ip_address: ipAddress,
          p_user_agent: userAgent,
        })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Authentication service error',
            cause: error,
          })
        }

        const result = data as {
          success: boolean
          error?: string
          token?: string
          user?: {
            id: string
            username: string
            full_name: string
            role: string
            retailer_id: string
            preferred_language: string
            must_change_password?: boolean
          }
          locked_until?: string
          attempts_remaining?: number
        }

        if (!result.success) {
          // Handle different error types
          if (result.locked_until) {
            throw new TRPCError({
              code: 'TOO_MANY_REQUESTS',
              message: result.error || 'Account is locked',
              cause: { locked_until: result.locked_until },
            })
          }

          if (result.attempts_remaining !== undefined) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: result.error || 'Invalid credentials',
              cause: { attempts_remaining: result.attempts_remaining },
            })
          }

          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: result.error || 'Invalid credentials',
          })
        }

        // Return successful login response
        return {
          success: true,
          token: result.token!,
          user: result.user!,
          mustChangePassword: result.user?.must_change_password || false,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Login error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Login failed due to server error',
        })
      }
    }),

  // Logout - invalidate the current token
  logout: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, 'Token is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { data, error } = await ctx.supabase.rpc('logout_user', {
          p_token: input.token,
        })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Logout service error',
            cause: error,
          })
        }

        const result = data as {
          success: boolean
          message?: string
        }

        return {
          success: result.success,
          message: result.message || 'Logged out successfully',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Logout error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Logout failed due to server error',
        })
      }
    }),

  // Validate auth token
  validateToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, 'Token is required'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { data, error } = await ctx.supabase.rpc('validate_auth_token', {
          p_token: input.token,
        })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Token validation service error',
            cause: error,
          })
        }

        const result = data as {
          valid: boolean
          error?: string
          user?: {
            id: string
            username: string
            full_name: string
            role: string
            retailer_id: string
            preferred_language: string
          }
        }

        if (!result.valid) {
          return {
            valid: false,
            error: result.error || 'Invalid token',
          }
        }

        return {
          valid: true,
          user: result.user!,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Token validation error:', error)
        return {
          valid: false,
          error: 'Token validation failed',
        }
      }
    }),

  // Get current session using the context session
  getSession: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session || !ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No active session',
      })
    }

    try {
      // Get additional user info from our users table
      const { data: userData, error } = await ctx.supabase
        .from('users')
        .select('id, username, full_name, role, retailer_id, preferred_language, must_change_password')
        .eq('id', ctx.user.id)
        .single()

      if (error || !userData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User data not found',
          cause: error,
        })
      }

      return {
        user: {
          id: userData.id,
          username: userData.username,
          full_name: userData.full_name,
          role: userData.role,
          retailer_id: userData.retailer_id,
          preferred_language: userData.preferred_language,
          must_change_password: userData.must_change_password || false,
        },
        session: {
          access_token: ctx.session.access_token,
          expires_at: ctx.session.expires_at,
        },
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Get session error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get session data',
      })
    }
  }),

  // Change password (for users who must change their temp password)
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        })
      }

      try {
        // Get current user data
        const { data: userData, error: userError } = await ctx.supabase  
          .from('users')
          .select('temp_password, must_change_password')
          .eq('id', ctx.user.id)
          .single()

        if (userError || !userData) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
            cause: userError,
          })
        }

        // Verify current password
        if (userData.temp_password !== input.currentPassword) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Current password is incorrect',
          })
        }

        // Update password
        const { error: updateError } = await ctx.supabase
          .from('users')
          .update({
            temp_password: input.newPassword, // In production, this should be hashed
            must_change_password: false,
            password_changed_at: new Date().toISOString(),
          })
          .eq('id', ctx.user.id)

        if (updateError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update password',
            cause: updateError,
          })
        }

        return {
          success: true,
          message: 'Password changed successfully',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Change password error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        })
      }
    }),
})