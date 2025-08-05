import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createContext } from '../../context'
import { ordersRouter } from '../orders'
import { TRPCError } from '@trpc/server'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
}

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
}

describe('Orders Router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnValue(mockQuery)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createMockContext = (isAdmin = true, userId = 'test-user-id') => ({
    supabase: mockSupabase,
    session: {
      user: { id: userId },
    },
  })

  describe('getAll', () => {
    it('should return paginated orders list for admin', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'ORD-123456',
          total_amount: 100.00,
          status: 'pending',
          retailer: { business_name: 'Test Store' },
        },
      ]

      mockQuery.single.mockResolvedValueOnce({
        data: mockOrders,
        error: null,
        count: 1,
      })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const result = await caller.getAll({
        limit: 10,
        offset: 0,
        status: 'pending',
      })

      expect(result).toEqual({
        items: mockOrders,
        total: 1,
        limit: 10,
        offset: 0,
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'pending')
    })

    it('should apply search filter correctly', async () => {
      const caller = ordersRouter.createCaller(createMockContext(true))

      await caller.getAll({
        search: 'ORD-123',
      })

      expect(mockQuery.or).toHaveBeenCalledWith('order_number.ilike.%ORD-123%')
    })

    it('should apply date range filters', async () => {
      const caller = ordersRouter.createCaller(createMockContext(true))

      await caller.getAll({
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      })

      expect(mockQuery.gte).toHaveBeenCalledWith('created_at', '2024-01-01')
      expect(mockQuery.lte).toHaveBeenCalledWith('created_at', '2024-01-31')
    })
  })

  describe('getById', () => {
    it('should return order with full details', async () => {
      const mockOrder = {
        id: 'order-1',
        order_number: 'ORD-123456',
        total_amount: 100.00,
        retailer: { business_name: 'Test Store' },
      }

      const mockItems = [
        {
          id: 'item-1',
          product_id: 'product-1',
          quantity: 2,
          product: { name_en: 'Test Product' },
        },
      ]

      const mockPayments = [
        {
          id: 'payment-1',
          amount: 100.00,
          status: 'completed',
        },
      ]

      mockQuery.single
        .mockResolvedValueOnce({ data: mockOrder, error: null })
        .mockResolvedValueOnce({ data: mockItems, error: null })
        .mockResolvedValueOnce({ data: mockPayments, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const result = await caller.getById('order-1')

      expect(result).toEqual({
        ...mockOrder,
        items: mockItems,
        payments: mockPayments,
      })
    })

    it('should throw NOT_FOUND error for non-existent order', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      })

      const caller = ordersRouter.createCaller(createMockContext(true))

      await expect(caller.getById('non-existent-id')).rejects.toThrow(TRPCError)
      await expect(caller.getById('non-existent-id')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Order not found',
      })
    })
  })

  describe('create', () => {
    it('should create order successfully', async () => {
      const mockRetailer = {
        id: 'retailer-1',
        status: 'active',
        credit_limit: 1000,
        current_balance: 500,
      }

      const mockProduct = {
        id: 'product-1',
        name_en: 'Test Product',
        base_price: 50.00,
        stock_quantity: 10,
        is_active: true,
      }

      const mockNewOrder = {
        id: 'new-order-1',
        order_number: 'ORD-789012',
        total_amount: 100.00,
      }

      mockQuery.single
        .mockResolvedValueOnce({ data: mockRetailer, error: null })
        .mockResolvedValueOnce({ data: mockProduct, error: null })
        .mockResolvedValueOnce({ data: mockNewOrder, error: null })

      mockQuery.insert.mockReturnValue(mockQuery)
      mockSupabase.rpc.mockResolvedValue({ error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const orderData = {
        retailer_id: 'retailer-1',
        items: [
          {
            product_id: 'product-1',
            quantity: 2,
            unit_price: 50.00,
          },
        ],
        delivery_address: '123 Test Street',
        payment_method: 'cash' as const,
      }

      const result = await caller.create(orderData)

      expect(result).toEqual(mockNewOrder)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('decrement_stock', {
        product_id: 'product-1',
        quantity: 2,
      })
    })

    it('should throw error for inactive retailer', async () => {
      const mockRetailer = {
        id: 'retailer-1',
        status: 'suspended',
      }

      mockQuery.single.mockResolvedValueOnce({ data: mockRetailer, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const orderData = {
        retailer_id: 'retailer-1',
        items: [
          {
            product_id: 'product-1',
            quantity: 2,
            unit_price: 50.00,
          },
        ],
        delivery_address: '123 Test Street',
      }

      await expect(caller.create(orderData)).rejects.toThrow(TRPCError)
      await expect(caller.create(orderData)).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: 'Retailer is not active',
      })
    })

    it('should throw error for insufficient stock', async () => {
      const mockRetailer = {
        id: 'retailer-1',
        status: 'active',
        credit_limit: 1000,
        current_balance: 500,
      }

      const mockProduct = {
        id: 'product-1',
        name_en: 'Test Product',
        base_price: 50.00,
        stock_quantity: 1, // Insufficient stock
        is_active: true,
      }

      mockQuery.single
        .mockResolvedValueOnce({ data: mockRetailer, error: null })
        .mockResolvedValueOnce({ data: mockProduct, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const orderData = {
        retailer_id: 'retailer-1',
        items: [
          {
            product_id: 'product-1',
            quantity: 2, // More than available
            unit_price: 50.00,
          },
        ],
        delivery_address: '123 Test Street',
      }

      await expect(caller.create(orderData)).rejects.toThrow(TRPCError)
      await expect(caller.create(orderData)).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: 'Insufficient stock for product: Test Product',
      })
    })

    it('should check credit limit for credit payments', async () => {
      const mockRetailer = {
        id: 'retailer-1',
        status: 'active',
        credit_limit: 100, // Low credit limit
        current_balance: -50, // Already in debt
      }

      const mockProduct = {
        id: 'product-1',
        name_en: 'Test Product',
        base_price: 100.00,
        stock_quantity: 10,
        is_active: true,
      }

      mockQuery.single
        .mockResolvedValueOnce({ data: mockRetailer, error: null })
        .mockResolvedValueOnce({ data: mockProduct, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const orderData = {
        retailer_id: 'retailer-1',
        items: [
          {
            product_id: 'product-1',
            quantity: 1,
            unit_price: 100.00,
          },
        ],
        delivery_address: '123 Test Street',
        payment_method: 'credit' as const,
      }

      await expect(caller.create(orderData)).rejects.toThrow(TRPCError)
      await expect(caller.create(orderData)).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: 'Order exceeds available credit limit',
      })
    })
  })

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      const mockCurrentOrder = {
        id: 'order-1',
        status: 'pending',
      }

      const mockUpdatedOrder = {
        ...mockCurrentOrder,
        status: 'confirmed',
      }

      mockQuery.single
        .mockResolvedValueOnce({ data: mockCurrentOrder, error: null })
        .mockResolvedValueOnce({ data: mockUpdatedOrder, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const result = await caller.updateStatus({
        id: 'order-1',
        status: 'confirmed',
        notes: 'Order confirmed by admin',
      })

      expect(result).toEqual(mockUpdatedOrder)
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'confirmed',
        notes: 'Order confirmed by admin',
      })
    })

    it('should validate status transitions', async () => {
      const mockCurrentOrder = {
        id: 'order-1',
        status: 'delivered', // Cannot transition from delivered
      }

      mockQuery.single.mockResolvedValueOnce({ data: mockCurrentOrder, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      await expect(
        caller.updateStatus({
          id: 'order-1',
          status: 'confirmed',
        })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.updateStatus({
          id: 'order-1',
          status: 'confirmed',
        })
      ).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: 'Invalid status transition from delivered to confirmed',
      })
    })
  })

  describe('cancel', () => {
    it('should cancel order and restore stock', async () => {
      const mockCurrentOrder = {
        id: 'order-1',
        status: 'confirmed',
        payment_method: 'cash',
        total_amount: 100.00,
        retailer_id: 'retailer-1',
      }

      const mockOrderItems = [
        {
          product_id: 'product-1',
          quantity: 2,
        },
      ]

      const mockCancelledOrder = {
        ...mockCurrentOrder,
        status: 'cancelled',
      }

      mockQuery.single
        .mockResolvedValueOnce({ data: mockCurrentOrder, error: null })
        .mockResolvedValueOnce({ data: mockOrderItems, error: null })
        .mockResolvedValueOnce({ data: mockCancelledOrder, error: null })

      mockSupabase.rpc.mockResolvedValue({ error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const result = await caller.cancel({
        id: 'order-1',
        reason: 'Customer request',
        notes: 'Customer changed mind',
      })

      expect(result).toEqual(mockCancelledOrder)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_stock', {
        product_id: 'product-1',
        quantity: 2,
      })
    })

    it('should not allow cancellation of delivered orders', async () => {
      const mockCurrentOrder = {
        id: 'order-1',
        status: 'delivered',
      }

      mockQuery.single.mockResolvedValueOnce({ data: mockCurrentOrder, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      await expect(
        caller.cancel({
          id: 'order-1',
          reason: 'Customer request',
        })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.cancel({
          id: 'order-1',
          reason: 'Customer request',
        })
      ).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: 'Order cannot be cancelled',
      })
    })
  })

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      const mockOrders = [
        { status: 'pending', total_amount: 100 },
        { status: 'delivered', total_amount: 200 },
        { status: 'cancelled', total_amount: 50 },
      ]

      const mockRecentOrders = [
        { created_at: new Date().toISOString(), total_amount: 100 },
        { created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), total_amount: 200 },
      ]

      mockQuery.single
        .mockResolvedValueOnce({ data: mockOrders, error: null })
        .mockResolvedValueOnce({ data: mockRecentOrders, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const result = await caller.getOrderStats({
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      })

      expect(result).toMatchObject({
        totalOrders: 3,
        totalRevenue: 350,
        averageOrderValue: expect.any(Number),
        statusBreakdown: {
          pending: 1,
          delivered: 1,
          cancelled: 1,
          confirmed: 0,
          processing: 0,
          shipped: 0,
        },
      })
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should update multiple orders status', async () => {
      const mockOrders = [
        { id: 'order-1', status: 'pending' },
        { id: 'order-2', status: 'pending' },
      ]

      const mockUpdatedOrders = [
        { id: 'order-1', status: 'confirmed' },
        { id: 'order-2', status: 'confirmed' },
      ]

      mockQuery.single
        .mockResolvedValueOnce({ data: mockOrders, error: null })
        .mockResolvedValueOnce({ data: mockUpdatedOrders, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      const result = await caller.bulkUpdateStatus({
        order_ids: ['order-1', 'order-2'],
        status: 'confirmed',
        notes: 'Bulk confirmation',
      })

      expect(result).toEqual({
        updated_count: 2,
        updated_orders: mockUpdatedOrders,
      })
    })

    it('should validate all status transitions before updating', async () => {
      const mockOrders = [
        { id: 'order-1', status: 'pending' },
        { id: 'order-2', status: 'delivered' }, // Invalid transition
      ]

      mockQuery.single.mockResolvedValueOnce({ data: mockOrders, error: null })

      const caller = ordersRouter.createCaller(createMockContext(true))

      await expect(
        caller.bulkUpdateStatus({
          order_ids: ['order-1', 'order-2'],
          status: 'confirmed',
        })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.bulkUpdateStatus({
          order_ids: ['order-1', 'order-2'],
          status: 'confirmed',
        })
      ).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: expect.stringContaining('Invalid status transitions'),
      })
    })
  })
})