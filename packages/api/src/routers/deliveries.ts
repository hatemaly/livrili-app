import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Driver input schemas
const createDriverSchema = z.object({
  user_id: z.string().uuid().optional(),
  driver_license: z.string().min(1),
  license_expiry: z.string(),
  vehicle_type: z.enum(['motorcycle', 'car', 'van', 'truck']),
  vehicle_model: z.string().optional(),
  vehicle_plate: z.string().min(1),
  vehicle_year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  phone: z.string().min(1),
  emergency_contact: z.string().optional(),
  zone_coverage: z.array(z.string()).default([]),
  max_capacity_kg: z.number().positive().default(50),
  max_orders_per_trip: z.number().int().positive().default(5),
  documents: z.array(z.any()).default([]),
  metadata: z.record(z.any()).default({}),
})

const updateDriverSchema = z.object({
  driver_license: z.string().min(1).optional(),
  license_expiry: z.string().optional(),
  vehicle_type: z.enum(['motorcycle', 'car', 'van', 'truck']).optional(),
  vehicle_model: z.string().optional(),
  vehicle_plate: z.string().min(1).optional(),
  vehicle_year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  phone: z.string().min(1).optional(),
  emergency_contact: z.string().optional(),
  zone_coverage: z.array(z.string()).optional(),
  max_capacity_kg: z.number().positive().optional(),
  max_orders_per_trip: z.number().int().positive().optional(),
  status: z.enum(['available', 'busy', 'offline', 'suspended']).optional(),
  current_location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  documents: z.array(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// Delivery input schemas
const createDeliverySchema = z.object({
  order_id: z.string().uuid(),
  priority: z.number().int().min(1).max(3).default(1),
  pickup_address: z.string().min(1),
  pickup_contact: z.string().optional(),
  pickup_notes: z.string().optional(),
  pickup_time_window_start: z.string().optional(),
  pickup_time_window_end: z.string().optional(),
  delivery_address: z.string().min(1),
  delivery_contact: z.string().min(1),
  delivery_notes: z.string().optional(),
  delivery_time_window_start: z.string().optional(),
  delivery_time_window_end: z.string().optional(),
  package_weight: z.number().positive().optional(),
  package_dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.string().default('cm'),
  }).optional(),
  special_instructions: z.string().optional(),
  cash_to_collect: z.number().min(0).default(0),
  delivery_fee: z.number().min(0).default(0),
  metadata: z.record(z.any()).default({}),
})

const updateDeliverySchema = z.object({
  driver_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']).optional(),
  priority: z.number().int().min(1).max(3).optional(),
  pickup_notes: z.string().optional(),
  delivery_notes: z.string().optional(),
  pickup_time_window_start: z.string().optional(),
  pickup_time_window_end: z.string().optional(),
  delivery_time_window_start: z.string().optional(),
  delivery_time_window_end: z.string().optional(),
  estimated_delivery_time: z.string().optional(),
  actual_pickup_time: z.string().optional(),
  actual_delivery_time: z.string().optional(),
  package_weight: z.number().positive().optional(),
  package_dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.string().default('cm'),
  }).optional(),
  special_instructions: z.string().optional(),
  cash_to_collect: z.number().min(0).optional(),
  cash_collected: z.number().min(0).optional(),
  current_location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  proof_of_delivery: z.record(z.any()).optional(),
  failure_reason: z.string().optional(),
  customer_rating: z.number().int().min(1).max(5).optional(),
  customer_feedback: z.string().optional(),
  delivery_fee: z.number().min(0).optional(),
  driver_commission: z.number().min(0).optional(),
  fuel_cost: z.number().min(0).optional(),
  metadata: z.record(z.any()).optional(),
})

// Helper function to generate unique delivery number
const generateDeliveryNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `DEL-${timestamp.slice(-6)}-${random}`
}

// Helper function to create audit log
const createAuditLog = async (
  supabase: any,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  oldValues?: any,
  newValues?: any
) => {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    old_values: oldValues || null,
    new_values: newValues || null,
  })
}

