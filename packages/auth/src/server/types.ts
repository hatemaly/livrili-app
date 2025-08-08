export interface AuthTokenPayload {
  userId: string
  username: string
  role: string
  retailerId?: string
}

export interface LoginAttempt {
  id: string
  user_id: string
  ip_address: string
  user_agent?: string
  success: boolean
  action: 'login' | 'logout' | 'password_change'
  created_at: string
}

export interface AuthUser {
  id: string
  username: string
  full_name: string
  email?: string
  role: 'admin' | 'retailer' | 'driver'
  retailer_id?: string
  preferred_language: string
  is_active: boolean
  must_change_password?: boolean
  password_hash?: string
  temp_password?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface AuthToken {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

export interface LoginResult {
  success: boolean
  user?: AuthUser
  token?: string
  expiresAt?: string
  requiresPasswordChange?: boolean
  message?: string
}

export interface ValidationResult {
  valid: boolean
  user?: AuthUser
  error?: string
}