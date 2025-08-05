export interface Tag {
  id: string
  name: string
  slug: string
  color: string
  description?: string
  usage_count: number
  created_at: string
  updated_at: string
  tag_aliases?: TagAlias[]
}

export interface TagAlias {
  id: string
  tag_id: string
  alias: string
  created_at: string
}

export interface TagAnalytics extends Tag {
  actual_product_count: number
  category_count: number
  avg_product_price: number
  min_product_price: number
  max_product_price: number
  total_stock: number
}

export interface TagFilters {
  search: string
  sortBy: 'name' | 'usage_count' | 'created_at'
  sortOrder: 'asc' | 'desc'
}

export interface TagFormData {
  name: string
  slug?: string
  color: string
  description?: string
}

export interface TagBulkImport {
  name: string
  color?: string
  description?: string
}

export interface ProductTag {
  id: string
  name: string
  slug: string
  color: string
  usage_count?: number
}