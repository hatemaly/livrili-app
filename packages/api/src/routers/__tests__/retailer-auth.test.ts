import { describe, it, expect, vi, beforeEach } from 'vitest'
import { retailerAuthRouter } from '../retailer-auth'

// Mock Supabase client
const mockSupabase = {
  rpc: vi.fn(),
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
}

const createMockContext = (overrides = {}) => ({
  supabase: mockSupabase,
  headers: new Map(),
  session: null,
  user: null,
  ...overrides,
})

describe('retailerAuthRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        success: true,
        token: 'mock-auth-token',
        user: {
          id: 'user-123',
          username: 'testuser',
          full_name: 'Test User',
          role: 'retailer',
          retailer_id: 'retailer-123',
          preferred_language: 'ar',
          must_change_password: false,
        },
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const ctx = createMockContext({
        headers: new Map([
          ['user-agent', 'Mozilla/5.0'],
          ['x-forwarded-for', '192.168.1.1'],
        ]),
      })

      const caller = retailerAuthRouter.createCaller(ctx)
      
      const result = await caller.login({
        username: 'testuser',
        password: 'password123',
        deviceInfo: {
          deviceType: 'mobile',
          browser: 'Chrome',
          os: 'Android',
        },
      })

      expect(result).toEqual({
        success: true,
        token: 'mock-auth-token',
        user: mockResponse.user,
        mustChangePassword: false,
      })

      expect(mockSupabase.rpc).toHaveBeenCalledWith('authenticate_user', {
        p_username: 'testuser',
        p_password: 'password123',
        p_device_info: expect.objectContaining({
          deviceType: 'mobile',
          browser: 'Chrome',
          os: 'Android',
          timestamp: expect.any(String),
        }),
        p_ip_address: '192.168.1.1',
        p_user_agent: 'Mozilla/5.0',
      })
    })

    it('should handle invalid credentials', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid username or password',
        attempts_remaining: 3,
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const ctx = createMockContext({
        headers: new Map([['user-agent', 'Mozilla/5.0']]),
      })

      const caller = retailerAuthRouter.createCaller(ctx)
      
      await expect(
        caller.login({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid username or password')
    })

    it('should handle account lockout', async () => {
      const mockResponse = {
        success: false,
        error: 'Account is locked. Please contact support.',
        locked_until: '2024-01-01T12:00:00Z',
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const ctx = createMockContext({
        headers: new Map([['user-agent', 'Mozilla/5.0']]),
      })

      const caller = retailerAuthRouter.createCaller(ctx)
      
      await expect(
        caller.login({
          username: 'testuser',
          password: 'password123',
        })
      ).rejects.toThrow('Account is locked. Please contact support.')
    })
  })

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const mockResponse = {
        valid: true,
        user: {
          id: 'user-123',
          username: 'testuser',
          full_name: 'Test User',
          role: 'retailer',
          retailer_id: 'retailer-123',
          preferred_language: 'ar',
        },
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const ctx = createMockContext()
      const caller = retailerAuthRouter.createCaller(ctx)
      
      const result = await caller.validateToken({
        token: 'valid-token',
      })

      expect(result).toEqual({
        valid: true,
        user: mockResponse.user,
      })

      expect(mockSupabase.rpc).toHaveBeenCalledWith('validate_auth_token', {
        p_token: 'valid-token',
      })
    })

    it('should reject invalid token', async () => {
      const mockResponse = {
        valid: false,
        error: 'Invalid or expired token',
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const ctx = createMockContext()
      const caller = retailerAuthRouter.createCaller(ctx)
      
      const result = await caller.validateToken({
        token: 'invalid-token',
      })

      expect(result).toEqual({
        valid: false,
        error: 'Invalid or expired token',
      })
    })
  })

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockResponse = {
        success: true,
        message: 'Logged out successfully',
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const ctx = createMockContext()
      const caller = retailerAuthRouter.createCaller(ctx)
      
      const result = await caller.logout({
        token: 'auth-token',
      })

      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
      })

      expect(mockSupabase.rpc).toHaveBeenCalledWith('logout_user', {
        p_token: 'auth-token',
      })
    })
  })
})