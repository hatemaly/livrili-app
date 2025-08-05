import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const retailerCartRouter = router({
  // Add item to cart or update quantity if exists
  addToCart: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
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
        // Check if product exists and is active
        const { data: product, error: productError } = await ctx.supabase
          .from('products')
          .select('id, name_en, name_ar, name_fr, base_price, stock_quantity, is_active')
          .eq('id', input.productId)
          .eq('is_active', true)
          .single()

        if (productError || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found or inactive',
          })
        }

        // Check stock availability
        if (product.stock_quantity < input.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Not enough stock. Available: ${product.stock_quantity}`,
          })
        }

        // Insert or update cart item using upsert
        const { data: cartItem, error } = await ctx.supabase
          .from('shopping_carts')
          .upsert(
            {
              retailer_id: ctx.user.retailer_id,
              product_id: input.productId,
              quantity: input.quantity,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'retailer_id,product_id',
              ignoreDuplicates: false,
            }
          )
          .select('*')
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add item to cart',
            cause: error,
          })
        }

        return {
          success: true,
          cartItem: {
            id: cartItem.id,
            productId: cartItem.product_id,
            quantity: cartItem.quantity,
            product: {
              name_en: product.name_en,
              name_ar: product.name_ar,
              name_fr: product.name_fr,
              base_price: product.base_price,
            },
          },
          message: 'Item added to cart successfully',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Add to cart error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add item to cart',
        })
      }
    }),

  // Remove item from cart
  removeFromCart: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
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
        const { error } = await ctx.supabase
          .from('shopping_carts')
          .delete()
          .eq('retailer_id', ctx.user.retailer_id)
          .eq('product_id', input.productId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to remove item from cart',
            cause: error,
          })
        }

        return {
          success: true,
          message: 'Item removed from cart successfully',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Remove from cart error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove item from cart',
        })
      }
    }),

  // Update quantity of item in cart
  updateQuantity: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
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
        // Check stock availability
        const { data: product, error: productError } = await ctx.supabase
          .from('products')
          .select('stock_quantity, is_active')
          .eq('id', input.productId)
          .eq('is_active', true)
          .single()

        if (productError || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found or inactive',
          })
        }

        if (product.stock_quantity < input.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Not enough stock. Available: ${product.stock_quantity}`,
          })
        }

        const { error } = await ctx.supabase
          .from('shopping_carts')
          .update({ 
            quantity: input.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq('retailer_id', ctx.user.retailer_id)
          .eq('product_id', input.productId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update cart item quantity',
            cause: error,
          })
        }

        return {
          success: true,
          message: 'Cart item quantity updated successfully',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Update cart quantity error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update cart item quantity',
        })
      }
    }),

  // Get cart items with product details
  getCart: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.retailer_id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Retailer access required',
      })
    }

    try {
      const { data: cartItems, error } = await ctx.supabase
        .from('shopping_carts')
        .select(`
          id,
          product_id,
          quantity,
          added_at,
          updated_at,
          products (
            id,
            sku,
            name_en,
            name_ar,
            name_fr,
            description_en,
            description_ar,
            description_fr,
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
          )
        `)
        .eq('retailer_id', ctx.user.retailer_id)
        .order('updated_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch cart items',
          cause: error,
        })
      }

      return {
        items: cartItems.map(item => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          addedAt: item.added_at,
          updatedAt: item.updated_at,
          product: item.products ? {
            id: item.products.id,
            sku: item.products.sku,
            name_en: item.products.name_en,
            name_ar: item.products.name_ar,
            name_fr: item.products.name_fr,
            description_en: item.products.description_en,
            description_ar: item.products.description_ar,
            description_fr: item.products.description_fr,
            base_price: item.products.base_price,
            tax_rate: item.products.tax_rate,
            stock_quantity: item.products.stock_quantity,
            images: item.products.images,
            category: item.products.categories ? {
              id: item.products.categories.id,
              name_en: item.products.categories.name_en,
              name_ar: item.products.categories.name_ar,
              name_fr: item.products.categories.name_fr,
            } : null,
            // Calculate line totals
            lineSubtotal: Number((item.quantity * Number(item.products.base_price)).toFixed(2)),
            lineTax: Number((item.quantity * Number(item.products.base_price) * (item.products.tax_rate || 0) / 100).toFixed(2)),
            lineTotal: Number((item.quantity * Number(item.products.base_price) * (1 + (item.products.tax_rate || 0) / 100)).toFixed(2)),
          } : null,
        })),
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Get cart error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch cart items',
      })
    }
  }),

  // Clear entire cart
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user?.retailer_id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Retailer access required',
      })
    }

    try {
      const { error } = await ctx.supabase
        .from('shopping_carts')
        .delete()
        .eq('retailer_id', ctx.user.retailer_id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear cart',
          cause: error,
        })
      }

      return {
        success: true,
        message: 'Cart cleared successfully',
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Clear cart error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to clear cart',
      })
    }
  }),

  // Get cart summary using the SQL function
  getCartSummary: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.retailer_id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Retailer access required',
      })
    }

    try {
      const { data, error } = await ctx.supabase.rpc('get_cart_summary', {
        p_retailer_id: ctx.user.retailer_id,
      })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get cart summary',
          cause: error,
        })
      }

      // The function returns an array with one result
      const summary = data[0] || {
        total_items: 0,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
      }

      return {
        totalItems: summary.total_items,
        subtotal: Number(summary.subtotal),
        taxAmount: Number(summary.tax_amount),
        totalAmount: Number(summary.total_amount),
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Get cart summary error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get cart summary',
      })
    }
  }),

  // Add offline sync support for cart operations
  syncOfflineActions: protectedProcedure
    .input(
      z.object({
        actions: z.array(
          z.object({
            actionType: z.enum(['add_to_cart', 'remove_from_cart', 'update_quantity', 'clear_cart']),
            payload: z.object({
              productId: z.string().uuid().optional(),
              quantity: z.number().int().positive().optional(),
            }),
            deviceId: z.string().optional(),
            timestamp: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.retailer_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Retailer access required',
        })
      }

      const results = []

      try {
        for (const action of input.actions) {
          try {
            // Insert into offline sync queue for tracking
            await ctx.supabase
              .from('offline_sync_queue')
              .insert({
                retailer_id: ctx.user.retailer_id,
                action_type: action.actionType,
                payload: action.payload,
                device_id: action.deviceId,
                created_at: action.timestamp,
                status: 'pending',
              })

            // Execute the action based on type
            switch (action.actionType) {
              case 'add_to_cart':
                if (action.payload.productId && action.payload.quantity) {
                  await ctx.supabase
                    .from('shopping_carts')
                    .upsert({
                      retailer_id: ctx.user.retailer_id,
                      product_id: action.payload.productId,
                      quantity: action.payload.quantity,
                      updated_at: action.timestamp,
                    })
                }
                break

              case 'remove_from_cart':
                if (action.payload.productId) {
                  await ctx.supabase
                    .from('shopping_carts')
                    .delete()
                    .eq('retailer_id', ctx.user.retailer_id)
                    .eq('product_id', action.payload.productId)
                }
                break

              case 'update_quantity':
                if (action.payload.productId && action.payload.quantity) {
                  await ctx.supabase
                    .from('shopping_carts')
                    .update({ 
                      quantity: action.payload.quantity,
                      updated_at: action.timestamp,
                    })
                    .eq('retailer_id', ctx.user.retailer_id)
                    .eq('product_id', action.payload.productId)
                }
                break

              case 'clear_cart':
                await ctx.supabase
                  .from('shopping_carts')
                  .delete()
                  .eq('retailer_id', ctx.user.retailer_id)
                break
            }

            // Mark as synced
            await ctx.supabase
              .from('offline_sync_queue')
              .update({ status: 'synced', synced_at: new Date().toISOString() })
              .eq('retailer_id', ctx.user.retailer_id)
              .eq('action_type', action.actionType)
              .eq('created_at', action.timestamp)

            results.push({
              actionType: action.actionType,
              success: true,
            })
          } catch (actionError) {
            // Mark as failed
            await ctx.supabase
              .from('offline_sync_queue')
              .update({ 
                status: 'failed', 
                error_message: String(actionError),
                synced_at: new Date().toISOString(),
              })
              .eq('retailer_id', ctx.user.retailer_id)
              .eq('action_type', action.actionType)
              .eq('created_at', action.timestamp)

            results.push({
              actionType: action.actionType,
              success: false,
              error: String(actionError),
            })
          }
        }

        return {
          success: true,
          results,
          message: 'Offline actions synced',
        }
      } catch (error) {
        console.error('Sync offline actions error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync offline actions',
        })
      }
    }),
})