// Helper function to add tracking update
const addTrackingUpdate = async (
  supabase: any,
  deliveryId: string,
  status: string,
  location?: any,
  notes?: string
) => {
  const { error } = await supabase.rpc('add_delivery_tracking_update', {
    delivery_id: deliveryId,
    new_status: status,
    location_data: location || null,
    notes: notes || null,
  })
  
  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to update tracking: ${error.message}`,
    })
  }
}

export const deliveriesRouter = router({
  // Driver management endpoints
  getDrivers: adminProcedure
    .input(z.object({
      status: z.enum(['available', 'busy', 'offline', 'suspended']).optional(),
      vehicle_type: z.enum(['motorcycle', 'car', 'van', 'truck']).optional(),
      zone: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().min(0).default(0),
      sortBy: z.enum(['created_at', 'rating', 'total_deliveries', 'status']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const {
        status,
        vehicle_type,
        zone,
        search,
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = input || {}

      let query = ctx.supabase
        .from('drivers')
        .select(`
          *,
          users(id, username, full_name, phone)
        `, { count: 'exact' })

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }

      if (vehicle_type) {
        query = query.eq('vehicle_type', vehicle_type)
      }

      if (zone) {
        query = query.contains('zone_coverage', [zone])
      }

      if (search) {
        query = query.or(`vehicle_plate.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

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

  createDriver: adminProcedure
    .input(createDriverSchema)
    .mutation(async ({ ctx, input }) => {
      // If user_id is provided, validate user exists and has driver role
      if (input.user_id) {
        const { data: user, error: userError } = await ctx.supabase
          .from('users')
          .select('id, role')
          .eq('id', input.user_id)
          .single()

        if (userError || !user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        if (user.role !== 'driver') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'User must have driver role',
          })
        }

        // Check if driver already exists for this user
        const { data: existingDriver } = await ctx.supabase
          .from('drivers')
          .select('id')
          .eq('user_id', input.user_id)
          .single()

        if (existingDriver) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Driver profile already exists for this user',
          })
        }
      }

      // Check if vehicle plate is unique
      const { data: existingPlate } = await ctx.supabase
        .from('drivers')
        .select('id')
        .eq('vehicle_plate', input.vehicle_plate)
        .single()

      if (existingPlate) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Vehicle plate already registered',
        })
      }

      // Create driver
      const { data: newDriver, error: driverError } = await ctx.supabase
        .from('drivers')
        .insert(input)
        .select()
        .single()

      if (driverError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: driverError.message,
        })
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'driver_created',
        'driver',
        newDriver.id,
        null,
        newDriver
      )

      return newDriver
    }),

  updateDriver: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateDriverSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Get current driver
      const { data: currentDriver, error: fetchError } = await ctx.supabase
        .from('drivers')
        .select('*')
        .eq('id', input.id)
        .single()

      if (fetchError || !currentDriver) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Driver not found',
        })
      }

      // Check if vehicle plate is unique (if being updated)
      if (input.data.vehicle_plate && input.data.vehicle_plate !== currentDriver.vehicle_plate) {
        const { data: existingPlate } = await ctx.supabase
          .from('drivers')
          .select('id')
          .eq('vehicle_plate', input.data.vehicle_plate)
          .neq('id', input.id)
          .single()

        if (existingPlate) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Vehicle plate already registered',
          })
        }
      }

      // Update driver
      const { data: updatedDriver, error: updateError } = await ctx.supabase
        .from('drivers')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'driver_updated',
        'driver',
        input.id,
        currentDriver,
        updatedDriver
      )

      return updatedDriver
    }),

  // Delivery management endpoints
  getDeliveries: adminProcedure
    .input(z.object({
      status: z.enum(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']).optional(),
      driver_id: z.string().uuid().optional(),
      order_id: z.string().uuid().optional(),
      route_id: z.string().uuid().optional(),
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      priority: z.number().int().min(1).max(3).optional(),
      search: z.string().optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().min(0).default(0),
      sortBy: z.enum(['created_at', 'delivery_number', 'status', 'estimated_delivery_time', 'priority']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const {
        status,
        driver_id,
        order_id,
        route_id,
        date_from,
        date_to,
        priority,
        search,
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = input || {}

      let query = ctx.supabase
        .from('deliveries')
        .select(`
          *,
          orders(id, order_number, total_amount, retailer_id, retailers(id, business_name, phone)),
          drivers(id, user_id, phone, vehicle_type, vehicle_plate)
        `, { count: 'exact' })

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }

      if (driver_id) {
        query = query.eq('driver_id', driver_id)
      }

      if (order_id) {
        query = query.eq('order_id', order_id)
      }

      if (route_id) {
        query = query.eq('route_id', route_id)
      }

      if (priority) {
        query = query.eq('priority', priority)
      }

      if (date_from) {
        query = query.gte('created_at', date_from)
      }

      if (date_to) {
        query = query.lte('created_at', date_to)
      }

      if (search) {
        query = query.or(`delivery_number.ilike.%${search}%,delivery_address.ilike.%${search}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

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

  getDeliveryById: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { data: delivery, error } = await ctx.supabase
        .from('deliveries')
        .select(`
          *,
          orders(
            id, order_number, total_amount, retailer_id, status,
            retailers(id, business_name, phone, address)
          ),
          drivers(
            id, user_id, phone, vehicle_type, vehicle_plate, rating,
            users(id, username, full_name)
          )
        `)
        .eq('id', input)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Delivery not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return delivery
    }),

  createDelivery: adminProcedure
    .input(createDeliverySchema)
    .mutation(async ({ ctx, input }) => {
      // Validate order exists
      const { data: order, error: orderError } = await ctx.supabase
        .from('orders')
        .select('id, retailer_id, total_amount, delivery_address, delivery_date')
        .eq('id', input.order_id)
        .single()

      if (orderError || !order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      // Check if delivery already exists for this order
      const { data: existingDelivery } = await ctx.supabase
        .from('deliveries')
        .select('id')
        .eq('order_id', input.order_id)
        .single()

      if (existingDelivery) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Delivery already exists for this order',
        })
      }

      // Use order delivery address if not provided
      const deliveryAddress = input.delivery_address || order.delivery_address

      // Create delivery
      const deliveryNumber = generateDeliveryNumber()
      const { data: newDelivery, error: deliveryError } = await ctx.supabase
        .from('deliveries')
        .insert({
          ...input,
          delivery_number: deliveryNumber,
          delivery_address: deliveryAddress,
          tracking_updates: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
              notes: 'Delivery created',
            }
          ],
        })
        .select()
        .single()

      if (deliveryError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: deliveryError.message,
        })
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'delivery_created',
        'delivery',
        newDelivery.id,
        null,
        newDelivery
      )

      return newDelivery
    }),

  assignDriver: adminProcedure
    .input(z.object({
      delivery_id: z.string().uuid(),
      driver_id: z.string().uuid(),
      estimated_pickup_time: z.string().optional(),
      estimated_delivery_time: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate delivery exists and is assignable
      const { data: delivery, error: deliveryError } = await ctx.supabase
        .from('deliveries')
        .select('id, status, driver_id')
        .eq('id', input.delivery_id)
        .single()

      if (deliveryError || !delivery) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Delivery not found',
        })
      }

      if (!['pending', 'failed'].includes(delivery.status)) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Delivery cannot be assigned in current status',
        })
      }

      // Validate driver exists and is available
      const { data: driver, error: driverError } = await ctx.supabase
        .from('drivers')
        .select('id, status')
        .eq('id', input.driver_id)
        .single()

      if (driverError || !driver) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Driver not found',
        })
      }

      if (driver.status !== 'available') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Driver is not available',
        })
      }

      // Update delivery
      const updateData: any = {
        driver_id: input.driver_id,
        status: 'assigned',
      }

      if (input.estimated_pickup_time) {
        updateData.pickup_time_window_start = input.estimated_pickup_time
      }

      if (input.estimated_delivery_time) {
        updateData.estimated_delivery_time = input.estimated_delivery_time
      }

      const { data: updatedDelivery, error: updateError } = await ctx.supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', input.delivery_id)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Update driver status to busy
      await ctx.supabase.rpc('update_driver_status', {
        driver_id: input.driver_id,
        new_status: 'busy',
      })

      // Add tracking update
      await addTrackingUpdate(
        ctx.supabase,
        input.delivery_id,
        'assigned',
        null,
        `Assigned to driver. ${input.notes || ''}`
      )

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'delivery_assigned',
        'delivery',
        input.delivery_id,
        delivery,
        { driver_id: input.driver_id, notes: input.notes }
      )

      return updatedDelivery
    }),

  updateDeliveryStatus: adminProcedure
    .input(z.object({
      delivery_id: z.string().uuid(),
      status: z.enum(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']),
      location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional(),
      }).optional(),
      notes: z.string().optional(),
      proof_of_delivery: z.record(z.any()).optional(),
      failure_reason: z.string().optional(),
      customer_rating: z.number().int().min(1).max(5).optional(),
      customer_feedback: z.string().optional(),
      cash_collected: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { delivery_id, status, location, notes, ...otherData } = input

      // Get current delivery
      const { data: currentDelivery, error: fetchError } = await ctx.supabase
        .from('deliveries')
        .select('*, drivers(user_id)')
        .eq('id', delivery_id)
        .single()

      if (fetchError || !currentDelivery) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Delivery not found',
        })
      }

      // Check permissions - only admins or assigned driver can update
      const isAdmin = ctx.session.user.role === 'admin'
      const isAssignedDriver = currentDelivery.drivers?.user_id === ctx.session.user.id

      if (!isAdmin && !isAssignedDriver) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this delivery',
        })
      }

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        pending: ['assigned', 'cancelled'],
        assigned: ['picked_up', 'cancelled', 'failed'],
        picked_up: ['in_transit', 'failed'],
        in_transit: ['delivered', 'failed'],
        delivered: [],
        failed: ['assigned'], // Can be reassigned
        cancelled: [],
      }

      if (!validTransitions[currentDelivery.status]?.includes(status)) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Invalid status transition from ${currentDelivery.status} to ${status}`,
        })
      }

      // Update delivery
      const updateData: any = { status, ...otherData }

      if (location) {
        updateData.current_location = {
          ...location,
          timestamp: new Date().toISOString(),
        }
      }

      // Set timestamps based on status
      if (status === 'picked_up') {
        updateData.actual_pickup_time = new Date().toISOString()
      } else if (status === 'delivered') {
        updateData.actual_delivery_time = new Date().toISOString()
      }

      const { data: updatedDelivery, error: updateError } = await ctx.supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', delivery_id)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Update driver status if delivery is completed or failed
      if (['delivered', 'failed', 'cancelled'].includes(status) && currentDelivery.driver_id) {
        await ctx.supabase.rpc('update_driver_status', {
          driver_id: currentDelivery.driver_id,
          new_status: 'available',
        })
      }

      // Add tracking update
      await addTrackingUpdate(
        ctx.supabase,
        delivery_id,
        status,
        location,
        notes
      )

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'delivery_status_updated',
        'delivery',
        delivery_id,
        { status: currentDelivery.status },
        { status, notes }
      )

      return updatedDelivery
    }),

  getDriverDeliveries: adminProcedure
    .input(z.object({
      driver_id: z.string().uuid().optional(),
      status: z.enum(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']).optional(),
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const {
        driver_id,
        status,
        date_from,
        date_to,
        limit = 20,
        offset = 0,
      } = input || {}

      // If no driver_id provided and user is a driver, use their driver profile
      let targetDriverId = driver_id

      if (!targetDriverId && ctx.session.user.role === 'driver') {
        const { data: driver } = await ctx.supabase
          .from('drivers')
          .select('id')
          .eq('user_id', ctx.session.user.id)
          .single()

        if (driver) {
          targetDriverId = driver.id
        }
      }

      if (!targetDriverId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Driver ID is required',
        })
      }

      // Check permissions
      const isAdmin = ctx.session.user.role === 'admin'
      const { data: driverProfile } = await ctx.supabase
        .from('drivers')
        .select('user_id')
        .eq('id', targetDriverId)
        .single()

      const isOwnProfile = driverProfile?.user_id === ctx.session.user.id

      if (!isAdmin && !isOwnProfile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view these deliveries',
        })
      }

      let query = ctx.supabase
        .from('deliveries')
        .select(`
          *,
          orders(id, order_number, total_amount, retailers(id, business_name, phone))
        `, { count: 'exact' })
        .eq('driver_id', targetDriverId)

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }

      if (date_from) {
        query = query.gte('created_at', date_from)
      }

      if (date_to) {
        query = query.lte('created_at', date_to)
      }

      // Apply sorting and pagination
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

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

  getDeliveryRoutes: adminProcedure
    .input(z.object({
      driver_id: z.string().uuid().optional(),
      route_date: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const {
        driver_id,
        route_date,
        status,
        limit = 20,
        offset = 0,
      } = input || {}

      let query = ctx.supabase
        .from('delivery_routes')
        .select(`
          *,
          drivers(id, user_id, phone, vehicle_type, vehicle_plate, users(id, username, full_name))
        `, { count: 'exact' })

      // Apply filters
      if (driver_id) {
        query = query.eq('driver_id', driver_id)
      }

      if (route_date) {
        query = query.eq('route_date', route_date)
      }

      if (status) {
        query = query.eq('status', status)
      }

      // Apply sorting and pagination
      query = query
        .order('route_date', { ascending: false })
        .range(offset, offset + limit - 1)

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

  getDeliveryRouteById: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { data: route, error } = await ctx.supabase
        .from('delivery_routes')
        .select(`
          *,
          drivers(
            id, user_id, phone, vehicle_type, vehicle_plate, rating,
            users(id, username, full_name)
          )
        `)
        .eq('id', input)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Route not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return route
    }),

  optimizeRoutes: adminProcedure
    .input(z.object({
      date: z.string(),
      driver_id: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { date, driver_id } = input

      // Get pending deliveries for the date
      let query = ctx.supabase
        .from('deliveries')
        .select('id, delivery_address, priority, estimated_delivery_time, driver_id')
        .eq('status', 'pending')

      if (driver_id) {
        query = query.eq('driver_id', driver_id)
      }

      const { data: deliveries, error: deliveriesError } = await query

      if (deliveriesError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: deliveriesError.message,
        })
      }

      if (!deliveries || deliveries.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No pending deliveries found for optimization',
        })
      }

      // Get available drivers
      let driverQuery = ctx.supabase
        .from('drivers')
        .select('id, max_orders_per_trip, max_capacity_kg, zone_coverage')
        .eq('status', 'available')

      if (driver_id) {
        driverQuery = driverQuery.eq('id', driver_id)
      }

      const { data: drivers, error: driversError } = await driverQuery

      if (driversError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: driversError.message,
        })
      }

      if (!drivers || drivers.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No available drivers found',
        })
      }

      // Simple optimization: group deliveries by priority and assign to drivers
      const optimizedRoutes = []
      const deliveriesPerDriver = Math.ceil(deliveries.length / drivers.length)

      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i]
        const startIndex = i * deliveriesPerDriver
        const endIndex = Math.min(startIndex + deliveriesPerDriver, deliveries.length)
        const routeDeliveries = deliveries.slice(startIndex, endIndex)

        if (routeDeliveries.length === 0) continue

        // Sort by priority (highest first)
        routeDeliveries.sort((a, b) => b.priority - a.priority)

        // Create route
        const routeData = {
          driver_id: driver.id,
          route_date: date,
          status: 'planned',
          total_deliveries: routeDeliveries.length,
          completed_deliveries: 0,
          delivery_ids: routeDeliveries.map(d => d.id),
          route_data: {
            optimization_criteria: 'priority',
            waypoints: routeDeliveries.map((d, index) => ({
              order: index + 1,
              delivery_id: d.id,
              address: d.delivery_address,
              priority: d.priority,
            })),
          },
          estimated_duration: routeDeliveries.length * 30, // 30 minutes per delivery
        }

        const { data: route, error: routeError } = await ctx.supabase
          .from('delivery_routes')
          .insert(routeData)
          .select()
          .single()

        if (routeError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: routeError.message,
          })
        }

        // Update deliveries to assign them to the route
        await ctx.supabase
          .from('deliveries')
          .update({ 
            driver_id: driver.id,
            status: 'assigned',
            route_id: route.id 
          })
          .in('id', routeDeliveries.map(d => d.id))

        optimizedRoutes.push(route)
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'routes_optimized',
        'delivery_route',
        'bulk',
        null,
        { date, routes_created: optimizedRoutes.length, deliveries_assigned: deliveries.length }
      )

      return {
        routes: optimizedRoutes,
        deliveries_assigned: deliveries.length,
      }
    }),

  startRoute: adminProcedure
    .input(z.object({
      route_id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { route_id } = input

      // Get route details
      const { data: route, error: routeError } = await ctx.supabase
        .from('delivery_routes')
        .select('id, status, driver_id')
        .eq('id', route_id)
        .single()

      if (routeError || !route) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Route not found',
        })
      }

      if (route.status !== 'planned') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Route must be in planned status to start',
        })
      }

      // Update route status
      const { data: updatedRoute, error: updateError } = await ctx.supabase
        .from('delivery_routes')
        .update({
          status: 'active',
          start_time: new Date().toISOString(),
        })
        .eq('id', route_id)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Update driver status to busy
      if (route.driver_id) {
        await ctx.supabase
          .from('drivers')
          .update({ status: 'busy' })
          .eq('id', route.driver_id)
      }

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'route_started',
        'delivery_route',
        route_id,
        { status: 'planned' },
        { status: 'active', start_time: updatedRoute.start_time }
      )

      return updatedRoute
    }),

  optimizeRoute: adminProcedure
    .input(z.object({
      driver_id: z.string().uuid(),
      delivery_ids: z.array(z.string().uuid()).min(1).max(20),
      start_location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional(),
      }).optional(),
      optimization_criteria: z.enum(['time', 'distance', 'priority']).default('time'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { driver_id, delivery_ids, start_location, optimization_criteria } = input

      // Validate driver exists
      const { data: driver, error: driverError } = await ctx.supabase
        .from('drivers')
        .select('id, current_location')
        .eq('id', driver_id)
        .single()

      if (driverError || !driver) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Driver not found',
        })
      }

      // Get deliveries to optimize
      const { data: deliveries, error: deliveriesError } = await ctx.supabase
        .from('deliveries')
        .select('id, delivery_address, priority, estimated_delivery_time')
        .in('id', delivery_ids)
        .in('status', ['pending', 'assigned'])

      if (deliveriesError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: deliveriesError.message,
        })
      }

      if (deliveries.length !== delivery_ids.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Some deliveries not found or not optimizable',
        })
      }

      // Simple optimization logic (in production, use proper routing APIs)
      let optimizedOrder = [...deliveries]

      if (optimization_criteria === 'priority') {
        optimizedOrder.sort((a, b) => b.priority - a.priority)
      } else if (optimization_criteria === 'time') {
        optimizedOrder.sort((a, b) => {
          if (!a.estimated_delivery_time) return 1
          if (!b.estimated_delivery_time) return -1
          return new Date(a.estimated_delivery_time).getTime() - new Date(b.estimated_delivery_time).getTime()
        })
      }

      // Create or update route
      const routeData = {
        driver_id,
        route_date: new Date().toISOString().split('T')[0],
        status: 'planned',
        total_deliveries: optimizedOrder.length,
        delivery_ids: optimizedOrder.map(d => d.id),
        route_data: {
          optimization_criteria,
          start_location: start_location || driver.current_location,
          waypoints: optimizedOrder.map(d => ({
            delivery_id: d.id,
            address: d.delivery_address,
            priority: d.priority,
          })),
        },
      }

      const { data: route, error: routeError } = await ctx.supabase
        .from('delivery_routes')
        .insert(routeData)
        .select()
        .single()

      if (routeError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: routeError.message,
        })
      }

      return {
        route,
        optimized_order: optimizedOrder,
      }
    }),

  trackDelivery: adminProcedure
    .input(z.object({
      delivery_number: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { data: delivery, error } = await ctx.supabase
        .from('deliveries')
        .select(`
          id,
          delivery_number,
          status,
          estimated_delivery_time,
          actual_delivery_time,
          current_location,
          tracking_updates,
          delivery_address,
          delivery_contact,
          orders(order_number)
        `)
        .eq('delivery_number', input.delivery_number)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Delivery not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return delivery
    }),

  confirmDelivery: adminProcedure
    .input(z.object({
      delivery_id: z.string().uuid(),
      photos: z.array(z.string()).optional(),
      signature: z.string().optional(),
      notes: z.string().optional(),
      customer_rating: z.number().int().min(1).max(5).optional(),
      customer_feedback: z.string().optional(),
      cash_collected: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { delivery_id, photos, signature, notes, customer_rating, customer_feedback, cash_collected } = input

      // Get current delivery
      const { data: delivery, error: fetchError } = await ctx.supabase
        .from('deliveries')
        .select('*, drivers(user_id)')
        .eq('id', delivery_id)
        .single()

      if (fetchError || !delivery) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Delivery not found',
        })
      }

      // Check permissions
      const isAdmin = ctx.session.user.role === 'admin'
      const isAssignedDriver = delivery.drivers?.user_id === ctx.session.user.id

      if (!isAdmin && !isAssignedDriver) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to confirm this delivery',
        })
      }

      if (delivery.status !== 'in_transit') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Delivery must be in transit to confirm',
        })
      }

      // Update delivery with proof of delivery
      const proofOfDelivery = {
        photos: photos || [],
        signature,
        notes,
        confirmed_at: new Date().toISOString(),
        confirmed_by: ctx.session.user.id,
      }

      const updateData: any = {
        status: 'delivered',
        actual_delivery_time: new Date().toISOString(),
        proof_of_delivery: proofOfDelivery,
        customer_rating,
        customer_feedback,
      }

      if (cash_collected !== undefined) {
        updateData.cash_collected = cash_collected
      }

      const { data: updatedDelivery, error: updateError } = await ctx.supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', delivery_id)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        })
      }

      // Update driver status and performance
      if (delivery.driver_id) {
        // Update driver to available
        await ctx.supabase.rpc('update_driver_status', {
          driver_id: delivery.driver_id,
          new_status: 'available',
        })

        // Update driver performance metrics
        const { data: driver } = await ctx.supabase
          .from('drivers')
          .select('total_deliveries, successful_deliveries, rating')
          .eq('id', delivery.driver_id)
          .single()

        if (driver) {
          const newTotalDeliveries = driver.total_deliveries + 1
          const newSuccessfulDeliveries = driver.successful_deliveries + 1
          const newRating = customer_rating 
            ? ((driver.rating * driver.total_deliveries) + customer_rating) / newTotalDeliveries
            : driver.rating

          await ctx.supabase
            .from('drivers')
            .update({
              total_deliveries: newTotalDeliveries,
              successful_deliveries: newSuccessfulDeliveries,
              rating: Math.round(newRating * 100) / 100, // Round to 2 decimal places
            })
            .eq('id', delivery.driver_id)
        }
      }

      // Update order status to delivered
      await ctx.supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', delivery.order_id)

      // Add tracking update
      await addTrackingUpdate(
        ctx.supabase,
        delivery_id,
        'delivered',
        null,
        'Delivery confirmed with proof of delivery'
      )

      // Create audit log
      await createAuditLog(
        ctx.supabase,
        ctx.session.user.id,
        'delivery_confirmed',
        'delivery',
        delivery_id,
        delivery,
        { proof_of_delivery: proofOfDelivery, customer_rating, customer_feedback }
      )

      return updatedDelivery
    }),

  // Statistics endpoints
  getDeliveryStats: adminProcedure
    .input(z.object({
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      driver_id: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { date_from, date_to, driver_id } = input || {}

      let baseQuery = ctx.supabase.from('deliveries')

      if (date_from) {
        baseQuery = baseQuery.gte('created_at', date_from)
      }

      if (date_to) {
        baseQuery = baseQuery.lte('created_at', date_to)
      }

      if (driver_id) {
        baseQuery = baseQuery.eq('driver_id', driver_id)
      }

      // Get delivery counts by status
      const { data: deliveries } = await baseQuery
        .select('status, actual_delivery_time, estimated_delivery_time')

      const totalDeliveries = deliveries?.length || 0
      const completedDeliveries = deliveries?.filter(d => d.status === 'delivered').length || 0
      const pendingDeliveries = deliveries?.filter(d => ['pending', 'assigned', 'picked_up', 'in_transit'].includes(d.status)).length || 0

      // Calculate average delivery time for completed deliveries
      const completedWithTimes = deliveries?.filter(d => 
        d.status === 'delivered' && d.actual_delivery_time && d.estimated_delivery_time
      ) || []

      const totalDeliveryTime = completedWithTimes.reduce((sum, d) => {
        const actual = new Date(d.actual_delivery_time).getTime()
        const estimated = new Date(d.estimated_delivery_time).getTime()
        return sum + (actual - estimated)
      }, 0)

      const averageDeliveryTime = completedWithTimes.length > 0 
        ? totalDeliveryTime / completedWithTimes.length / (1000 * 60) // Convert to minutes
        : 0

      // Calculate on-time delivery rate
      const onTimeDeliveries = completedWithTimes.filter(d => {
        const actual = new Date(d.actual_delivery_time).getTime()
        const estimated = new Date(d.estimated_delivery_time).getTime()
        return actual <= estimated
      }).length

      const onTimeDeliveryRate = completedWithTimes.length > 0 
        ? (onTimeDeliveries / completedWithTimes.length) * 100
        : 0

      const statusBreakdown = {
        pending: deliveries?.filter(d => d.status === 'pending').length || 0,
        assigned: deliveries?.filter(d => d.status === 'assigned').length || 0,
        picked_up: deliveries?.filter(d => d.status === 'picked_up').length || 0,
        in_transit: deliveries?.filter(d => d.status === 'in_transit').length || 0,
        delivered: deliveries?.filter(d => d.status === 'delivered').length || 0,
        failed: deliveries?.filter(d => d.status === 'failed').length || 0,
        cancelled: deliveries?.filter(d => d.status === 'cancelled').length || 0,
      }

      // Get recent delivery trend (last 7 days vs previous 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

      const { data: recentDeliveries } = await ctx.supabase
        .from('deliveries')
        .select('created_at')
        .gte('created_at', fourteenDaysAgo.toISOString())

      const lastWeekDeliveries = recentDeliveries?.filter(d => 
        new Date(d.created_at) >= sevenDaysAgo
      ).length || 0

      const previousWeekDeliveries = recentDeliveries?.filter(d => 
        new Date(d.created_at) < sevenDaysAgo && new Date(d.created_at) >= fourteenDaysAgo
      ).length || 0

      const deliveryTrend = previousWeekDeliveries > 0 ? 
        ((lastWeekDeliveries - previousWeekDeliveries) / previousWeekDeliveries) * 100 : 0

      return {
        totalDeliveries,
        completedDeliveries,
        pendingDeliveries,
        averageDeliveryTime,
        onTimeDeliveryRate,
        statusBreakdown,
        deliveryTrend,
        recentDeliveriesCount: lastWeekDeliveries,
      }
    }),

  getDriverStats: adminProcedure
    .query(async ({ ctx }) => {
      // Get driver statistics
      const { data: drivers } = await ctx.supabase
        .from('drivers')
        .select('status, rating, total_deliveries')

      const totalDrivers = drivers?.length || 0
      const availableDrivers = drivers?.filter(d => d.status === 'available').length || 0
      const busyDrivers = drivers?.filter(d => d.status === 'busy').length || 0
      const offlineDrivers = drivers?.filter(d => d.status === 'offline').length || 0

      const averageRating = drivers && drivers.length > 0 
        ? drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length
        : 0

      const totalDeliveries = drivers?.reduce((sum, d) => sum + d.total_deliveries, 0) || 0

      // Get completed deliveries count
      const { data: completedDeliveries } = await ctx.supabase
        .from('deliveries')
        .select('id')
        .eq('status', 'delivered')

      const completedCount = completedDeliveries?.length || 0

      // Get top performers
      const topPerformers = drivers
        ?.filter(d => d.total_deliveries > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(d => ({
          driver_id: d.id,
          rating: d.rating,
          total_deliveries: d.total_deliveries,
        })) || []

      return {
        totalDrivers,
        availableDrivers,
        busyDrivers,
        offlineDrivers,
        averageRating: Math.round(averageRating * 100) / 100,
        totalDeliveries,
        completedDeliveries: completedCount,
        averageDeliveryTime: 0, // Would need more complex calculation
        topPerformers,
      }
    }),
})