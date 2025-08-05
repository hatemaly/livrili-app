export type RetailerStatus = 'pending' | 'active' | 'suspended' | 'rejected'

export type BusinessType = 'grocery' | 'supermarket' | 'convenience' | 'restaurant' | 'cafe' | 'other'

export type DocumentType = 'business_license' | 'tax_certificate' | 'id_document' | 'bank_statement' | 'other'

export interface Document {
  id?: string
  name: string
  url: string
  type: DocumentType
  uploaded_at: string
}

export interface Retailer {
  id: string
  business_name: string
  business_type?: BusinessType
  registration_number?: string
  tax_number?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  credit_limit: number
  current_balance: number
  status: RetailerStatus
  approval_date?: string
  approved_by?: string
  rejection_reason?: string
  documents: Document[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface RetailerUser {
  id: string
  username: string
  full_name?: string
  email?: string
  role: string
  is_active: boolean
  last_login_at?: string
}

export interface RetailerOrder {
  id: string
  order_number: string
  total_amount: number
  status: string
  created_at: string
}

export interface RetailerPayment {
  id: string
  amount: number
  payment_type: string
  payment_method: string
  status: string
  created_at: string
}

export interface RetailerWithDetails extends Retailer {
  users?: RetailerUser[]
  recentOrders?: RetailerOrder[]
  recentPayments?: RetailerPayment[]
}

export interface RetailerStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  deliveredOrders: number
  totalPaid: number
  currentBalance: number
  creditLimit: number
  creditUsed: number
}

export interface RetailerFormData {
  business_name: string
  business_type?: BusinessType
  registration_number?: string
  tax_number?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  credit_limit: number
  status?: RetailerStatus
  documents?: Document[]
}

export interface CreditStatus {
  status: 'No Credit' | 'Over Limit' | 'Low Credit' | 'Good Standing'
  color: string
  bgColor: string
}

export interface RetailerListFilters {
  status?: RetailerStatus
  search?: string
  businessType?: BusinessType
  creditStatus?: 'good' | 'overlimit' | 'nocredit'
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'business_name' | 'status' | 'credit_limit'
  sortOrder?: 'asc' | 'desc'
}

export interface RetailerListResponse {
  items: Retailer[]
  total: number
  limit: number
  offset: number
}