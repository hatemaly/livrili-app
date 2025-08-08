import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { type Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

// Middleware to check if user is authenticated
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  console.log('[TRPC-DEBUG] enforceUserIsAuthed middleware called')
  console.log('[TRPC-DEBUG] ctx.session:', ctx.session ? 'EXISTS' : 'NULL')
  console.log('[TRPC-DEBUG] ctx.session.user:', ctx.session?.user ? 'EXISTS' : 'NULL')
  
  if (!ctx.session || !ctx.session.user) {
    console.error('[TRPC-DEBUG] Authentication failed - no session or user')
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
  }
  
  console.log('[TRPC-DEBUG] Authentication successful for user:', ctx.session.user.id)
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
      user: ctx.session.user,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

// Admin-only procedure with proper Supabase auth integration
const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  console.log('[TRPC-DEBUG] enforceUserIsAdmin middleware called')
  console.log('[TRPC-DEBUG] ctx.session:', ctx.session ? 'EXISTS' : 'NULL')
  console.log('[TRPC-DEBUG] ctx.session.user:', ctx.session?.user ? 'EXISTS' : 'NULL')
  
  if (!ctx.session || !ctx.session.user) {
    console.error('[TRPC-DEBUG] Admin middleware failed - no session or user')
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
  }
  
  try {
    console.log('[TRPC-DEBUG] Fetching user role for user ID:', ctx.session.user.id)
    
    // Fetch user details from database to get role
    const { data: userData, error: userError } = await ctx.supabase
      .from('users')
      .select('role, is_active')
      .eq('id', ctx.session.user.id)
      .single()
    
    if (userError) {
      console.error('[TRPC-DEBUG] Database error fetching user role:', userError)
      throw new TRPCError({ 
        code: 'INTERNAL_SERVER_ERROR', 
        message: 'Failed to verify user permissions' 
      })
    }
    
    if (!userData) {
      console.error('[TRPC-DEBUG] No user data found for ID:', ctx.session.user.id)
      throw new TRPCError({ 
        code: 'UNAUTHORIZED', 
        message: 'User not found in system' 
      })
    }
    
    console.log('[TRPC-DEBUG] User data retrieved:', { role: userData.role, is_active: userData.is_active })
    
    if (!userData.is_active) {
      console.error('[TRPC-DEBUG] User account is inactive')
      throw new TRPCError({ 
        code: 'FORBIDDEN', 
        message: 'User account is inactive' 
      })
    }
    
    if (userData.role !== 'admin') {
      console.error('[TRPC-DEBUG] User role is not admin:', userData.role)
      throw new TRPCError({ 
        code: 'FORBIDDEN', 
        message: 'Admin access required' 
      })
    }
    
    console.log('[TRPC-DEBUG] Admin authentication successful')
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
        user: ctx.session.user,
        userRole: userData.role,
      },
    })
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error
    }
    console.error('[TRPC-DEBUG] Unexpected error in admin middleware:', error)
    throw new TRPCError({ 
      code: 'INTERNAL_SERVER_ERROR', 
      message: 'Failed to verify admin permissions' 
    })
  }
})

export const adminProcedure = t.procedure.use(enforceUserIsAdmin)

// Retailer-only procedure for retailer-specific operations
const enforceUserIsRetailer = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
  }
  
  try {
    // Handle mock authentication for development
    if (ctx.session.user.id === 'mock-user-id' && process.env.NODE_ENV === 'development') {
      console.log('[AUTH-DEBUG] Using mock retailer authentication')
      return next({
        ctx: {
          session: { ...ctx.session, user: ctx.session.user },
          user: ctx.session.user,
          userRole: 'retailer',
          retailerId: 'mock-retailer-id',
        },
      })
    }
    
    // First check if retailerId is already in context (set by createContext)
    if (ctx.retailerId) {
      console.log('[AUTH-DEBUG] Using retailerId from context:', ctx.retailerId)
      return next({
        ctx: {
          session: { ...ctx.session, user: ctx.session.user },
          user: ctx.session.user,
          userRole: ctx.session.user.user_metadata?.role || 'retailer',
          retailerId: ctx.retailerId,
        },
      })
    }
    
    // Check if user has retailer role in metadata or get it from database
    let userRole = ctx.session.user.user_metadata?.role
    
    // If role not in metadata, check the users table
    if (!userRole) {
      const { data: userData } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.user.id)
        .single()
      
      userRole = userData?.role
    }
    
    if (userRole === 'retailer') {
      // Get the user's retailer_id from the users table
      const { data: userData, error: userError } = await ctx.supabase
        .from('users')
        .select('retailer_id')
        .eq('id', ctx.session.user.id)
        .single()
      
      if (userError || !userData) {
        console.error('User not found in database:', userError)
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'User account not found' 
        })
      }
      
      if (!userData.retailer_id) {
        console.error('User does not have a retailer_id:', ctx.session.user.id)
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'No retailer account associated with user' 
        })
      }
      
      // Verify retailer exists in database and is active
      const { data: retailerData, error: retailerError } = await ctx.supabase
        .from('retailers')
        .select('id, status')
        .eq('id', userData.retailer_id)
        .single()
      
      if (retailerError || !retailerData) {
        console.error('Retailer not found:', retailerError)
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'Retailer account not found' 
        })
      }
      
      if (retailerData.status !== 'active') {
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'Retailer account is not active' 
        })
      }
      
      console.log('[RETAILER-DEBUG] Successfully validated retailer access:', {
        userId: ctx.session.user.id,
        retailerId: userData.retailer_id,
        retailerStatus: retailerData.status
      })
      
      return next({
        ctx: {
          session: { ...ctx.session, user: ctx.session.user },
          user: ctx.session.user,
          userRole: 'retailer',
          retailerId: userData.retailer_id,
        },
      })
    }
    
    // If we get here, user is not a retailer
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Retailer access required' 
    })
    
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error
    }
    console.error('Unexpected error in retailer middleware:', error)
    throw new TRPCError({ 
      code: 'INTERNAL_SERVER_ERROR', 
      message: 'Failed to verify retailer permissions' 
    })
  }
})

export const retailerProcedure = t.procedure.use(enforceUserIsRetailer)