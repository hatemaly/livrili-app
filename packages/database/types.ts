// Database entity types for Livrili application

export type UserRole = 'admin' | 'retailer' | 'driver'
export type RetailerStatus = 'pending' | 'active' | 'suspended' | 'rejected'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cash' | 'credit'
export type PaymentType = 'order_payment' | 'credit_payment'
export type PaymentStatus = 'pending' | 'completed' | 'failed'
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled'
export type DriverStatus = 'available' | 'busy' | 'offline' | 'suspended'
export type VehicleType = 'motorcycle' | 'car' | 'van' | 'truck'

// Base entity interface
interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// User entity
export interface User extends BaseEntity {
  username: string
  full_name?: string
  phone?: string
  role: UserRole
  retailer_id?: string
  is_active: boolean
  last_login_at?: string
  login_count: number
  preferred_language: string
  device_info: any[]
}

// Retailer entity
export interface Retailer extends BaseEntity {
  business_name: string
  business_type?: string
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
  documents: any[]
  metadata: Record<string, any>
}

// Category entity
export interface Category extends BaseEntity {
  parent_id?: string
  name_en: string
  name_ar: string
  name_fr: string
  slug: string
  description_en?: string
  description_ar?: string
  description_fr?: string
  image_url?: string
  display_order: number
  is_active: boolean
}

// Product entity
export interface Product extends BaseEntity {
  sku: string
  barcode?: string
  category_id?: string
  name_en: string
  name_ar: string
  name_fr: string
  description_en?: string
  description_ar?: string
  description_fr?: string
  base_price: number
  cost_price?: number
  tax_rate: number
  stock_quantity: number
  min_stock_level: number
  unit: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  images: string[]
  is_active: boolean
  metadata: Record<string, any>
}

// Order entity
export interface Order extends BaseEntity {
  order_number: string
  retailer_id: string
  created_by_user_id: string
  subtotal: number
  tax_amount: number
  delivery_fee: number
  discount_amount: number
  total_amount: number
  status: OrderStatus
  payment_method: PaymentMethod
  delivery_address: string
  delivery_date?: string
  delivery_time_slot?: string
  notes?: string
  device_info?: Record<string, any>
  metadata: Record<string, any>
}

// Order item entity
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  tax_amount: number
  discount_amount: number
  total_price: number
  notes?: string
  created_at: string
}

// Payment entity
export interface Payment {
  id: string
  order_id?: string
  retailer_id: string
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod
  status: PaymentStatus
  reference_number?: string
  collected_by_user_id?: string
  collected_at?: string
  notes?: string
  metadata: Record<string, any>
  created_at: string
}

// Audit log entity
export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  device_info?: Record<string, any>
  created_at: string
}

// User session entity
export interface UserSession {
  id: string
  user_id: string
  retailer_id?: string
  device_id?: string
  device_info?: Record<string, any>
  ip_address?: string
  user_agent?: string
  last_activity: string
  expires_at?: string
  is_active: boolean
  created_at: string
}

// Extended types with relations
export interface OrderWithDetails extends Order {
  retailer?: Retailer
  created_by_user?: Pick<User, 'id' | 'username' | 'full_name'>
  items?: (OrderItem & {
    product?: Product
  })[]
  payments?: Payment[]
}

export interface RetailerWithDetails extends Retailer {
  users?: User[]
  recent_orders?: Pick<Order, 'id' | 'order_number' | 'total_amount' | 'status' | 'created_at'>[]
  recent_payments?: Pick<Payment, 'id' | 'amount' | 'payment_type' | 'payment_method' | 'status' | 'created_at'>[]
}

export interface ProductWithCategory extends Product {
  category?: Pick<Category, 'name_en' | 'name_ar' | 'name_fr' | 'slug'>
}

