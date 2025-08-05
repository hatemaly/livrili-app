export interface Product {
  id: string
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
  is_active: boolean
  images?: ProductImage[]
  variants?: ProductVariant[]
  categories?: Category
  supplier?: Supplier
  related_products?: Product[]
  tags?: ProductTag[]
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text?: string
  sort_order: number
  is_primary: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string
  barcode?: string
  price_adjustment: number
  stock_quantity: number
  attributes: VariantAttribute[]
  is_active: boolean
}

export interface VariantAttribute {
  name: string
  value: string
}

export interface Category {
  id: string
  name_en: string
  name_ar: string
  name_fr: string
  parent_id?: string
}

export interface Supplier {
  id: string
  name: string
  contact_email?: string
  contact_phone?: string
}

export interface ProductFilters {
  search: string
  category: string
  tags: string[]
  priceRange: {
    min: number
    max: number
  }
  stockStatus: string
  supplier: string
  isActive?: boolean
}

export interface BulkActionOptions {
  action: 'activate' | 'deactivate' | 'updatePrice' | 'updateStock' | 'delete'
  value?: number
  percentage?: number
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
}

export interface ExportOptions {
  format: 'csv' | 'xlsx'
  includeVariants: boolean
  includeImages: boolean
}

export interface ProductTag {
  id: string
  name: string
  slug: string
  color: string
  usage_count?: number
}