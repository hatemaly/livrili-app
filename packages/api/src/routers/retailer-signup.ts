import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createAdminSupabaseClient } from '../lib/supabase-admin'

export const retailerSignupRouter = router({
  // Register a new retailer
  register: publicProcedure
    .input(
      z.object({
        businessName: z.string().min(2, 'Business name must be at least 2 characters'),
        phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
        email: z.string().email().optional(),
        address: z.string().min(5, 'Address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().optional(),
        businessType: z.string().optional(),
        registrationNumber: z.string().optional(),
        taxNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Use admin client to bypass RLS
        const supabase = createAdminSupabaseClient()

        // Check if phone number already exists
        const { data: existingRetailer } = await supabase
          .from('retailers')
          .select('id, phone')
          .eq('phone', input.phone)
          .single()

        if (existingRetailer) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A retailer with this phone number already exists',
          })
        }

        // Create the retailer with pending status
        const { data: retailer, error: retailerError } = await supabase
          .from('retailers')
          .insert({
            business_name: input.businessName,
            phone: input.phone,
            email: input.email || null,
            address: input.address,
            city: input.city,
            state: input.state || null,
            business_type: input.businessType || null,
            registration_number: input.registrationNumber || null,
            tax_number: input.taxNumber || null,
            status: 'pending', // Always set to pending
            credit_limit: 0,    // Always start with 0
            current_balance: 0, // Always start with 0
            documents: [],      // Empty documents array
            metadata: {
              registered_at: new Date().toISOString(),
              registered_from: 'retail_portal',
            },
          })
          .select()
          .single()

        if (retailerError) {
          console.error('Error creating retailer:', retailerError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create retailer account',
          })
        }

        // Log the registration for audit
        await supabase.from('audit_logs').insert({
          action: 'retailer_registration',
          resource_type: 'retailers',
          resource_id: retailer.id,
          new_values: {
            business_name: retailer.business_name,
            phone: retailer.phone,
            status: 'pending',
          },
        })

        return {
          success: true,
          retailerId: retailer.id,
          message: 'Registration successful! Your account is pending approval.',
          retailer: {
            id: retailer.id,
            businessName: retailer.business_name,
            phone: retailer.phone,
            status: retailer.status,
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Unexpected error during retailer registration:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during registration',
        })
      }
    }),

  // Check registration status by phone
  checkStatus: publicProcedure
    .input(
      z.object({
        phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
      })
    )
    .query(async ({ input }) => {
      try {
        const supabase = createAdminSupabaseClient()

        const { data: retailer } = await supabase
          .from('retailers')
          .select('id, business_name, status, created_at, rejection_reason')
          .eq('phone', input.phone)
          .single()

        if (!retailer) {
          return {
            found: false,
            message: 'No registration found with this phone number',
          }
        }

        return {
          found: true,
          retailer: {
            id: retailer.id,
            businessName: retailer.business_name,
            status: retailer.status,
            registeredAt: retailer.created_at,
            rejectionReason: retailer.rejection_reason,
          },
        }
      } catch (error) {
        console.error('Error checking registration status:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check registration status',
        })
      }
    }),

  // Upload documents (for future use)
  uploadDocument: publicProcedure
    .input(
      z.object({
        retailerId: z.string().uuid(),
        documentType: z.enum(['business_license', 'tax_certificate', 'other']),
        documentUrl: z.string().url(),
        documentName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const supabase = createAdminSupabaseClient()

        // Get current documents
        const { data: retailer } = await supabase
          .from('retailers')
          .select('documents')
          .eq('id', input.retailerId)
          .single()

        if (!retailer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Retailer not found',
          })
        }

        // Add new document
        const documents = retailer.documents || []
        documents.push({
          type: input.documentType,
          url: input.documentUrl,
          name: input.documentName,
          uploaded_at: new Date().toISOString(),
        })

        // Update retailer with new documents
        const { error } = await supabase
          .from('retailers')
          .update({ documents })
          .eq('id', input.retailerId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to upload document',
          })
        }

        return {
          success: true,
          message: 'Document uploaded successfully',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        console.error('Error uploading document:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload document',
        })
      }
    }),
})