// API response types
export interface ListResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  statusBreakdown: {
    pending: number
    confirmed: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  orderTrend: number
  recentOrdersCount: number
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

// Input types for API endpoints
export interface CreateOrderInput {
  retailer_id: string
  items: {
    product_id: string
    quantity: number
    unit_price: number
    tax_amount?: number
    discount_amount?: number
    notes?: string
  }[]
  delivery_address: string
  delivery_date?: string
  delivery_time_slot?: string
  payment_method?: PaymentMethod
  notes?: string
  metadata?: Record<string, any>
}

export interface UpdateOrderInput {
  items?: {
    product_id: string
    quantity: number
    unit_price: number
    tax_amount?: number
    discount_amount?: number
    notes?: string
  }[]
  delivery_address?: string
  delivery_date?: string
  delivery_time_slot?: string
  payment_method?: PaymentMethod
  notes?: string
  metadata?: Record<string, any>
}

export interface OrderFilters {
  status?: OrderStatus
  retailer_id?: string
  payment_method?: PaymentMethod
  date_from?: string
  date_to?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'order_number' | 'total_amount' | 'status' | 'delivery_date'
  sortOrder?: 'asc' | 'desc'
}

export interface BulkStatusUpdate {
  order_ids: string[]
  status: Exclude<OrderStatus, 'pending'>
  notes?: string
}

export interface CancelOrderInput {
  reason: string
  notes?: string
}

// Driver entity
export interface Driver extends BaseEntity {
  user_id?: string
  driver_license: string
  license_expiry: string
  vehicle_type: VehicleType
  vehicle_model?: string
  vehicle_plate: string
  vehicle_year?: number
  status: DriverStatus
  phone: string
  emergency_contact?: string
  current_location?: {
    lat: number
    lng: number
    address?: string
    timestamp?: string
  }
  zone_coverage: string[]
  max_capacity_kg: number
  max_orders_per_trip: number
  rating: number
  total_deliveries: number
  successful_deliveries: number
  performance_metrics: Record<string, any>
  documents: any[]
  metadata: Record<string, any>
}

// Delivery entity
export interface Delivery extends BaseEntity {
  order_id: string
  driver_id?: string
  delivery_number: string
  status: DeliveryStatus
  priority: number
  
  // Pickup details
  pickup_address: string
  pickup_contact?: string
  pickup_notes?: string
  pickup_time_window_start?: string
  pickup_time_window_end?: string
  actual_pickup_time?: string
  
  // Delivery details
  delivery_address: string
  delivery_contact: string
  delivery_notes?: string
  delivery_time_window_start?: string
  delivery_time_window_end?: string
  estimated_delivery_time?: string
  actual_delivery_time?: string
  
  // Package details
  package_weight?: number
  package_dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }
  special_instructions?: string
  cash_to_collect: number
  cash_collected: number
  
  // Tracking
  tracking_updates: any[]
  current_location?: {
    lat: number
    lng: number
    address?: string
    timestamp?: string
  }
  route_optimization_data?: Record<string, any>
  
  // Completion details
  proof_of_delivery?: Record<string, any>
  delivery_attempts: number
  failure_reason?: string
  customer_rating?: number
  customer_feedback?: string
  
  // Financial
  delivery_fee: number
  driver_commission: number
  fuel_cost: number
  
  metadata: Record<string, any>
}

// Delivery route entity
export interface DeliveryRoute extends BaseEntity {
  driver_id: string
  route_name?: string
  route_date: string
  status: string
  total_deliveries: number
  completed_deliveries: number
  estimated_duration?: number
  actual_duration?: number
  total_distance?: number
  route_data?: Record<string, any>
  delivery_ids: string[]
  start_time?: string
  end_time?: string
  metadata: Record<string, any>
}

// Delivery zone entity
export interface DeliveryZone extends BaseEntity {
  name: string
  description?: string
  polygon_coordinates: Record<string, any>
  is_active: boolean
  delivery_fee: number
  estimated_delivery_time: number
  service_days: number[]
  service_hours?: Record<string, any>
  driver_ids: string[]
  metadata: Record<string, any>
}

// Delivery metrics entity
export interface DeliveryMetrics {
  id: string
  delivery_id: string
  driver_id?: string
  metric_date: string
  
  // Time metrics
  pickup_duration?: number
  travel_duration?: number
  delivery_duration?: number
  total_duration?: number
  
  // Distance metrics
  planned_distance?: number
  actual_distance?: number
  
  // Performance metrics
  on_time_delivery: boolean
  successful_delivery: boolean
  customer_satisfaction?: number
  
  // Financial metrics
  fuel_efficiency?: number
  cost_per_delivery?: number
  revenue_per_delivery?: number
  
  metadata: Record<string, any>
  created_at: string
}

// Extended types with relations
export interface DriverWithDetails extends Driver {
  user?: Pick<User, 'id' | 'username' | 'full_name' | 'phone'>
  active_deliveries?: Pick<Delivery, 'id' | 'delivery_number' | 'status' | 'estimated_delivery_time'>[]
  recent_metrics?: DeliveryMetrics[]
}

export interface DeliveryWithDetails extends Delivery {
  order?: Pick<Order, 'id' | 'order_number' | 'total_amount' | 'retailer_id'>
  driver?: Pick<Driver, 'id' | 'user_id' | 'phone' | 'vehicle_type' | 'vehicle_plate'>
  retailer?: Pick<Retailer, 'id' | 'business_name' | 'phone'>
  metrics?: DeliveryMetrics
}

