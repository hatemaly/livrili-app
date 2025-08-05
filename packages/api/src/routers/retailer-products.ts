import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const retailerProductsRouter = router({
  // Get categories with multi-language support
  getCategories: protectedProcedure
    .input(
      z.object({
        language: z.enum(['en', 'ar', 'fr']).default('ar'),
        parentId: z.string().uuid().optional(), // For hierarchical categories
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        let query = ctx.supabase
          .from('categories')
          .select('id, parent_id, name_en, name_ar, name_fr, description_en, description_ar, description_fr, image_url, sort_order, is_active')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        // Filter by parent_id if provided
        if (input.parentId) {
          query = query.eq('parent_id', input.parentId)
        } else {
          query = query.is('parent_id', null) // Root categories only
        }

        const { data: categories, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch categories',
            cause: error,
          })
        }

        return {
          categories: categories.map(category => ({
            id: category.id,
            parentId: category.parent_id,
            name: category[`name_${input.language}` as keyof typeof category] as string,
            description: category[`description_${input.language}` as keyof typeof category] as string,
            imageUrl: category.image_url,
            sortOrder: category.sort_order,
            // Include all language variants for offline caching
            multilingual: {
              name_en: category.name_en,
              name_ar: category.name_ar,
              name_fr: category.name_fr,
              description_en: category.description_en,
              description_ar: category.description_ar,
              description_fr: category.description_fr,
            },
          })),
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get categories error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
        })
      }
    }),

  // Get products with pagination and filters
  getProducts: protectedProcedure
    .input(
      z.object({
        language: z.enum(['en', 'ar', 'fr']).default('ar'),
        categoryId: z.string().uuid().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
        sortBy: z.enum(['name', 'price', 'created_at']).default('name'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
        priceMin: z.number().min(0).optional(),
        priceMax: z.number().min(0).optional(),
        inStock: z.boolean().default(true),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const offset = (input.page - 1) * input.limit

        let query = ctx.supabase
          .from('products')
          .select(`
            id,
            sku,
            barcode,
            category_id,
            name_en,
            name_ar,
            name_fr,
            description_en,
            description_ar,
            description_fr,
            base_price,
            tax_rate,
            stock_quantity,
            minimum_quantity,
            unit,
            weight,
            dimensions,
            images,
            is_active,
            created_at,
            categories (
              id,
              name_en,
              name_ar,
              name_fr
            )
          `, { count: 'exact' })
          .eq('is_active', true)

        // Apply filters
        if (input.categoryId) {
          query = query.eq('category_id', input.categoryId)
        }

        if (input.search) {
          // Search across all language fields
          query = query.or(`name_en.ilike.%${input.search}%,name_ar.ilike.%${input.search}%,name_fr.ilike.%${input.search}%,sku.ilike.%${input.search}%`)
        }

        if (input.priceMin !== undefined) {
          query = query.gte('base_price', input.priceMin)
        }

        if (input.priceMax !== undefined) {
          query = query.lte('base_price', input.priceMax)
        }

        if (input.inStock) {
          query = query.gt('stock_quantity', 0)
        }

        // Apply sorting
        const sortField = input.sortBy === 'name' ? `name_${input.language}` : input.sortBy === 'price' ? 'base_price' : 'created_at'
        query = query.order(sortField, { ascending: input.sortOrder === 'asc' })

        // Apply pagination
        query = query.range(offset, offset + input.limit - 1)

        const { data: products, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch products',
            cause: error,
          })
        }

        return {
          products: products?.map(product => ({
            id: product.id,
            sku: product.sku,
            barcode: product.barcode,
            categoryId: product.category_id,
            name: product[`name_${input.language}` as keyof typeof product] as string,
            description: product[`description_${input.language}` as keyof typeof product] as string,
            basePrice: Number(product.base_price),
            taxRate: product.tax_rate || 0,
            stockQuantity: product.stock_quantity,
            minimumQuantity: product.minimum_quantity,
            unit: product.unit,
            weight: product.weight,
            dimensions: product.dimensions,
            images: product.images || [],
            createdAt: product.created_at,
            category: product.categories ? {
              id: product.categories.id,
              name: product.categories[`name_${input.language}` as keyof typeof product.categories] as string,
            } : null,
            // Include all language variants for offline caching
            multilingual: {
              name_en: product.name_en,
              name_ar: product.name_ar,
              name_fr: product.name_fr,
              description_en: product.description_en,
              description_ar: product.description_ar,
              description_fr: product.description_fr,
            },
            // Calculate price with tax
            priceWithTax: Number((Number(product.base_price) * (1 + (product.tax_rate || 0) / 100)).toFixed(2)),
          })) || [],
          pagination: {
            page: input.page,
            limit: input.limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / input.limit),
            hasNext: input.page * input.limit < (count || 0),
            hasPrev: input.page > 1,
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get products error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch products',
        })
      }
    }),

  // Get single product by ID
  getProductById: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        language: z.enum(['en', 'ar', 'fr']).default('ar'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { data: product, error } = await ctx.supabase
          .from('products')
          .select(`
            id,
            sku,
            barcode,
            category_id,
            name_en,
            name_ar,
            name_fr,
            description_en,
            description_ar,
            description_fr,
            base_price,
            tax_rate,
            stock_quantity,
            minimum_quantity,
            unit,
            weight,
            dimensions,
            images,
            is_active,
            created_at,
            updated_at,
            categories (
              id,
              name_en,
              name_ar,
              name_fr,
              description_en,
              description_ar,
              description_fr
            )
          `)
          .eq('id', input.productId)
          .eq('is_active', true)
          .single()

        if (error || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }

        // Track product view for recommendations if user is a retailer
        if (ctx.user?.retailer_id) {
          await ctx.supabase
            .from('product_views')
            .insert({
              retailer_id: ctx.user.retailer_id,
              product_id: input.productId,
              device_info: {
                user_agent: ctx.headers?.get('user-agent'),
                timestamp: new Date().toISOString(),
              },
            })
            .select()
        }

        return {
          product: {
            id: product.id,
            sku: product.sku,
            barcode: product.barcode,
            categoryId: product.category_id,
            name: product[`name_${input.language}` as keyof typeof product] as string,
            description: product[`description_${input.language}` as keyof typeof product] as string,
            basePrice: Number(product.base_price),
            taxRate: product.tax_rate || 0,
            stockQuantity: product.stock_quantity,
            minimumQuantity: product.minimum_quantity,
            unit: product.unit,
            weight: product.weight,
            dimensions: product.dimensions,
            images: product.images || [],
            createdAt: product.created_at,
            updatedAt: product.updated_at,
            category: product.categories ? {
              id: product.categories.id,
              name: product.categories[`name_${input.language}` as keyof typeof product.categories] as string,
              description: product.categories[`description_${input.language}` as keyof typeof product.categories] as string,
            } : null,
            // Include all language variants for offline caching
            multilingual: {
              name_en: product.name_en,
              name_ar: product.name_ar,
              name_fr: product.name_fr,
              description_en: product.description_en,
              description_ar: product.description_ar,
              description_fr: product.description_fr,
            },
            // Calculate price with tax
            priceWithTax: Number((Number(product.base_price) * (1 + (product.tax_rate || 0) / 100)).toFixed(2)),
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get product by ID error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch product',
        })
      }
    }),

  // Get product recommendations using the SQL function
  getRecommendations: protectedProcedure
    .input(
      z.object({
        language: z.enum(['en', 'ar', 'fr']).default('ar'),
        limit: z.number().int().min(1).max(20).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.retailer_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Retailer access required',
        })
      }

      try {
        const { data, error } = await ctx.supabase.rpc('get_product_recommendations', {
          p_retailer_id: ctx.user.retailer_id,
          p_limit: input.limit,
        })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to get product recommendations',
            cause: error,
          })
        }

        return {
          recommendations: data?.map((item: any) => ({
            productId: item.product_id,
            name: item[`name_${input.language}`],
            basePrice: Number(item.base_price),
            categoryId: item.category_id,
            recommendationScore: item.recommendation_score,
            // Include all language variants for offline caching
            multilingual: {
              name_en: item.name_en,
              name_ar: item.name_ar,
              name_fr: item.name_fr,
            },
          })) || [],
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get product recommendations error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get product recommendations',
        })
      }
    }),

  // Track product view (for analytics and recommendations)
  trackProductView: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        deviceInfo: z.object({
          deviceType: z.string().optional(),
          browser: z.string().optional(),
          os: z.string().optional(),
          screen: z.object({
            width: z.number().optional(),
            height: z.number().optional(),
          }).optional(),
          timestamp: z.string(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.retailer_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Retailer access required',
        })
      }

      try {
        // Verify product exists
        const { data: product, error: productError } = await ctx.supabase
          .from('products')
          .select('id')
          .eq('id', input.productId)
          .eq('is_active', true)
          .single()

        if (productError || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }

        // Extract additional device info from headers
        const userAgent = ctx.headers?.get('user-agent') || 'Unknown'
        
        const deviceInfo = {
          ...input.deviceInfo,
          user_agent: userAgent,
          ip_address: ctx.headers?.get('x-forwarded-for') || 
                     ctx.headers?.get('x-real-ip') || 
                     '127.0.0.1',
        }

        // Track the product view
        const { error } = await ctx.supabase
          .from('product_views')
          .insert({
            retailer_id: ctx.user.retailer_id,
            product_id: input.productId,
            device_info: deviceInfo,
          })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to track product view',
            cause: error,
          })
        }

        return {
          success: true,
          message: 'Product view tracked successfully',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Track product view error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to track product view',
        })
      }
    }),

  // Get product search suggestions (for autocomplete)
  getSearchSuggestions: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        language: z.enum(['en', 'ar', 'fr']).default('ar'),
        limit: z.number().int().min(1).max(10).default(5),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { data: suggestions, error } = await ctx.supabase
          .from('products')
          .select(`
            id,
            sku,
            name_en,
            name_ar,
            name_fr,
            base_price,
            images
          `)
          .eq('is_active', true)
          .gt('stock_quantity', 0)
          .or(`name_en.ilike.%${input.query}%,name_ar.ilike.%${input.query}%,name_fr.ilike.%${input.query}%,sku.ilike.%${input.query}%`)
          .order(`name_${input.language}`, { ascending: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch search suggestions',
            cause: error,
          })
        }

        return {
          suggestions: suggestions?.map(product => ({
            id: product.id,
            sku: product.sku,
            name: product[`name_${input.language}` as keyof typeof product] as string,
            basePrice: Number(product.base_price),
            image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
            // Include all language variants for offline caching
            multilingual: {
              name_en: product.name_en,
              name_ar: product.name_ar,
              name_fr: product.name_fr,
            },
          })) || [],
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get search suggestions error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch search suggestions',
        })
      }
    }),

  // Get popular products (most viewed/ordered)
  getPopularProducts: protectedProcedure
    .input(
      z.object({
        language: z.enum(['en', 'ar', 'fr']).default('ar'),
        limit: z.number().int().min(1).max(20).default(10),
        timeframe: z.enum(['7d', '30d', '90d']).default('30d'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
        const days = daysMap[input.timeframe]

        const { data: popularProducts, error } = await ctx.supabase
          .rpc('get_popular_products', {
            p_days: days,
            p_limit: input.limit,
          })

        if (error) {
          // Fallback query if the function doesn't exist
          const { data: fallbackProducts, error: fallbackError } = await ctx.supabase
            .from('products')
            .select(`
              id,
              sku,
              name_en,
              name_ar,
              name_fr,
              base_price,
              tax_rate,
              stock_quantity,
              images,
              categories (
                id,
                name_en,
                name_ar,
                name_fr
              )
            `)
            .eq('is_active', true)
            .gt('stock_quantity', 0)
            .order('created_at', { ascending: false })
            .limit(input.limit)

          if (fallbackError) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to fetch popular products',
              cause: fallbackError,
            })
          }

          return {
            products: fallbackProducts?.map(product => ({
              id: product.id,
              sku: product.sku,
              name: product[`name_${input.language}` as keyof typeof product] as string,
              basePrice: Number(product.base_price),
              taxRate: product.tax_rate || 0,
              stockQuantity: product.stock_quantity,
              images: product.images || [],
              category: product.categories ? {
                id: product.categories.id,
                name: product.categories[`name_${input.language}` as keyof typeof product.categories] as string,
              } : null,
              multilingual: {
                name_en: product.name_en,
                name_ar: product.name_ar,
                name_fr: product.name_fr,
              },
              priceWithTax: Number((Number(product.base_price) * (1 + (product.tax_rate || 0) / 100)).toFixed(2)),
              popularityScore: 0, // Since we're using fallback
            })) || [],
          }
        }

        return {
          products: popularProducts?.map((product: any) => ({
            id: product.product_id,
            sku: product.sku,
            name: product[`name_${input.language}`],
            basePrice: Number(product.base_price),
            taxRate: product.tax_rate || 0,
            stockQuantity: product.stock_quantity,
            images: product.images || [],
            category: product.category ? {
              id: product.category.id,
              name: product.category[`name_${input.language}`],
            } : null,
            multilingual: {
              name_en: product.name_en,
              name_ar: product.name_ar,
              name_fr: product.name_fr,
            },
            priceWithTax: Number((Number(product.base_price) * (1 + (product.tax_rate || 0) / 100)).toFixed(2)),
            popularityScore: product.popularity_score || 0,
          })) || [],
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get popular products error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch popular products',
        })
      }
    }),
})