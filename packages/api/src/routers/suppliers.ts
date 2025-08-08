import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, adminProcedure } from '../trpc'

// Supplier schema for the business context
// In the Livrili model, there's initially one supplier, but this allows for future expansion
const supplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// For now, return a single supplier as per the business model
const defaultSupplier = {
  id: '1',
  name: 'Main Supplier',
  code: 'MAIN',
  contactName: 'Supplier Contact',
  contactEmail: 'contact@mainsupplier.com',
  contactPhone: '+213 555 0100',
  address: '123 Supplier Street',
  city: 'Algiers',
  state: 'Algiers',
  postalCode: '16000',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const suppliersRouter = router({
  // List all suppliers (currently returns single supplier)
  list: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input = {} }) => {
      // For now, return the single supplier
      // This structure allows for future expansion to multiple suppliers
      const suppliers = [defaultSupplier]
      
      // Apply filters if provided
      let filteredSuppliers = suppliers
      
      if (input.search) {
        const searchLower = input.search.toLowerCase()
        filteredSuppliers = filteredSuppliers.filter(
          s => s.name.toLowerCase().includes(searchLower) ||
               s.code.toLowerCase().includes(searchLower)
        )
      }
      
      if (input.isActive !== undefined) {
        filteredSuppliers = filteredSuppliers.filter(s => s.isActive === input.isActive)
      }
      
      return filteredSuppliers
    }),

  // Get a single supplier by ID
  getById: adminProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      if (id === defaultSupplier.id) {
        return defaultSupplier
      }
      
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Supplier not found',
      })
    }),

  // Create a new supplier (protected - admin only)
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        code: z.string(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create suppliers',
        })
      }

      // For now, throw an error as we only support single supplier
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Multiple suppliers are not supported in the current version',
      })
    }),

  // Update a supplier (protected - admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          code: z.string().optional(),
          contactName: z.string().optional(),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postalCode: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can update suppliers',
        })
      }

      if (input.id !== defaultSupplier.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Supplier not found',
        })
      }

      // In a real implementation, this would update the supplier in the database
      // For now, return the supplier with updated fields
      return {
        ...defaultSupplier,
        ...input.data,
        updatedAt: new Date(),
      }
    }),

  // Delete a supplier (protected - admin only)
  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ input: id, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can delete suppliers',
        })
      }

      // For now, throw an error as we need at least one supplier
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot delete the main supplier',
      })
    }),
})