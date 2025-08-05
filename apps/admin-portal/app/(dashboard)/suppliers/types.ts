export interface Supplier {
  id: string
  
  // Company Information
  company_name: string
  registration_number?: string
  tax_id?: string
  website?: string
  
  // Contact Information
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  
  // Address Information
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country: string
  
  // Business Details
  product_categories?: string[]
  payment_terms?: string
  minimum_order_value: number
  lead_time_days: number
  
  // Banking Information
  bank_name?: string
  bank_account_number?: string
  bank_routing_number?: string
  
  // Performance Metrics
  performance_rating: number
  on_time_delivery_rate: number
  quality_score: number
  response_time_hours: number
  
  // Status and Metadata
  status: 'active' | 'inactive' | 'suspended'
  is_preferred: boolean
  documents?: SupplierDocument[]
  notes?: string
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by?: string
  last_order_date?: string
  
  // Computed fields
  total_orders?: number
  total_value?: number
  products_count?: number
}

export interface SupplierDocument {
  id: string
  name: string
  type: 'contract' | 'certificate' | 'license' | 'other'
  url: string
  upload_date: string
  expiry_date?: string
  notes?: string
}

export interface ProductSupplier {
  id: string
  product_id: string
  supplier_id: string
  supplier_sku?: string
  cost_price?: number
  minimum_quantity: number
  lead_time_days: number
  is_primary: boolean
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
  
  // Related data
  product?: {
    id: string
    name_en: string
    sku: string
    base_price: number
  }
  supplier?: {
    id: string
    company_name: string
  }
}

export interface PurchaseOrder {
  id: string
  po_number: string
  supplier_id: string
  
  // Order details
  subtotal: number
  tax_amount: number
  shipping_cost: number
  total_amount: number
  
  // Status and dates
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'completed' | 'cancelled'
  order_date: string
  expected_delivery_date?: string
  actual_delivery_date?: string
  
  // Payment information
  payment_terms?: string
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue'
  
  // Additional information
  notes?: string
  internal_notes?: string
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by: string
  
  // Related data
  supplier?: Supplier
  items?: PurchaseOrderItem[]
  items_count?: number
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  product_id: string
  supplier_sku?: string
  
  // Quantities and pricing
  quantity_ordered: number
  quantity_received: number
  unit_cost: number
  total_cost: number
  
  // Status
  status: 'pending' | 'partial' | 'received' | 'cancelled'
  
  notes?: string
  created_at: string
  
  // Related data
  product?: {
    id: string
    name_en: string
    sku: string
  }
}

export interface SupplierCommunication {
  id: string
  supplier_id: string
  
  // Communication details
  type: 'email' | 'phone' | 'meeting' | 'note' | 'quote_request' | 'order_inquiry'
  subject?: string
  content?: string
  direction: 'inbound' | 'outbound'
  
  // Reference information
  reference_type?: string
  reference_id?: string
  
  // Status and metadata
  status: 'pending' | 'completed' | 'follow_up_needed'
  follow_up_date?: string
  
  // Audit fields
  created_at: string
  created_by: string
  
  // Related data
  created_by_user?: {
    id: string
    full_name?: string
    username: string
  }
}

export interface SupplierFilters {
  search: string
  status: string
  categories: string[]
  payment_terms: string
  performance_rating: {
    min: number
    max: number
  }
  is_preferred?: boolean
  has_recent_orders?: boolean
}

export interface SupplierStats {
  total_suppliers: number
  active_suppliers: number
  preferred_suppliers: number
  average_rating: number
  total_purchase_orders: number
  total_purchase_value: number
}

export interface BulkSupplierActionOptions {
  action: 'activate' | 'deactivate' | 'set_preferred' | 'remove_preferred' | 'update_terms' | 'delete'
  payment_terms?: string
  notes?: string
}

export interface ImportSupplierResult {
  success: boolean
  imported: number
  updated: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}

export interface ExportSupplierOptions {
  format: 'csv' | 'xlsx'
  include_performance: boolean
  include_contacts: boolean
  include_orders: boolean
}

export interface SupplierPerformanceMetrics {
  total_orders: number
  on_time_delivery_rate: number
  quality_score: number
  average_response_time_hours: number
  total_purchase_value: number
  average_order_value: number
  last_order_date?: string
  communication_frequency: number
}