# Orders API Documentation

This document provides comprehensive documentation for the Orders API endpoints in the Livrili admin portal.

## Overview

The Orders API provides complete order management functionality including:
- Order creation and management
- Status tracking and updates  
- Stock management integration
- Audit logging
- Bulk operations
- Analytics and reporting

## Database Schema

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  retailer_id UUID REFERENCES retailers(id) NOT NULL,
  created_by_user_id UUID REFERENCES users(id) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_method payment_method DEFAULT 'cash',
  delivery_address TEXT NOT NULL,
  delivery_date DATE,
  delivery_time_slot VARCHAR(50),
  notes TEXT,
  device_info JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### 1. Get All Orders - `orders.getAll`

Retrieve paginated list of orders with filtering options.

**Access:** Admin only

**Input:**
```typescript
{
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  retailer_id?: string
  payment_method?: 'cash' | 'credit'
  date_from?: string // ISO date string
  date_to?: string   // ISO date string
  search?: string    // Search by order number
  limit?: number     // Default: 20, Max: 100
  offset?: number    // Default: 0
  sortBy?: 'created_at' | 'order_number' | 'total_amount' | 'status' | 'delivery_date'
  sortOrder?: 'asc' | 'desc' // Default: 'desc'
}
```

**Output:**
```typescript
{
  items: Order[]
  total: number
  limit: number
  offset: number
}
```

**Example Usage:**
```typescript
const { data } = await trpc.orders.getAll.query({
  status: 'pending',
  date_from: '2024-01-01',
  limit: 20,
  sortBy: 'created_at'
})
```

### 2. Get Order by ID - `orders.getById`

Retrieve complete order details including items, retailer info, and payments.

**Access:** Admin only

**Input:** `string` (order ID)

**Output:**
```typescript
{
  ...Order,
  retailer: RetailerInfo,
  created_by_user: UserInfo,
  items: OrderItem[],
  payments: Payment[]
}
```

**Example Usage:**
```typescript
const { data: order } = await trpc.orders.getById.query('order-uuid')
```

### 3. Create Order - `orders.create`

Create a new order with automatic stock management and validation.

**Access:** Admin only

**Input:**
```typescript
{
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
  payment_method?: 'cash' | 'credit'
  notes?: string
  metadata?: Record<string, any>
}
```

**Validation Rules:**
- Retailer must exist and be active
- All products must exist and be active
- Sufficient stock must be available
- Credit limit validation for credit payments
- Automatic order number generation

**Stock Management:**
- Automatically decrements product stock
- Updates retailer balance for credit orders
- Creates audit logs

**Example Usage:**
```typescript
const { data: newOrder } = await trpc.orders.create.mutate({
  retailer_id: 'retailer-uuid',
  items: [
    {
      product_id: 'product-uuid',
      quantity: 2,
      unit_price: 50.00
    }
  ],
  delivery_address: '123 Main St, Algiers',
  payment_method: 'cash'
})
```

### 4. Update Order - `orders.update`

Update order details (only for pending orders).

**Access:** Admin only

**Input:**
```typescript
{
  id: string
  data: {
    items?: OrderItem[]
    delivery_address?: string
    delivery_date?: string
    delivery_time_slot?: string
    payment_method?: 'cash' | 'credit'
    notes?: string
    metadata?: Record<string, any>
  }
}
```

**Business Rules:**
- Only pending orders can be updated
- Stock is automatically managed when items change
- Recalculates totals when items are modified

### 5. Update Order Status - `orders.updateStatus`

Change order status with validation of allowed transitions.

**Access:** Admin only

**Input:**
```typescript
{
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
}
```

**Status Transition Rules:**
- `pending` → `confirmed`, `cancelled`
- `confirmed` → `processing`, `cancelled`
- `processing` → `shipped`, `cancelled`
- `shipped` → `delivered`
- `delivered` → (final state)
- `cancelled` → (final state)

**Example Usage:**
```typescript
await trpc.orders.updateStatus.mutate({
  id: 'order-uuid',
  status: 'confirmed',
  notes: 'Order confirmed by admin'
})
```

### 6. Cancel Order - `orders.cancel`

Cancel an order with reason and automatic stock restoration.

**Access:** Admin only

**Input:**
```typescript
{
  id: string
  reason: string
  notes?: string
}
```

**Automatic Actions:**
- Restores product stock (for confirmed/processing orders)
- Restores retailer balance (for credit payments)
- Updates order status to 'cancelled'
- Adds cancellation metadata
- Creates audit log