export interface DeliveryRouteWithDetails extends DeliveryRoute {
  driver?: Pick<Driver, 'id' | 'user_id' | 'phone' | 'vehicle_type'>
  deliveries?: Pick<Delivery, 'id' | 'delivery_number' | 'status' | 'delivery_address' | 'estimated_delivery_time'>[]
}

// Input types for delivery endpoints
export interface CreateDriverInput {
  user_id?: string
  driver_license: string
  license_expiry: string
  vehicle_type: VehicleType
  vehicle_model?: string
  vehicle_plate: string
  vehicle_year?: number
  phone: string
  emergency_contact?: string
  zone_coverage: string[]
  max_capacity_kg?: number
  max_orders_per_trip?: number
  documents?: any[]
  metadata?: Record<string, any>
}

export interface UpdateDriverInput {
  driver_license?: string
  license_expiry?: string
  vehicle_type?: VehicleType
  vehicle_model?: string
  vehicle_plate?: string
  vehicle_year?: number
  phone?: string
  emergency_contact?: string
  zone_coverage?: string[]
  max_capacity_kg?: number
  max_orders_per_trip?: number
  status?: DriverStatus
  current_location?: {
    lat: number
    lng: number
    address?: string
  }
  documents?: any[]
  metadata?: Record<string, any>
}

export interface CreateDeliveryInput {
  order_id: string
  priority?: number
  pickup_address: string
  pickup_contact?: string
  pickup_notes?: string
  pickup_time_window_start?: string
  pickup_time_window_end?: string
  delivery_address: string
  delivery_contact: string
  delivery_notes?: string
  delivery_time_window_start?: string
  delivery_time_window_end?: string
  package_weight?: number
  package_dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }
  special_instructions?: string
  cash_to_collect?: number
  delivery_fee?: number
  metadata?: Record<string, any>
}

export interface UpdateDeliveryInput {
  driver_id?: string
  status?: DeliveryStatus
  priority?: number
  pickup_notes?: string
  delivery_notes?: string
  pickup_time_window_start?: string
  pickup_time_window_end?: string
  delivery_time_window_start?: string
  delivery_time_window_end?: string
  estimated_delivery_time?: string
  actual_pickup_time?: string
  actual_delivery_time?: string
  package_weight?: number
  package_dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }
  special_instructions?: string
  cash_to_collect?: number
  cash_collected?: number
  current_location?: {
    lat: number
    lng: number
    address?: string
  }
  proof_of_delivery?: Record<string, any>
  failure_reason?: string
  customer_rating?: number
  customer_feedback?: string
  delivery_fee?: number
  driver_commission?: number
  fuel_cost?: number
  metadata?: Record<string, any>
}

export interface DeliveryFilters {
  status?: DeliveryStatus
  driver_id?: string
  order_id?: string
  date_from?: string
  date_to?: string
  priority?: number
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'delivery_number' | 'status' | 'estimated_delivery_time' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

export interface DriverFilters {
  status?: DriverStatus
  vehicle_type?: VehicleType
  zone?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'rating' | 'total_deliveries' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface AssignDriverInput {
  delivery_id: string
  driver_id: string
  estimated_pickup_time?: string
  estimated_delivery_time?: string
  notes?: string
}

export interface ProofOfDeliveryInput {
  delivery_id: string
  photos?: string[]
  signature?: string
  notes?: string
  customer_rating?: number
  customer_feedback?: string
  cash_collected?: number
}

export interface RouteOptimizationInput {
  driver_id: string
  delivery_ids: string[]
  start_location?: {
    lat: number
    lng: number
    address?: string
  }
  optimization_criteria?: 'time' | 'distance' | 'priority'
}

// Statistics types
export interface DeliveryStats {
  totalDeliveries: number
  completedDeliveries: number
  pendingDeliveries: number
  averageDeliveryTime: number
  onTimeDeliveryRate: number
  statusBreakdown: {
    pending: number
    assigned: number
    picked_up: number
    in_transit: number
    delivered: number
    failed: number
    cancelled: number
  }
  deliveryTrend: number
  recentDeliveriesCount: number
}

export interface DriverStats {
  totalDrivers: number
  availableDrivers: number
  busyDrivers: number
  offlineDrivers: number
  averageRating: number
  totalDeliveries: number
  completedDeliveries: number
  averageDeliveryTime: number
  topPerformers: {
    driver_id: string
    rating: number
    total_deliveries: number
  }[]
}