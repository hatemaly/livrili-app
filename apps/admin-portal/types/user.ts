export type UserRole = 'admin' | 'retailer' | 'driver'

export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  username: string
  full_name?: string
  phone?: string
  role: UserRole
  retailer_id?: string
  is_active: boolean
  last_login_at?: string
  login_count: number
  preferred_language: string
  created_at: string
  updated_at: string
  retailers?: {
    id: string
    business_name: string
  }
}

export interface CreateUserData {
  username: string
  password: string
  full_name?: string
  phone?: string
  role: UserRole
  retailer_id?: string
  is_active: boolean
  preferred_language: string
}

export interface UpdateUserData {
  full_name?: string
  phone?: string
  role?: UserRole
  retailer_id?: string
  is_active?: boolean
  preferred_language?: string
}

export interface UserFilters {
  search: string
  role: UserRole | ''
  status: UserStatus | ''
  retailer_id: string | ''
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  byRole: {
    admin: number
    retailer: number
    driver: number
  }
}