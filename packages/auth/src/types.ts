export type UserRole = 'admin' | 'retailer' | 'driver'

export interface User {
  id: string
  email?: string
  username: string
  fullName?: string
  phone?: string
  role: UserRole
  retailerId?: string
  isActive: boolean
  preferredLanguage: string
  lastLoginAt?: Date
  loginCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Retailer {
  id: string
  businessName: string
  businessType?: string
  registrationNumber?: string
  taxNumber?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  creditLimit: number
  currentBalance: number
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  approvalDate?: Date
  approvedBy?: string
  rejectionReason?: string
  documents: any[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  user: User
  retailer?: Retailer
  accessToken: string
  refreshToken?: string
  expiresAt: Date
}