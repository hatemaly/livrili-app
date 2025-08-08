import { z } from 'zod'
import { router, retailerProcedure, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const retailerOrdersRouter = router({
  // Create order using create_order_from_cart function
  createOrder: retailerProcedure
    .input(
      z.object({
        deliveryAddressId: z.string().uuid('Invalid delivery address ID'),
        deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        deliveryTimeSlot: z.string().min(1, 'Delivery time slot is required'),
        paymentMethod: z.enum(['cash', 'credit']),
        notes: z.string().optional(),
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
        // First check if cart has items and meets minimum order value
        const { data: minimumOrderCheck, error: checkError } = await ctx.supabase.rpc(
          'check_minimum_order_value',
          { p_retailer_id: ctx.user.retailer_id }
        )

        if (checkError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to validate minimum order',
            cause: checkError,
          })
        }

        if (!minimumOrderCheck.is_valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Minimum order value not met. Need ${minimumOrderCheck.amount_needed} DA more.`,
            cause: {
              cartTotal: minimumOrderCheck.cart_total,
              minimumOrder: minimumOrderCheck.minimum_order,
              amountNeeded: minimumOrderCheck.amount_needed,
            },
          })
        }

        // Validate delivery address belongs to retailer
        const { data: address, error: addressError } = await ctx.supabase
          .from('delivery_addresses')
          .select('id')
          .eq('id', input.deliveryAddressId)
          .eq('retailer_id', ctx.user.retailer_id)
          .single()

        if (addressError || !address) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Delivery address not found or access denied',
          })
        }

        // Check retailer credit limit if using credit payment
        if (input.paymentMethod === 'credit') {
          const { data: retailer, error: retailerError } = await ctx.supabase
            .from('retailers')
            .select('credit_limit, current_balance')
            .eq('id', ctx.user.retailer_id)
            .single()

          if (retailerError || !retailer) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Retailer not found',
            })
          }

          const newBalance = Number(retailer.current_balance) + Number(minimumOrderCheck.cart_total)
          if (newBalance > Number(retailer.credit_limit)) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Credit limit exceeded',
              cause: {
                currentBalance: retailer.current_balance,
                creditLimit: retailer.credit_limit,
                orderTotal: minimumOrderCheck.cart_total,
                wouldExceedBy: newBalance - Number(retailer.credit_limit),
              },
            })
          }
        }

        // Prepare device info
        const deviceInfo = {
          ...input.deviceInfo,
          user_agent: ctx.headers?.get('user-agent'),
          ip_address: ctx.headers?.get('x-forwarded-for') || 
                     ctx.headers?.get('x-real-ip') || 
                     '127.0.0.1',
        }

        // Create order using the SQL function
        const { data: orderId, error } = await ctx.supabase.rpc('create_order_from_cart', {
          p_retailer_id: ctx.user.retailer_id,
          p_user_id: ctx.user.id,
          p_delivery_address_id: input.deliveryAddressId,
          p_delivery_date: input.deliveryDate,
          p_delivery_time_slot: input.deliveryTimeSlot,
          p_payment_method: input.paymentMethod,
          p_notes: input.notes || null,
          p_device_info: deviceInfo,
        })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create order',
            cause: error,
          })
        }

        // Get the created order details
        const { data: order, error: orderError } = await ctx.supabase
          .from('orders')
          .select(`
            id,
            order_number,
            subtotal,
            tax_amount,
            total_amount,
            status,
            payment_method,
            delivery_date,
            delivery_time_slot,
            created_at,
            order_items (
              id,
              product_id,
              quantity,
              unit_price,
              total_price,
              products (
                name_en,
                name_ar,
                name_fr,
                sku
              )
            )
          `)
          .eq('id', orderId)
          .single()

        if (orderError || !order) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Order created but failed to retrieve details',
          })
        }

        return {
          success: true,
          order: {
            id: order.id,
            orderNumber: order.order_number,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.tax_amount),
            totalAmount: Number(order.total_amount),
            status: order.status,
            paymentMethod: order.payment_method,
            deliveryDate: order.delivery_date,
            deliveryTimeSlot: order.delivery_time_slot,
            createdAt: order.created_at,
            items: order.order_items?.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price),
              totalPrice: Number(item.total_price),
              product: {
                name_en: item.products?.name_en,
                name_ar: item.products?.name_ar,
                name_fr: item.products?.name_fr,
                sku: item.products?.sku,
              },
            })) || [],
          },
          message: 'Order created successfully',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Create order error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create order',
        })
      }
    }),

  // Get orders with pagination
  getOrders: retailerProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
        status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
        dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        sortBy: z.enum(['created_at', 'delivery_date', 'total_amount']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
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
        const offset = (input.page - 1) * input.limit

        let query = ctx.supabase
          .from('orders')
          .select(`
            id,
            order_number,
            subtotal,
            tax_amount,
            delivery_fee,
            discount_amount,
            total_amount,
            status,
            payment_method,
            delivery_address,
            delivery_date,
            delivery_time_slot,
            notes,
            created_at,
            updated_at,
            order_items (
              id,
              product_id,
              quantity,
              unit_price,
              total_price,
              products (
                name_en,
                name_ar,
                name_fr,
                sku,
                images
              )
            )
          `, { count: 'exact' })
          .eq('retailer_id', ctx.user.retailer_id)

        // Apply filters
        if (input.status) {
          query = query.eq('status', input.status)
        }

        if (input.dateFrom) {
          query = query.gte('created_at', input.dateFrom + 'T00:00:00.000Z')
        }

        if (input.dateTo) {
          query = query.lte('created_at', input.dateTo + 'T23:59:59.999Z')
        }

        // Apply sorting and pagination
        query = query
          .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
          .range(offset, offset + input.limit - 1)

        const { data: orders, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch orders',
            cause: error,
          })
        }

        return {
          orders: orders?.map(order => ({
            id: order.id,
            orderNumber: order.order_number,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.tax_amount),
            deliveryFee: Number(order.delivery_fee || 0),
            discountAmount: Number(order.discount_amount || 0),
            totalAmount: Number(order.total_amount),
            status: order.status,
            paymentMethod: order.payment_method,
            deliveryAddress: order.delivery_address,
            deliveryDate: order.delivery_date,
            deliveryTimeSlot: order.delivery_time_slot,
            notes: order.notes,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            itemsCount: order.order_items?.length || 0,
            items: order.order_items?.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price),
              totalPrice: Number(item.total_price),
              product: {
                name_en: item.products?.name_en,
                name_ar: item.products?.name_ar,
                name_fr: item.products?.name_fr,
                sku: item.products?.sku,
                images: item.products?.images || [],
              },
            })) || [],
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

        console.error('Get orders error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch orders',
        })
      }
    }),

  // Get single order by ID
  getOrderById: retailerProcedure
    .input(
      z.object({
        orderId: z.string().uuid('Invalid order ID'),
        language: z.enum(['en', 'ar', 'fr']).default('ar'),
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
        const { data: order, error } = await ctx.supabase
          .from('orders')
          .select(`
            id,
            order_number,
            subtotal,
            tax_amount,
            delivery_fee,
            discount_amount,
            total_amount,
            status,
            payment_method,
            delivery_address,
            delivery_date,
            delivery_time_slot,
            notes,
            created_at,
            updated_at,
            device_info,
            order_items (
              id,
              product_id,
              quantity,
              unit_price,
              tax_amount,
              total_price,
              products (
                id,
                sku,
                name_en,
                name_ar,
                name_fr,
                description_en,
                description_ar,
                description_fr,
                images,
                unit,
                categories (
                  id,
                  name_en,
                  name_ar,
                  name_fr
                )
              )
            )
          `)
          .eq('id', input.orderId)
          .eq('retailer_id', ctx.user.retailer_id)
          .single()

        if (error || !order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          })
        }

        return {
          order: {
            id: order.id,
            orderNumber: order.order_number,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.tax_amount),
            deliveryFee: Number(order.delivery_fee || 0),
            discountAmount: Number(order.discount_amount || 0),
            totalAmount: Number(order.total_amount),
            status: order.status,
            paymentMethod: order.payment_method,
            deliveryAddress: order.delivery_address,
            deliveryDate: order.delivery_date,
            deliveryTimeSlot: order.delivery_time_slot,
            notes: order.notes,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            deviceInfo: order.device_info,
            items: order.order_items?.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price),
              taxAmount: Number(item.tax_amount || 0),
              totalPrice: Number(item.total_price),
              product: {
                id: item.products?.id,
                sku: item.products?.sku,
                name: item.products?.[`name_${input.language}` as keyof typeof item.products] as string,
                description: item.products?.[`description_${input.language}` as keyof typeof item.products] as string,
                images: item.products?.images || [],
                unit: item.products?.unit,
                category: item.products?.categories ? {
                  id: item.products.categories.id,
                  name: item.products.categories[`name_${input.language}` as keyof typeof item.products.categories] as string,
                } : null,
                // Include all language variants for offline caching
                multilingual: {
                  name_en: item.products?.name_en,
                  name_ar: item.products?.name_ar,
                  name_fr: item.products?.name_fr,
                  description_en: item.products?.description_en,
                  description_ar: item.products?.description_ar,
                  description_fr: item.products?.description_fr,
                },
              },
            })) || [],
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get order by ID error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch order',
        })
      }
    }),

  // Get recent orders for quick reorder - temporarily use protectedProcedure for debugging
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(10).default(5),
        language: z.enum(['en', 'ar', 'fr']).default('ar'),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })
      }
      
      // For debugging - if no retailer_id in user metadata, return empty array
      const retailerId = ctx.user.user_metadata?.retailer_id || 'mock-retailer-id'
      if (!retailerId) {
        return { recentOrders: [] }
      }

      try {
        // Temporary mock data for testing
        const mockOrders = [
          {
            id: '1',
            order_number: 'ORD-001',
            total_amount: 50.00,
            status: 'delivered',
            delivery_date: '2025-08-05',
            created_at: '2025-08-05T10:00:00Z',
            order_items: [
              {
                product_id: '1',
                quantity: 2,
                products: {
                  id: '1',
                  name_en: 'Coca Cola',
                  name_ar: 'كوكا كولا',
                  name_fr: 'Coca Cola',
                  base_price: 2.50,
                  stock_quantity: 100,
                  is_active: true,
                  images: []
                }
              }
            ]
          },
          {
            id: '2',
            order_number: 'ORD-002',
            total_amount: 25.00,
            status: 'delivered',
            delivery_date: '2025-08-04',
            created_at: '2025-08-04T15:30:00Z',
            order_items: [
              {
                product_id: '2',
                quantity: 1,
                products: {
                  id: '2',
                  name_en: 'Chips',
                  name_ar: 'رقائق البطاطس',
                  name_fr: 'Chips',
                  base_price: 3.00,
                  stock_quantity: 50,
                  is_active: true,
                  images: []
                }
              }
            ]
          }
        ]

        return {
          recentOrders: mockOrders.slice(0, input.limit).map(order => ({
            id: order.id,
            orderNumber: order.order_number,
            totalAmount: Number(order.total_amount),
            status: order.status,
            deliveryDate: order.delivery_date,
            createdAt: order.created_at,
            items: order.order_items?.map((item: any) => ({
              productId: item.product_id,
              quantity: item.quantity,
              product: item.products ? {
                id: item.products.id,
                name: item.products[`name_${input.language}` as keyof typeof item.products] as string,
                basePrice: Number(item.products.base_price),
                stockQuantity: item.products.stock_quantity,
                isActive: item.products.is_active,
                images: item.products.images || [],
                multilingual: {
                  name_en: item.products.name_en,
                  name_ar: item.products.name_ar,
                  name_fr: item.products.name_fr,
                },
              } : null,
            })) || [],
            // Calculate reorder availability
            canReorder: order.order_items?.every((item: any) => 
              item.products?.is_active && item.products?.stock_quantity > 0
            ) || false,
          })) || [],
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get recent orders error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recent orders',
        })
      }
    }),

  // Check minimum order value using the SQL function
  checkMinimumOrder: retailerProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.retailer_id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Retailer access required',
      })
    }

    try {
      const { data, error } = await ctx.supabase.rpc('check_minimum_order_value', {
        p_retailer_id: ctx.user.retailer_id,
      })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check minimum order value',
          cause: error,
        })
      }

      return {
        cartTotal: Number(data.cart_total),
        minimumOrder: Number(data.minimum_order),
        isValid: data.is_valid,
        amountNeeded: Number(data.amount_needed),
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Check minimum order error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check minimum order value',
      })
    }
  }),

  // Reorder from a previous order
  reorderFromOrder: retailerProcedure
    .input(
      z.object({
        orderId: z.string().uuid('Invalid order ID'),
        excludeOutOfStock: z.boolean().default(true),
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
        // Get the order items
        const { data: order, error: orderError } = await ctx.supabase
          .from('orders')
          .select(`
            id,
            order_items (
              product_id,
              quantity,
              products (
                id,
                stock_quantity,
                is_active,
                name_en
              )
            )
          `)
          .eq('id', input.orderId)
          .eq('retailer_id', ctx.user.retailer_id)
          .single()

        if (orderError || !order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          })
        }

        const addedItems = []
        const skippedItems = []

        for (const item of order.order_items) {
          const product = item.products

          // Skip inactive products or out of stock if requested
          if (!product?.is_active || (input.excludeOutOfStock && product.stock_quantity <= 0)) {
            skippedItems.push({
              productId: item.product_id,
              productName: product?.name_en || 'Unknown',
              reason: !product?.is_active ? 'Product is inactive' : 'Out of stock',
            })
            continue
          }

          // Adjust quantity if not enough stock
          const quantityToAdd = Math.min(item.quantity, product.stock_quantity)

          try {
            // Add to cart using upsert
            await ctx.supabase
              .from('shopping_carts')
              .upsert(
                {
                  retailer_id: ctx.user.retailer_id,
                  product_id: item.product_id,
                  quantity: quantityToAdd,
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: 'retailer_id,product_id',
                  ignoreDuplicates: false,
                }
              )

            addedItems.push({
              productId: item.product_id,
              productName: product.name_en,
              quantity: quantityToAdd,
              originalQuantity: item.quantity,
            })
          } catch (cartError) {
            skippedItems.push({
              productId: item.product_id,
              productName: product?.name_en || 'Unknown',
              reason: 'Failed to add to cart',
            })
          }
        }

        return {
          success: true,
          addedItems,
          skippedItems,
          message: `Reorder completed. ${addedItems.length} items added to cart${skippedItems.length > 0 ? `, ${skippedItems.length} items skipped` : ''}.`,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Reorder from order error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder from order',
        })
      }
    }),

  // Get order statistics for the retailer
  getOrderStats: retailerProcedure
    .input(
      z.object({
        timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
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
        const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
        const days = daysMap[input.timeframe]
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: stats, error } = await ctx.supabase
          .from('orders')
          .select('status, total_amount, created_at')
          .eq('retailer_id', ctx.user.retailer_id)
          .gte('created_at', startDate.toISOString())

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch order statistics',
            cause: error,
          })
        }

        const totalOrders = stats?.length || 0
        const totalAmount = stats?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
        const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0

        const statusCounts = stats?.reduce((acc: Record<string, number>, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, {}) || {}

        return {
          totalOrders,
          totalAmount: Number(totalAmount.toFixed(2)),
          averageOrderValue: Number(averageOrderValue.toFixed(2)),
          statusBreakdown: statusCounts,
          timeframe: input.timeframe,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get order stats error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch order statistics',
        })
      }
    }),
})