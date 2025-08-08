import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const categorySchema = z.object({
  name_en: z.string().min(1),
  name_ar: z.string().min(1),
  name_fr: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  parent_id: z.string().uuid().nullable().optional(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  description_fr: z.string().optional(),
  image_url: z.string().url().optional(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
})

export const categoriesRouter = router({
  // Get all categories (public)
  list: adminProcedure
    .input(z.object({
      includeInactive: z.boolean().optional(),
      parentId: z.string().uuid().nullable().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name_en', { ascending: true })

      if (!input?.includeInactive) {
        query = query.eq('is_active', true)
      }

      if (input?.parentId !== undefined) {
        query = query.eq('parent_id', input.parentId)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get category by ID (public)
  getById: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('categories')
        .select('*')
        .eq('id', input)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get category by slug (public)
  getBySlug: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('categories')
        .select('*')
        .eq('slug', input)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get category tree (public)
  tree: adminProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name_en', { ascending: true })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Build tree structure
      const buildTree = (parentId: string | null = null): any[] => {
        return data
          .filter(cat => cat.parent_id === parentId)
          .map(cat => ({
            ...cat,
            children: buildTree(cat.id),
          }))
      }

      return buildTree(null)
    }),

  // Create category (admin only)
  create: adminProcedure
    .input(categorySchema)
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const { data: existing } = await ctx.supabase
        .from('categories')
        .select('id')
        .eq('slug', input.slug)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Category with this slug already exists',
        })
      }

      const { data, error } = await ctx.supabase
        .from('categories')
        .insert(input)
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

  // Update category (admin only)
  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: categorySchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      // If updating slug, check if it already exists
      if (input.data.slug) {
        const { data: existing } = await ctx.supabase
          .from('categories')
          .select('id')
          .eq('slug', input.data.slug)
          .neq('id', input.id)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Category with this slug already exists',
          })
        }
      }

      const { data, error } = await ctx.supabase
        .from('categories')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Delete category (admin only)
  delete: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      // Check if category has children
      const { data: children } = await ctx.supabase
        .from('categories')
        .select('id')
        .eq('parent_id', input)
        .limit(1)

      if (children && children.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete category with subcategories',
        })
      }

      // Check if category has products
      const { data: products } = await ctx.supabase
        .from('products')
        .select('id')
        .eq('category_id', input)
        .limit(1)

      if (products && products.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete category with products',
        })
      }

      const { error } = await ctx.supabase
        .from('categories')
        .delete()
        .eq('id', input)

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),
})