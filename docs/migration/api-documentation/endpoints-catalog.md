# API Endpoints Catalog

This document catalogs all tRPC procedures organized by router, providing complete API surface area documentation for the migration.

## Router Structure Overview

The API is organized into the following routers:

```typescript
appRouter = {
  retailer: {
    profile: retailerRouter.profile,
    cart: retailerCartAliasRouter,
    products: retailerProductsRouter,
    orders: retailerOrdersRouter,
  },
  users: usersRouter,
  products: productsRouter,
  categories: categoriesRouter,
  retailers: retailersRouter,
  orders: ordersRouter,
  analytics: analyticsRouter,
  payments: paymentsRouter,
  deliveries: deliveriesRouter,
  communications: communicationsRouter,
  intelligence: intelligenceRouter,
  reports: reportsRouter,
  tags: tagsRouter,
  suppliers: suppliersRouter,
}
```

## Authentication & Authorization Levels

- **`publicProcedure`**: No authentication required
- **`protectedProcedure`**: Valid session required
- **`adminProcedure`**: Admin role + active status required
- **`retailerProcedure`**: Retailer role + active retailer account required

## Core Entity Routers

### 1. Products Router (`products`)
**Authorization**: Admin only  
**Purpose**: Product catalog management

| Endpoint | Type | Input Schema | Purpose |
|----------|------|-------------|---------|
| `list` | Query | `categoryId?, search?, tagIds?, includeInactive?, limit, offset, sortBy, sortOrder` | Get paginated product list with filters |
| `getById` | Query | `string (UUID)` | Get product by ID with category |
| `getBySku` | Query | `string` | Get product by SKU |
| `create` | Mutation | `productSchema` | Create new product |
| `update` | Mutation | `{id: UUID, data: Partial<productSchema>}` | Update existing product |
| `delete` | Mutation | `string (UUID)` | Delete product (validates no orders) |
| `updateStock` | Mutation | `{id: UUID, quantity: number, operation: 'set'|'add'|'subtract'}` | Manage inventory |
| `getTags` | Query | `string (UUID)` | Get product tags |
| `addTags` | Mutation | `{productId: UUID, tagIds: UUID[]}` | Add tags to product |
| `removeTags` | Mutation | `{productId: UUID, tagIds: UUID[]}` | Remove tags from product |
| `getByTag` | Query | `{tagId: string, limit?, offset?, includeInactive?}` | Get products by tag |
| `bulkTagOperation` | Mutation | `{productIds: UUID[], operation: 'add'|'remove'|'replace', tagIds: UUID[]}` | Bulk tag operations |

**Business Logic**:
- SKU uniqueness validation
- Stock management with negative prevention
- Product-order relationship validation before deletion
- Multi-language support (en/ar/fr)
- Tag association management

### 2. Orders Router (`orders`)
**Authorization**: Admin only  
**Purpose**: Order management and processing

| Endpoint | Type | Input Schema | Purpose |
|----------|------|-------------|---------|
| `getAll` | Query | `status?, retailer_id?, payment_method?, date_from?, date_to?, search?, limit, offset, sortBy, sortOrder` | Get filtered/paginated orders |
| `getById` | Query | `string (UUID)` | Get order with full details (items, payments) |
| `create` | Mutation | `createOrderSchema` | Create new order (manual admin creation) |
| `update` | Mutation | `{id: UUID, data: updateOrderSchema}` | Update pending orders only |
| `updateStatus` | Mutation | `{id: UUID, status, notes?}` | Update order status with validation |
| `cancel` | Mutation | `{id: UUID, reason, notes?}` | Cancel order with stock/balance restoration |
| `getOrderStats` | Query | `date_from?, date_to?, retailer_id?` | Order statistics for dashboard |
| `bulkUpdateStatus` | Mutation | `{order_ids: UUID[], status, notes?}` | Bulk status updates |
| `getRetailerOrders` | Query | `status?, date_from?, date_to?, limit, offset, sortBy, sortOrder` | Orders for specific retailer |

**Business Logic**:
- Order lifecycle: pending → confirmed → processing → shipped → delivered
- Automatic delivery creation on order confirmation
- Stock reservation/restoration on order changes
- Credit limit validation for credit payments
- Audit logging for all order operations
- Order number generation (ORD-{timestamp}-{random})

### 3. Retailer Cart Router (`retailer.cart`)
**Authorization**: Retailer only  
**Purpose**: Shopping cart management for retailers

| Endpoint | Type | Input Schema | Purpose |
|----------|------|-------------|---------|
| `addToCart` | Mutation | `{productId: UUID, quantity: number}` | Add/update item in cart |
| `removeFromCart` | Mutation | `{productId: UUID}` | Remove item from cart |
| `updateQuantity` | Mutation | `{productId: UUID, quantity: number}` | Update item quantity |
| `getCart` | Query | None | Get cart items with product details |
| `clearCart` | Mutation | None | Clear entire cart |
| `getCartSummary` | Query | None | Get cart totals (uses SQL function) |
| `syncOfflineActions` | Mutation | `{actions: Array<OfflineAction>}` | Sync offline cart operations |

