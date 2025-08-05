import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const tagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  description: z.string().optional(),
})

const tagUpdateSchema = tagSchema.partial()

export const tagsRouter = router({
  // Get all tags with usage count and analytics
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      sortBy: z.enum(['name', 'usage_count', 'created_at']).default('usage_count'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      includeAnalytics: z.boolean().default(false),
    }).optional())
    .query(async ({ ctx, input }) => {
      const {
        search,
        sortBy = 'usage_count',
        sortOrder = 'desc',
        limit = 50,
        offset = 0,
        includeAnalytics = false,
      } = input || {}

      let query = ctx.supabase
        .from(includeAnalytics ? 'tag_analytics' : 'tags')
        .select(includeAnalytics ? '*' : 'id, name, slug, color, description, usage_count, created_at, updated_at')

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      // Apply sorting
      const column = includeAnalytics && sortBy === 'usage_count' ? 'actual_product_count' : sortBy
      query = query.order(column, { ascending: sortOrder === 'asc' })

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

  // Get tag by ID or slug
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Try to find by ID first, then by slug
      let { data, error } = await ctx.supabase
        .from('tags')
        .select('*, tag_aliases(alias)')
        .eq('id', input)
        .single()

      if (error && error.code === 'PGRST116') {
        // Try by slug
        const { data: slugData, error: slugError } = await ctx.supabase
          .from('tags')
          .select('*, tag_aliases(alias)')
          .eq('slug', input)
          .single()

        data = slugData
        error = slugError
      }

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tag not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Search tags by name (for autocomplete)
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(20).default(10),
      excludeIds: z.array(z.string().uuid()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('tags')
        .select('id, name, slug, color, usage_count')
        .or(`name.ilike.%${input.query}%,slug.ilike.%${input.query}%`)
        .order('usage_count', { ascending: false })
        .limit(input.limit)

      if (input.excludeIds && input.excludeIds.length > 0) {
        query = query.not('id', 'in', `(${input.excludeIds.join(',')})`)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data || []
    }),

  // Get tag suggestions based on product category
  getSuggestionsByCategory: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .rpc('get_tag_suggestions_by_category', { category_uuid: input })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data || []
    }),

  // Get products by tag
  getProducts: publicProcedure
    .input(z.object({
      tagId: z.string(),
      offset: z.number().min(0).default(0),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .rpc('get_products_by_tag', {
          tag_slug_or_id: input.tagId,
          page_offset: input.offset,
          page_limit: input.limit,
        })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data || []
    }),

  // Get popular tags (most used)
  getPopular: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 10

      const { data, error } = await ctx.supabase
        .from('tags')
        .select('id, name, slug, color, usage_count')
        .gt('usage_count', 0)
        .order('usage_count', { ascending: false })
        .limit(limit)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data || []
    }),

  // Create new tag (admin only)
  create: adminProcedure
    .input(tagSchema)
    .mutation(async ({ ctx, input }) => {
      // Auto-generate slug if not provided
      let slug = input.slug
      if (!slug) {
        const { data: slugData, error: slugError } = await ctx.supabase
          .rpc('generate_tag_slug', { tag_name: input.name })

        if (slugError || !slugData) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate slug',
          })
        }
        slug = slugData
      }

      // Check if name or slug already exists
      const { data: existing } = await ctx.supabase
        .from('tags')
        .select('id')
        .or(`name.eq.${input.name},slug.eq.${slug}`)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Tag with this name or slug already exists',
        })
      }

      const { data, error } = await ctx.supabase
        .from('tags')
        .insert({ ...input, slug })
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

  // Update tag (admin only)
  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: tagUpdateSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      let updateData = { ...input.data }

      // Auto-generate slug if name is updated but slug is not provided
      if (input.data.name && !input.data.slug) {
        const { data: slugData, error: slugError } = await ctx.supabase
          .rpc('generate_tag_slug', { tag_name: input.data.name })

        if (slugError || !slugData) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate slug',
          })
        }
        updateData.slug = slugData
      }

      // Check for conflicts if name or slug is being updated
      if (updateData.name || updateData.slug) {
        const conditions = []
        if (updateData.name) conditions.push(`name.eq.${updateData.name}`)
        if (updateData.slug) conditions.push(`slug.eq.${updateData.slug}`)

        const { data: existing } = await ctx.supabase
          .from('tags')
          .select('id')
          .or(conditions.join(','))
          .neq('id', input.id)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Tag with this name or slug already exists',
          })
        }
      }

      const { data, error } = await ctx.supabase
        .from('tags')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tag not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Delete tag (admin only)
  delete: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      // Check if tag is being used
      const { data: usage, error: usageError } = await ctx.supabase
        .from('product_tags')
        .select('id')
        .eq('tag_id', input)
        .limit(1)

      if (usageError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: usageError.message,
        })
      }

      if (usage && usage.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete tag that is assigned to products',
        })
      }

      const { error } = await ctx.supabase
        .from('tags')
        .delete()
        .eq('id', input)

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tag not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // Merge tags (admin only)
  merge: adminProcedure
    .input(z.object({
      sourceTagId: z.string().uuid(),
      targetTagId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.sourceTagId === input.targetTagId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot merge tag with itself',
        })
      }

      // Verify both tags exist
      const { data: sourcetag } = await ctx.supabase
        .from('tags')
        .select('id, name')
        .eq('id', input.sourceTagId)
        .single()

      const { data: targetTag } = await ctx.supabase
        .from('tags')
        .select('id, name')
        .eq('id', input.targetTagId)
        .single()

      if (!sourcetag || !targetTag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or both tags not found',
        })
      }

      const { data: success, error } = await ctx.supabase
        .rpc('merge_tags', {
          source_tag_id: input.sourceTagId,
          target_tag_id: input.targetTagId,
        })

      if (error || !success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to merge tags',
        })
      }

      return {
        success: true,
        message: `Successfully merged "${sourcetag.name}" into "${targetTag.name}"`,
      }
    }),

  // Add alias to tag (admin only)
  addAlias: adminProcedure
    .input(z.object({
      tagId: z.string().uuid(),
      alias: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if alias already exists
      const { data: existing } = await ctx.supabase
        .from('tag_aliases')
        .select('id')
        .eq('alias', input.alias)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Alias already exists',
        })
      }

      const { data, error } = await ctx.supabase
        .from('tag_aliases')
        .insert({
          tag_id: input.tagId,
          alias: input.alias,
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

  // Remove alias from tag (admin only)
  removeAlias: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('tag_aliases')
        .delete()
        .eq('id', input)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // Bulk import tags (admin only)
  bulkImport: adminProcedure
    .input(z.object({
      tags: z.array(z.object({
        name: z.string().min(1).max(100),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        description: z.string().optional(),
      })),
      skipExisting: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const results = {
        created: 0,
        skipped: 0,
        errors: [] as string[],
      }

      for (const tagData of input.tags) {
        try {
          // Generate slug
          const { data: slug, error: slugError } = await ctx.supabase
            .rpc('generate_tag_slug', { tag_name: tagData.name })

          if (slugError || !slug) {
            results.errors.push(`Failed to generate slug for "${tagData.name}"`)
            continue
          }

          // Check if exists
          if (input.skipExisting) {
            const { data: existing } = await ctx.supabase
              .from('tags')
              .select('id')
              .or(`name.eq.${tagData.name},slug.eq.${slug}`)
              .single()

            if (existing) {
              results.skipped++
              continue
            }
          }

          // Create tag
          const { error: insertError } = await ctx.supabase
            .from('tags')
            .insert({
              name: tagData.name,
              slug,
              color: tagData.color || '#6366F1',
              description: tagData.description,
            })

          if (insertError) {
            results.errors.push(`Failed to create "${tagData.name}": ${insertError.message}`)
          } else {
            results.created++
          }
        } catch (error) {
          results.errors.push(`Error processing "${tagData.name}": ${error}`)
        }
      }

      return results
    }),

  // Export tags (admin only)
  export: adminProcedure
    .input(z.object({
      format: z.enum(['json', 'csv']).default('json'),
      includeAnalytics: z.boolean().default(false),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { format = 'json', includeAnalytics = false } = input || {}

      const { data, error } = await ctx.supabase
        .from(includeAnalytics ? 'tag_analytics' : 'tags')
        .select('*')
        .order('usage_count', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      if (format === 'csv') {
        // Convert to CSV format
        if (!data || data.length === 0) return ''
        
        const headers = Object.keys(data[0]).join(',')
        const rows = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          ).join(',')
        )
        
        return [headers, ...rows].join('\n')
      }

      return data || []
    }),

  // Refresh analytics (admin only)
  refreshAnalytics: adminProcedure
    .mutation(async ({ ctx }) => {
      const { error } = await ctx.supabase
        .rpc('refresh_tag_analytics')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true, message: 'Tag analytics refreshed successfully' }
    }),
})