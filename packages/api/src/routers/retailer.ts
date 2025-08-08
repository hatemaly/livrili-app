import { z } from 'zod'
import { router, retailerProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

/**
 * Combined retailer router that consolidates retailer-facing operations
 * This router combines profile, orders, and cart operations for better client-side API structure
 */
export const retailerRouter = router({
  // Profile operations
  profile: router({
    // Get current retailer profile
    get: retailerProcedure.query(async ({ ctx }) => {
      try {
        // Handle mock data for development
        if (ctx.retailerId === 'mock-retailer-id' && process.env.NODE_ENV === 'development') {
          console.log('[MOCK-DEBUG] Returning mock retailer profile data')
          return {
            id: 'mock-retailer-id',
            businessName: 'Mock Retail Store',
            businessType: 'grocery',
            registrationNumber: 'MOCK123456',
            taxNumber: 'TAX987654',
            phone: '+213555123456',
            email: 'mock@retailstore.com',
            address: '123 Mock Street',
            city: 'Algiers',
            state: 'Alger',
            postalCode: '16000',
            creditLimit: 5000.00,
            currentBalance: 1200.50,
            availableCredit: 3799.50,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
        
        const { data: retailer, error } = await ctx.supabase
          .from('retailers')
          .select(`
            id,
            business_name,
            business_type,
            registration_number,
            tax_number,
            phone,
            email,
            address,
            city,
            state,
            postal_code,
            credit_limit,
            current_balance,
            status,
            created_at,
            updated_at
          `)
          .eq('id', ctx.retailerId)
          .single()

        if (error || !retailer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Retailer profile not found',
            cause: error,
          })
        }

        return {
          id: retailer.id,
          businessName: retailer.business_name,
          businessType: retailer.business_type,
          registrationNumber: retailer.registration_number,
          taxNumber: retailer.tax_number,
          phone: retailer.phone,
          email: retailer.email,
          address: retailer.address,
          city: retailer.city,
          state: retailer.state,
          postalCode: retailer.postal_code,
          creditLimit: Number(retailer.credit_limit || 0),
          currentBalance: Number(retailer.current_balance || 0),
          availableCredit: Number(retailer.credit_limit || 0) - Number(retailer.current_balance || 0),
          status: retailer.status,
          createdAt: retailer.created_at,
          updatedAt: retailer.updated_at,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Get retailer profile error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch retailer profile',
        })
      }
    }),
  }),

  // Orders operations
  orders: router({
    // Get recent orders for quick reorder
    getRecent: retailerProcedure
      .input(
        z.object({
          limit: z.number().int().min(1).max(10).default(5),
          language: z.enum(['en', 'ar', 'fr']).default('ar'),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          // Handle mock data for development
          if (ctx.retailerId === 'mock-retailer-id' && process.env.NODE_ENV === 'development') {
            console.log('[MOCK-DEBUG] Returning mock recent orders data')
            return {
              recentOrders: [
                {
                  id: 'mock-order-1',
                  orderNumber: 'ORD-001',
                  totalAmount: 245.50,
                  status: 'delivered',
                  deliveryDate: new Date().toISOString(),
                  createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                  items: [
                    {
                      productId: 'mock-product-1',
                      quantity: 2,
                      product: {
                        id: 'mock-product-1',
                        name: 'Sample Product 1',
                        basePrice: 10.00,
                        stockQuantity: 100,
                        isActive: true,
                        images: [],
                        multilingual: {
                          name_en: 'Sample Product 1',
                          name_ar: 'منتج تجريبي 1',
                          name_fr: 'Produit échantillon 1',
                        },
                      },
                    },
                  ],
                  canReorder: true,
                },
              ],
            }
          }
          
          const { data: orders, error } = await ctx.supabase
            .from('orders')
            .select(`
              id,
              order_number,
              total_amount,
              status,
              delivery_date,
              created_at,
              order_items (
                product_id,
                quantity,
                products (
                  id,
                  name_en,
                  name_ar,
                  name_fr,
                  base_price,
                  stock_quantity,
                  is_active,
                  images
                )
              )
            `)
            .eq('retailer_id', ctx.retailerId)
            .eq('status', 'delivered')
            .order('created_at', { ascending: false })
            .limit(input.limit)

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to fetch recent orders',
              cause: error,
            })
          }

          return {
            recentOrders: orders?.map(order => ({
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
    
    // Create order from cart (checkout)
    create: retailerProcedure
      .input(
        z.object({
          deliveryDate: z.string().optional(),
          notes: z.string().optional(),
          paymentMethod: z.enum(['cash', 'credit']).default('cash'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Handle mock data for development
          if (ctx.retailerId === 'mock-retailer-id' && process.env.NODE_ENV === 'development') {
            console.log('[MOCK-DEBUG] Mock creating order from cart')
            return {
              success: true,
              orderId: 'mock-order-' + Date.now(),
              orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9),
              message: 'Order created successfully',
            }
          }
          
          // Get cart items first
          const { data: cartItems, error: cartError } = await ctx.supabase
            .from('shopping_carts')
            .select(`
              id,
              product_id,
              quantity,
              products (
                id,
                base_price,
                tax_rate,
                stock_quantity,
                is_active
              )
            `)
            .eq('retailer_id', ctx.retailerId)

          if (cartError || !cartItems || cartItems.length === 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Cart is empty or could not be retrieved',
            })
          }

          // Calculate totals
          let subtotal = 0
          let taxAmount = 0
          
          for (const item of cartItems) {
            if (!item.products?.is_active) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Some products in cart are no longer available',
              })
            }
            
            if (item.products.stock_quantity < item.quantity) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Insufficient stock for some products',
              })
            }
            
            const lineSubtotal = item.quantity * Number(item.products.base_price)
            const lineTax = lineSubtotal * (item.products.tax_rate || 0) / 100
            
            subtotal += lineSubtotal
            taxAmount += lineTax
          }
          
          const totalAmount = subtotal + taxAmount
          const orderNumber = 'ORD-' + Date.now()
          
          // Create order
          const { data: order, error: orderError } = await ctx.supabase
            .from('orders')
            .insert({
              retailer_id: ctx.retailerId,
              order_number: orderNumber,
              subtotal_amount: subtotal.toFixed(2),
              tax_amount: taxAmount.toFixed(2),
              total_amount: totalAmount.toFixed(2),
              status: 'pending',
              delivery_date: input.deliveryDate,
              notes: input.notes,
              payment_method: input.paymentMethod,
            })
            .select('id')
            .single()

          if (orderError || !order) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create order',
              cause: orderError,
            })
          }

          // Create order items
          const orderItems = cartItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: Number(item.products!.base_price),
            tax_rate: item.products!.tax_rate || 0,
            subtotal: (item.quantity * Number(item.products!.base_price)).toFixed(2),
            tax_amount: (item.quantity * Number(item.products!.base_price) * (item.products!.tax_rate || 0) / 100).toFixed(2),
            total: (item.quantity * Number(item.products!.base_price) * (1 + (item.products!.tax_rate || 0) / 100)).toFixed(2),
          }))

          const { error: itemsError } = await ctx.supabase
            .from('order_items')
            .insert(orderItems)

          if (itemsError) {
            // Rollback order if items creation fails
            await ctx.supabase
              .from('orders')
              .delete()
              .eq('id', order.id)
              
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create order items',
              cause: itemsError,
            })
          }

          // Clear cart after successful order creation
          const { error: clearCartError } = await ctx.supabase
            .from('shopping_carts')
            .delete()
            .eq('retailer_id', ctx.retailerId)

          if (clearCartError) {
            console.error('Failed to clear cart after order creation:', clearCartError)
            // Don't fail the order creation, just log the error
          }

          return {
            success: true,
            orderId: order.id,
            orderNumber,
            totalAmount,
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
  }),

  // Cart operations
  cart: router({
    // Get cart items with product details
    get: retailerProcedure.query(async ({ ctx }) => {
      try {
        // Handle mock data for development
        if (ctx.retailerId === 'mock-retailer-id' && process.env.NODE_ENV === 'development') {
          console.log('[MOCK-DEBUG] Returning mock cart data')
          return {
            items: [
              {
                id: 'mock-cart-item-1',
                productId: 'mock-product-1',
                quantity: 2,
                addedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                product: {
                  id: 'mock-product-1',
                  sku: 'MOCK-001',
                  name_en: 'Sample Product 1',
                  name_ar: 'منتج تجريبي 1',
                  name_fr: 'Produit échantillon 1',
                  description_en: 'Sample product description',
                  description_ar: 'وصف المنتج التجريبي',
                  description_fr: 'Description du produit échantillon',
                  base_price: '10.00',
                  tax_rate: 19,
                  stock_quantity: 100,
                  images: [],
                  category: {
                    id: 'mock-category-1',
                    name_en: 'Sample Category',
                    name_ar: 'فئة تجريبية',
                    name_fr: 'Catégorie échantillon',
                  },
                  lineSubtotal: 20.00,
                  lineTax: 3.80,
                  lineTotal: 23.80,
                },
              },
            ],
          }
        }
        
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
          .eq('retailer_id', ctx.retailerId)
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

    // Add item to cart or update quantity if exists
    addToCart: retailerProcedure
      .input(
        z.object({
          productId: z.string().uuid('Invalid product ID'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .mutation(async ({ input, ctx }) => {
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
          if (Number(product.stock_quantity) < input.quantity) {
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
                retailer_id: ctx.retailerId,
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

    // Update quantity of item in cart
    updateQuantity: retailerProcedure
      .input(
        z.object({
          productId: z.string().uuid('Invalid product ID'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .mutation(async ({ input, ctx }) => {
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

          if (Number(product.stock_quantity) < input.quantity) {
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
            .eq('retailer_id', ctx.retailerId)
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

    // Remove item from cart
    removeFromCart: retailerProcedure
      .input(
        z.object({
          productId: z.string().uuid('Invalid product ID'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const { error } = await ctx.supabase
            .from('shopping_carts')
            .delete()
            .eq('retailer_id', ctx.retailerId)
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

    // Remove item from cart by item ID
    removeItem: retailerProcedure
      .input(
        z.object({
          itemId: z.string().uuid('Invalid item ID'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Handle mock data for development
          if (ctx.retailerId === 'mock-retailer-id' && process.env.NODE_ENV === 'development') {
            console.log('[MOCK-DEBUG] Mock removing cart item:', input.itemId)
            return {
              success: true,
              message: 'Item removed from cart successfully',
            }
          }
          
          const { error } = await ctx.supabase
            .from('shopping_carts')
            .delete()
            .eq('id', input.itemId)
            .eq('retailer_id', ctx.retailerId)

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

          console.error('Remove cart item error:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to remove item from cart',
          })
        }
      }),

    // Clear entire cart
    clearCart: retailerProcedure.mutation(async ({ ctx }) => {
      try {
        // Handle mock data for development
        if (ctx.retailerId === 'mock-retailer-id' && process.env.NODE_ENV === 'development') {
          console.log('[MOCK-DEBUG] Mock clearing cart')
          return {
            success: true,
            message: 'Cart cleared successfully',
          }
        }
        
        const { error } = await ctx.supabase
          .from('shopping_carts')
          .delete()
          .eq('retailer_id', ctx.retailerId)

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
  }),
})