**Business Logic**:
- Stock availability validation
- Automatic tax calculation
- Line total calculations
- Offline synchronization support
- Retailer-specific cart isolation

## User Management Routers

### 4. Users Router (`users`)
**Authorization**: Admin only  
**Purpose**: System user management

*Note: Full endpoint analysis pending - this router handles admin staff, user roles, and user profile management.*

### 5. Retailers Router (`retailers`)
**Authorization**: Admin only  
**Purpose**: Retailer account management

*Note: Full endpoint analysis pending - this router handles retailer registration, approval, credit management.*

### 6. Retailer Profile Router (`retailer.profile`)
**Authorization**: Retailer only  
**Purpose**: Retailer self-service profile management

*Note: Full endpoint analysis pending - handles profile updates, business information, settings.*

## Product Discovery Routers

### 7. Categories Router (`categories`)
**Authorization**: Admin only  
**Purpose**: Product category hierarchy management

*Note: Full endpoint analysis pending - handles category tree, multi-language category names.*

### 8. Tags Router (`tags`)
**Authorization**: Admin only  
**Purpose**: Product tagging system

*Note: Full endpoint analysis pending - handles tag creation, management, usage analytics.*

### 9. Retailer Products Router (`retailer.products`)
**Authorization**: Retailer only  
**Purpose**: Product browsing for retailers

*Note: Full endpoint analysis pending - filtered product views, pricing, availability.*

## Order Processing Routers

### 10. Retailer Orders Router (`retailer.orders`)
**Authorization**: Retailer only  
**Purpose**: Retailer order placement and history

*Note: Full endpoint analysis pending - order creation from cart, order history, tracking.*

### 11. Payments Router (`payments`)
**Authorization**: Admin only  
**Purpose**: Payment processing and management

*Note: Full endpoint analysis pending - payment recording, credit transactions, reconciliation.*

### 12. Deliveries Router (`deliveries`)
**Authorization**: Admin only  
**Purpose**: Delivery management and logistics

*Note: Full endpoint analysis pending - delivery assignment, tracking, proof of delivery.*

## Analytics & Reporting Routers

### 13. Analytics Router (`analytics`)
**Authorization**: Admin only  
**Purpose**: Business intelligence and metrics

*Note: Full endpoint analysis pending - sales analytics, performance metrics, reporting.*

### 14. Reports Router (`reports`)
**Authorization**: Admin only  
**Purpose**: Report generation

*Note: Full endpoint analysis pending - sales reports, inventory reports, financial reports.*

### 15. Intelligence Router (`intelligence`)
**Authorization**: Admin only  
**Purpose**: Business intelligence features

*Note: Full endpoint analysis pending - insights, recommendations, trend analysis.*

## Support & Communication Routers

### 16. Communications Router (`communications`)
**Authorization**: Admin only  
**Purpose**: Communication management

*Note: Full endpoint analysis pending - notifications, emails, messaging.*

### 17. Suppliers Router (`suppliers`)
**Authorization**: Admin only  
**Purpose**: Supplier management

*Note: Full endpoint analysis pending - supplier relationships, purchase orders.*

## Input Validation Patterns

### Common Schema Patterns
```typescript
// Pagination
{
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum([...]),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}

// Date Range Filtering
{
  date_from: z.string().optional(),
  date_to: z.string().optional()
}

// Multi-language Content
{
  name_en: z.string().min(1),
  name_ar: z.string().min(1),
  name_fr: z.string().min(1),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  description_fr: z.string().optional()
}
```

## Error Handling Patterns

### Standard Error Codes
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Duplicate/constraint violation
- `PRECONDITION_FAILED`: Business rule violation
- `BAD_REQUEST`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Database/system errors

### Error Response Structure
```typescript
{
  code: string,
  message: string,
  data?: {
    zodError?: ZodError // For validation errors
  }
}
```

## Performance Considerations

### Query Optimization Needs
1. **N+1 Query Issues**: Many endpoints fetch related data in loops
2. **Missing Indexes**: Some filter combinations may need database indexes
3. **Pagination**: All list endpoints support proper pagination
4. **Eager Loading**: Complex queries use Supabase select with joins

### Caching Opportunities
1. **Product Catalog**: Products, categories, tags (TTL: 1 hour)
2. **Cart Operations**: Cart summaries (TTL: 5 minutes)
3. **Order Statistics**: Dashboard metrics (TTL: 15 minutes)
4. **User Permissions**: Role/permission checks (TTL: 5 minutes)

## Migration Priority

### High Priority (Core Business Functions)
1. Products management
2. Order processing
3. Cart operations
4. User authentication
5. Retailer management

### Medium Priority (Business Features)
1. Analytics and reporting
2. Payment processing
3. Delivery management
4. Categories and tags

### Low Priority (Support Features)
1. Communications
2. Intelligence features
3. Supplier management
4. Advanced reporting

---

*This catalog provides the foundation for API endpoint migration to Python. Each router requires detailed analysis of business logic, validation rules, and database interactions.*