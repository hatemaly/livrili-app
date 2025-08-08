import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const productSchema = z.object({
  sku: z.string().min(1),
  barcode: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  name_en: z.string().min(1),
  name_ar: z.string().min(1),
  name_fr: z.string().min(1),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  description_fr: z.string().optional(),
  base_price: z.number().positive(),
  cost_price: z.number().positive().optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  min_stock_level: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  images: z.array(z.string().url()).optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
})

export const productsRouter = router({
  // List products with filters and pagination
  list: adminProcedure
    .input(z.object({
      categoryId: z.string().uuid().optional(),
      search: z.string().optional(),
      tagIds: z.array(z.string().uuid()).optional(),
      includeInactive: z.boolean().optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().min(0).default(0),
      sortBy: z.enum(['name', 'price', 'created_at', 'stock']).default('name'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const {
        categoryId,
        search,
        tagIds,
        includeInactive,
        limit = 20,
        offset = 0,
        sortBy = 'name',
        sortOrder = 'asc',
      } = input || {}

      let query = ctx.supabase
        .from('products')
        .select(`
          *, 
          categories(name_en, name_ar, name_fr, slug),
          product_tags!inner(tags(id, name, slug, color))
        `, { count: 'exact' })

      // Apply filters
      if (!includeInactive) {
        query = query.eq('is_active', true)
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      if (search) {
        query = query.or(`name_en.ilike.%${search}%,name_ar.ilike.%${search}%,name_fr.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
      }

      if (tagIds && tagIds.length > 0) {
        query = query.in('product_tags.tag_id', tagIds)
      }

      // Apply sorting
      const sortColumn = sortBy === 'name' ? 'name_en' : 
                        sortBy === 'price' ? 'base_price' :
                        sortBy === 'stock' ? 'stock_quantity' :
                        'created_at'
      
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

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

  // Get product by ID
  getById: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('products')
        .select('*, categories(name_en, name_ar, name_fr, slug)')
        .eq('id', input)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get product by SKU
  getBySku: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('products')
        .select('*, categories(name_en, name_ar, name_fr, slug)')
        .eq('sku', input)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Create product (admin only)
  create: adminProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if SKU already exists
      const { data: existing } = await ctx.supabase
        .from('products')
        .select('id')
        .eq('sku', input.sku)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Product with this SKU already exists',
        })
      }

      const { data, error } = await ctx.supabase
        .from('products')
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

  // Update product (admin only)
  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: productSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      // If updating SKU, check if it already exists
      if (input.data.sku) {
        const { data: existing } = await ctx.supabase
          .from('products')
          .select('id')
          .eq('sku', input.data.sku)
          .neq('id', input.id)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Product with this SKU already exists',
          })
        }
      }

      const { data, error } = await ctx.supabase
        .from('products')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Delete product (admin only)
  delete: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      // Check if product is in any orders
      const { data: orderItems } = await ctx.supabase
        .from('order_items')
        .select('id')
        .eq('product_id', input)
        .limit(1)

      if (orderItems && orderItems.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete product that has been ordered',
        })
      }

      const { error } = await ctx.supabase
        .from('products')
        .delete()
        .eq('id', input)

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // Update stock (admin only)
  updateStock: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      quantity: z.number().int(),
      operation: z.enum(['set', 'add', 'subtract']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get current stock
      const { data: product, error: fetchError } = await ctx.supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', input.id)
        .single()

      if (fetchError || !product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      let newQuantity = 0
      const currentQuantity = product.stock_quantity || 0

      switch (input.operation) {
        case 'set':
          newQuantity = input.quantity
          break
        case 'add':
          newQuantity = currentQuantity + input.quantity
          break
        case 'subtract':
          newQuantity = currentQuantity - input.quantity
          break
      }

      if (newQuantity < 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Stock quantity cannot be negative',
        })
      }

      const { data, error } = await ctx.supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', input.id)
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

  // Get product tags
  getTags: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('product_tags')
        .select('tags(id, name, slug, color, usage_count)')
        .eq('product_id', input)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data?.map(item => item.tags).filter(Boolean) || []
    }),

  // Add tags to product (admin only)
  addTags: adminProcedure
    .input(z.object({
      productId: z.string().uuid(),
      tagIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify product exists
      const { data: product, error: productError } = await ctx.supabase
        .from('products')
        .select('id')
        .eq('id', input.productId)
        .single()

      if (productError || !product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // Verify all tags exist
      const { data: tags, error: tagsError } = await ctx.supabase
        .from('tags')
        .select('id')
        .in('id', input.tagIds)

      if (tagsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: tagsError.message,
        })
      }

      if (tags.length !== input.tagIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or more tags not found',
        })
      }

      // Create product-tag associations
      const productTags = input.tagIds.map(tagId => ({
        product_id: input.productId,
        tag_id: tagId,
      }))

      const { data, error } = await ctx.supabase
        .from('product_tags')
        .upsert(productTags, { onConflict: 'product_id,tag_id' })
        .select('tags(id, name, slug, color)')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data?.map(item => item.tags).filter(Boolean) || []
    }),

  // Remove tags from product (admin only)
  removeTags: adminProcedure
    .input(z.object({
      productId: z.string().uuid(),
      tagIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('product_tags')
        .delete()
        .eq('product_id', input.productId)
        .in('tag_id', input.tagIds)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // Get products by tag
  getByTag: adminProcedure
    .input(z.object({
      tagId: z.string(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      // First, resolve tag by ID or slug
      let tagId = input.tagId
      if (!input.tagId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: tag, error: tagError } = await ctx.supabase
          .from('tags')
          .select('id')
          .eq('slug', input.tagId)
          .single()

        if (tagError || !tag) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tag not found',
          })
        }
        tagId = tag.id
      }

      let query = ctx.supabase
        .from('product_tags')
        .select(`
          products!inner(
            id, sku, name_en, name_ar, name_fr, base_price, stock_quantity, is_active,
            categories(name_en, name_ar, name_fr, slug)
          )
        `, { count: 'exact' })
        .eq('tag_id', tagId)

      if (!input.includeInactive) {
        query = query.eq('products.is_active', true)
      }

      query = query
        .order('products(name_en)', { ascending: true })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: data?.map(item => item.products).filter(Boolean) || [],
        total: count || 0,
        limit: input.limit,
        offset: input.offset,
      }
    }),

  // Bulk tag operations (admin only)
  bulkTagOperation: adminProcedure
    .input(z.object({
      productIds: z.array(z.string().uuid()),
      operation: z.enum(['add', 'remove', 'replace']),
      tagIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      }

      // Verify all products exist
      const { data: products, error: productsError } = await ctx.supabase
        .from('products')
        .select('id, name_en')
        .in('id', input.productIds)

      if (productsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: productsError.message,
        })
      }

      // Verify all tags exist
      const { data: tags, error: tagsError } = await ctx.supabase
        .from('tags')
        .select('id')
        .in('id', input.tagIds)

      if (tagsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: tagsError.message,
        })
      }

      if (tags.length !== input.tagIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or more tags not found',
        })
      }

      for (const product of products) {
        try {
          if (input.operation === 'replace') {
            // Remove existing tags first
            await ctx.supabase
              .from('product_tags')
              .delete()
              .eq('product_id', product.id)
          }

          if (input.operation === 'add' || input.operation === 'replace') {
            // Add new tags
            const productTags = input.tagIds.map(tagId => ({
              product_id: product.id,
              tag_id: tagId,
            }))

            const { error: upsertError } = await ctx.supabase
              .from('product_tags')
              .upsert(productTags, { onConflict: 'product_id,tag_id' })

            if (upsertError) {
              results.failed++
              results.errors.push(`Failed to add tags to ${product.name_en}: ${upsertError.message}`)
              continue
            }
          } else if (input.operation === 'remove') {
            // Remove tags
            const { error: deleteError } = await ctx.supabase
              .from('product_tags')
              .delete()
              .eq('product_id', product.id)
              .in('tag_id', input.tagIds)

            if (deleteError) {
              results.failed++
              results.errors.push(`Failed to remove tags from ${product.name_en}: ${deleteError.message}`)
              continue
            }
          }

          results.success++
        } catch (error) {
          results.failed++
          results.errors.push(`Error processing ${product.name_en}: ${error}`)
        }
      }

      return results
    }),
})