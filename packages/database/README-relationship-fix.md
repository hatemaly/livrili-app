# Database Relationship Fix

This document explains the solution for the database relationship errors in the Livrili admin portal.

## Problem

The application was showing these errors:
1. "Could not find a relationship between 'deliveries' and 'orders' in the schema cache"
2. "Could not find a relationship between 'drivers' and 'users' in the schema cache"

## Root Cause

The issue was caused by two problems:

1. **Incorrect Supabase relationship syntax**: The TRPC queries were using explicit foreign key names (e.g., `users!drivers_user_id_fkey`) which is unnecessary and can cause issues.

2. **Missing relationship path**: The deliveries table was trying to directly access retailers, but it should access retailers through the orders table.

## Solution Applied

### 1. Database Schema Fix (`fix-relationships.sql`)

The database script ensures all foreign key constraints have proper names:

- `drivers_user_id_fkey`: drivers → users
- `deliveries_order_id_fkey`: deliveries → orders  
- `deliveries_driver_id_fkey`: deliveries → drivers
- `orders_retailer_id_fkey`: orders → retailers

### 2. TRPC Query Fix

Updated the relationship queries in:

**`/packages/api/src/routers/deliveries.ts`**:
- Changed `users!drivers_user_id_fkey(...)` → `users(...)`
- Fixed deliveries query to access retailers through orders: `orders(..., retailers(...))`

**`/packages/api/src/routers/orders.ts`**:
- Changed `users!orders_created_by_user_id_fkey(...)` → `users(...)`

## Applying the Fix

1. **Run the database migration**:
   ```sql
   -- Execute the contents of fix-relationships.sql in your Supabase SQL editor
   -- Or run: psql -f packages/database/fix-relationships.sql
   ```

2. **Restart your application**:
   ```bash
   # In the admin-portal directory
   npm run dev
   ```

## Verification

The relationship queries should now work correctly:

1. **Drivers with users**: `SELECT * FROM drivers JOIN users ON drivers.user_id = users.id`
2. **Deliveries with orders**: `SELECT * FROM deliveries JOIN orders ON deliveries.order_id = orders.id`
3. **Deliveries with retailers**: `SELECT * FROM deliveries JOIN orders ON deliveries.order_id = orders.id JOIN retailers ON orders.retailer_id = retailers.id`

## Technical Details

### Supabase Relationship Syntax

Supabase automatically detects relationships based on foreign key constraints. The correct syntax is:

```javascript
// Correct - Let Supabase auto-detect the relationship
.select('*, users(id, username, full_name)')

// Incorrect - Explicit foreign key name (unnecessary)
.select('*, users!drivers_user_id_fkey(id, username, full_name)')
```

### Relationship Paths

For nested relationships, follow the foreign key path:

```javascript
// Deliveries → Orders → Retailers
.select(`
  *,
  orders(
    id, order_number, total_amount,
    retailers(id, business_name, phone)
  )
`)
```

## Status

✅ **Fixed**: Database foreign key constraints properly named
✅ **Fixed**: TRPC queries use correct Supabase relationship syntax  
✅ **Fixed**: Nested relationships follow proper paths

The relationship errors should now be resolved.