import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const authRouter = router({
  // Sign up new retailer
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        businessName: z.string().min(2),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implement sign up with Supabase
      return {
        success: true,
        message: 'Sign up endpoint - to be implemented',
      }
    }),

  // Sign in
  signIn: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implement sign in with Supabase
      return {
        success: true,
        message: 'Sign in endpoint - to be implemented',
      }
    }),

  // Sign out
  signOut: publicProcedure.mutation(async ({ ctx }) => {
    // TODO: Implement sign out
    return {
      success: true,
      message: 'Sign out endpoint - to be implemented',
    }
  }),

  // Get current session
  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.session
  }),
})