**Example Usage:**
```typescript
await trpc.orders.cancel.mutate({
  id: 'order-uuid',
  reason: 'Customer request',
  notes: 'Customer changed mind about order'
})
```

### 7. Get Order Statistics - `orders.getOrderStats`

Retrieve order analytics and metrics for dashboard.

**Access:** Admin only

**Input:**
```typescript
{
  date_from?: string
  date_to?: string
  retailer_id?: string
}
```

**Output:**
```typescript
{
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
  orderTrend: number        // Percentage change vs previous period
  recentOrdersCount: number // Last 7 days
}
```

### 8. Bulk Update Status - `orders.bulkUpdateStatus`

Update multiple orders' status in a single operation.

**Access:** Admin only

**Input:**
```typescript
{
  order_ids: string[]  // Max 50 orders
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
}
```

**Validation:**
- All orders must exist
- All status transitions must be valid
- Atomic operation (all succeed or all fail)

**Output:**
```typescript
{
  updated_count: number
  updated_orders: Order[]
}
```

### 9. Get Retailer Orders - `orders.getRetailerOrders`

Get orders for the current retailer user (retail portal).

**Access:** Authenticated retailer users

**Input:**
```typescript
{
  status?: OrderStatus
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'order_number' | 'total_amount' | 'status'
  sortOrder?: 'asc' | 'desc'
}
```

**Security:**
- Automatically filters by user's retailer_id
- Only returns orders belonging to the retailer

## Stock Management Functions

The API integrates with PostgreSQL functions for safe stock management:

### Available Functions

1. **`decrement_stock(product_id, quantity)`**
   - Safely decrements product stock
   - Prevents negative stock
   - Uses row-level locking

2. **`increment_stock(product_id, quantity)`**
   - Increases product stock (for cancellations)
   - Used in order cancellation process

3. **`reserve_stock(product_id, quantity)`**
   - Reserves stock for order confirmation
   - Uses metadata field for tracking

4. **`release_reserved_stock(product_id, quantity)`**
   - Releases reserved stock
   - Used in order cancellation

5. **`get_available_stock(product_id)`**
   - Returns available stock (total - reserved)
   - Useful for UI stock checks

## Audit Logging

All order operations are automatically logged:

```typescript
interface AuditLog {
  user_id: string
  action: string           // e.g., 'order_created', 'order_status_updated'
  resource_type: 'order'
  resource_id: string      // order ID
  old_values?: any         // Previous state
  new_values?: any         // New state
  created_at: string
}
```

**Logged Actions:**
- `order_created`
- `order_updated`
- `order_status_updated`
- `order_cancelled`
- `order_bulk_status_updated`

## Error Handling

### Common Error Codes

- **`NOT_FOUND`**: Order, retailer, or product not found
- **`UNAUTHORIZED`**: User not authenticated
- **`FORBIDDEN`**: Admin access required
- **`PRECONDITION_FAILED`**: Business rule violations
  - Inactive retailer
  - Insufficient stock
  - Invalid status transition
  - Credit limit exceeded
- **`CONFLICT`**: Duplicate order number (rare)
- **`INTERNAL_SERVER_ERROR`**: Database or system errors

### Error Response Format

```typescript
{
  code: string
  message: string
  data?: {
    zodError?: any  // Validation errors
  }
}
```

## Performance Considerations

1. **Pagination**: Always use limit/offset for large datasets
2. **Indexing**: Database indexes on commonly filtered fields
3. **Caching**: Consider caching statistics queries
4. **Bulk Operations**: Use bulk endpoints for multiple updates
5. **Stock Locking**: Row-level locking prevents race conditions

## Security Features

1. **Role-Based Access**: Admin-only for most operations
2. **Row-Level Security**: Retailers see only their orders
3. **Input Validation**: Comprehensive Zod schema validation
4. **Audit Trail**: Complete action logging
5. **SQL Injection Protection**: Parameterized queries via Supabase

## Usage Examples

See `/packages/api/examples/orders-usage.ts` for comprehensive frontend usage examples including:

- Orders list with filtering
- Order details page
- Order creation form
- Status management
- Bulk operations
- Retailer portal integration

## Testing

Comprehensive test suite available at `/packages/api/src/routers/__tests__/orders.test.ts` covering:

- All endpoint functionality
- Error conditions
- Business rule validation
- Edge cases
- Stock management
- Audit logging

Run tests with:
```bash
npm test orders
```

## Migration

Database functions are defined in:
`/packages/database/supabase/migrations/004_stock_management_functions.sql`

Apply with:
```bash
npx supabase db push
```