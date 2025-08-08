import { router, retailerProcedure } from '../trpc'
import { z } from 'zod'

/**
 * Aliased cart router with renamed procedures to match frontend expectations
 * Maps getCart -> get, etc.
 */
export const retailerCartAliasRouter = router({
  // Alias getCart as 'get'
  get: retailerProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.retailer_id) {
      return { items: [] }
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
        console.error('Get cart error:', error)
        return { items: [] }
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
      console.error('Get cart error:', error)
      return { items: [] }
    }
  }),

  // Alias addToCart as 'add'
  add: retailerProcedure
    .input(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.retailer_id) {
        throw new Error('Retailer access required')
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
          throw new Error('Product not found or inactive')
        }

        // Check stock availability
        if (product.stock_quantity < input.quantity) {
          throw new Error(`Not enough stock. Available: ${product.stock_quantity}`)
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
          throw new Error('Failed to add item to cart')
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
        throw new Error(error instanceof Error ? error.message : 'Failed to add item to cart')
      }
    }),
})