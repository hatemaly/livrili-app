# Priority 2: Core Business Features Test Plan

## Overview
Comprehensive testing for critical business functionality including dashboard analytics, order management, user management, retailer management, and product management.

## Test Environment Setup
- Admin Portal: http://localhost:3001
- Database: Populated with test data
- Test Accounts: Admin users with appropriate permissions
- API Endpoints: tRPC routers for business logic

---

# Test Suite 1: Dashboard & Analytics

## DASH-001: Dashboard Load Performance
**Test ID**: DASH-001  
**Priority**: High  
**Type**: Performance  
**Description**: Verify dashboard loads within acceptable time limits

**Prerequisites**:
- Admin user logged in
- Database contains sample data

**Test Steps**:
1. Navigate to `/dashboard`
2. Measure page load time
3. Verify all metrics load
4. Check for loading states

**Expected Results**:
- Dashboard loads < 3 seconds
- All KPI cards display data
- Charts render correctly
- No console errors

**Test Data**: Sample orders, users, retailers data

---

## DASH-002: Real-time Metrics Accuracy
**Test ID**: DASH-002  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify dashboard metrics reflect accurate business data

**Test Steps**:
1. Note current order count on dashboard
2. Create new order via API
3. Refresh dashboard
4. Verify order count increased by 1
5. Check revenue metrics update

**Expected Results**:
- Metrics reflect real data
- Updates appear after refresh
- Calculations are accurate
- Revenue totals correct

**Test Data**: Known order values for verification

---

## DASH-003: Analytics Chart Rendering
**Test ID**: DASH-003  
**Priority**: Medium  
**Type**: Visual  
**Description**: Verify all dashboard charts render correctly

**Test Steps**:
1. Load dashboard page
2. Verify order trends chart displays
3. Check revenue chart shows data
4. Validate chart legends and axes
5. Test chart interactivity

**Expected Results**:
- All charts render without errors
- Data points are accurate
- Charts are interactive
- Responsive design works

**Test Data**: Time series order data

---

## DASH-004: Date Range Filtering
**Test ID**: DASH-004  
**Priority**: Medium  
**Type**: Functional  
**Description**: Verify dashboard date range filters work correctly

**Test Steps**:
1. Select "Last 7 days" filter
2. Verify metrics update
3. Select "Last 30 days"  
4. Compare data changes
5. Test custom date range

**Expected Results**:
- Date filters affect all metrics
- Data changes appropriately
- Custom ranges work correctly
- Loading states shown during updates

**Test Data**: Orders across multiple date ranges

---

## DASH-005: Auto-refresh Functionality
**Test ID**: DASH-005  
**Priority**: Low  
**Type**: Integration  
**Description**: Verify dashboard auto-refreshes data periodically

**Test Steps**:
1. Load dashboard
2. Create new order in background
3. Wait for auto-refresh interval
4. Verify new data appears

**Expected Results**:
- Dashboard refreshes automatically
- New data appears without manual refresh
- Refresh interval configurable
- No performance degradation

**Test Data**: Background order creation

---

# Test Suite 2: Order Management

## ORDER-001: View Order List
**Test ID**: ORDER-001  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify order list displays correctly with all details

**Prerequisites**:
- Multiple orders exist in database
- Admin user has order access

**Test Steps**:
1. Navigate to `/orders`
2. Verify order list loads
3. Check column headers
4. Verify data accuracy
5. Test pagination

**Expected Results**:
- All orders display in table
- Correct order information shown
- Sorting works on columns
- Pagination functions properly

**Test Data**: 50+ test orders with various statuses

---

## ORDER-002: Order Search and Filtering
**Test ID**: ORDER-002  
**Priority**: High  
**Type**: Functional  
**Description**: Verify order search and filtering capabilities

**Test Steps**:
1. Search for specific order number
2. Filter by order status
3. Filter by retailer
4. Filter by date range
5. Combine multiple filters

**Expected Results**:
- Search returns accurate results
- Filters work independently
- Combined filters function correctly
- Results update in real-time

**Test Data**: Orders with known attributes for searching

---

## ORDER-003: Order Status Update
**Test ID**: ORDER-003  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify order status can be updated correctly

**Test Steps**:
1. Select pending order
2. Change status to "confirmed"
3. Verify status update
4. Check audit trail
5. Test invalid transitions

**Expected Results**:
- Status updates successfully
- Invalid transitions blocked
- Audit trail created
- Notifications sent if configured

**Test Data**: Orders in various statuses

---

## ORDER-004: Order Details View
**Test ID**: ORDER-004  
**Priority**: High  
**Type**: Integration  
**Description**: Verify detailed order view displays complete information

**Test Steps**:
1. Click on specific order
2. Verify order details modal/page opens
3. Check all order information
4. Verify item details
5. Check payment information

**Expected Results**:
- Complete order details shown
- Items list with quantities/prices
- Retailer information displayed
- Payment status visible
- Action buttons available

**Test Data**: Order with multiple items

---

## ORDER-005: Bulk Order Operations
**Test ID**: ORDER-005  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify bulk operations on multiple orders

**Test Steps**:
1. Select multiple orders
2. Perform bulk status update
3. Verify all orders updated
4. Test bulk export
5. Check bulk cancellation

**Expected Results**:
- Multiple orders can be selected
- Bulk operations work correctly
- All selected orders affected
- Operation feedback provided

**Test Data**: Multiple orders in same status

---

## ORDER-006: Order Creation (Manual)
**Test ID**: ORDER-006  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify admin can manually create orders

**Test Steps**:
1. Click "Create Order" button
2. Select retailer
3. Add products with quantities
4. Set delivery information
5. Submit order creation

**Expected Results**:
- Order creation form works
- Product selection functional
- Calculations accurate
- Order created successfully

**Test Data**: Active retailers and products

---

## ORDER-007: Order Cancellation
**Test ID**: ORDER-007  
**Priority**: High  
**Type**: Integration  
**Description**: Verify order cancellation process

**Test Steps**:
1. Select cancelable order
2. Click cancel button
3. Provide cancellation reason
4. Confirm cancellation
5. Verify stock restoration

**Expected Results**:
- Order cancelled successfully
- Status updated to cancelled
- Stock quantities restored
- Cancellation reason recorded

**Test Data**: Confirmed orders with stock allocated

---

## ORDER-008: Order Export Functionality
**Test ID**: ORDER-008  
**Priority**: Low  
**Type**: Integration  
**Description**: Verify order data can be exported

**Test Steps**:
1. Apply filters to order list
2. Select export option
3. Choose export format (CSV/Excel)
4. Download and verify export
5. Check data accuracy

**Expected Results**:
- Export generates successfully
- File downloads correctly
- Data matches filtered results
- All columns included

**Test Data**: Filtered order list

---

# Test Suite 3: User Management

## USER-001: User List Display
**Test ID**: USER-001  
**Priority**: High  
**Type**: Integration  
**Description**: Verify user list displays with correct information

**Prerequisites**:
- Multiple users exist in system
- Admin access to user management

**Test Steps**:
1. Navigate to `/users`
2. Verify user list loads
3. Check user information accuracy
4. Test sorting and filtering
5. Verify role display

**Expected Results**:
- All users listed correctly
- User details accurate
- Roles displayed properly
- Filtering works correctly

**Test Data**: Users with different roles

---

## USER-002: User Creation
**Test ID**: USER-002  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify new user creation process

**Test Steps**:
1. Click "Add User" button
2. Fill user creation form
3. Select user role
4. Assign to retailer (if applicable)
5. Submit form

**Expected Results**:
- User creation form works
- Validation prevents errors
- User created successfully
- Credentials generated properly

**Test Data**: Valid user information

---

## USER-003: User Profile Update
**Test ID**: USER-003  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify user profile information can be updated

**Test Steps**:
1. Select existing user
2. Edit user information
3. Change role if allowed
4. Update contact information
5. Save changes

**Expected Results**:
- User information updates
- Changes persist in database
- Role changes work correctly
- Validation prevents invalid data

**Test Data**: Existing user with updated information

---

## USER-004: User Status Management
**Test ID**: USER-004  
**Priority**: High  
**Type**: Integration  
**Description**: Verify user activation/deactivation

**Test Steps**:
1. Select active user
2. Deactivate user account
3. Verify user cannot login
4. Reactivate user
5. Verify login works again

**Expected Results**:
- Status changes immediately
- Deactivated users blocked from login
- Reactivation restores access
- Status reflected in user list

**Test Data**: Test user accounts

---

## USER-005: Password Management
**Test ID**: USER-005  
**Priority**: High  
**Type**: Security  
**Description**: Verify admin can reset user passwords

**Test Steps**:
1. Select user account
2. Reset password
3. Generate new password
4. Verify user can login with new password
5. Test password strength requirements

**Expected Results**:
- Password reset successful
- New password works
- Old password no longer valid
- Security requirements enforced

**Test Data**: User accounts for password testing

---

## USER-006: Role-Based Access Control
**Test ID**: USER-006  
**Priority**: Critical  
**Type**: Security  
**Description**: Verify role-based permissions work correctly

**Test Steps**:
1. Create users with different roles
2. Test access to various features
3. Verify restrictions are enforced
4. Check admin-only functions
5. Test retailer role limitations

**Expected Results**:
- Role restrictions enforced
- Admin users have full access
- Retailer users have limited access
- Unauthorized actions blocked

**Test Data**: Users with admin, retailer, driver roles

---

## USER-007: User Search and Filtering
**Test ID**: USER-007  
**Priority**: Medium  
**Type**: Functional  
**Description**: Verify user search and filtering functionality

**Test Steps**:
1. Search by username
2. Filter by role
3. Filter by status (active/inactive)
4. Filter by retailer association
5. Combine multiple filters

**Expected Results**:
- Search returns accurate results
- Filters work independently
- Combined filters function correctly
- Results update dynamically

**Test Data**: Users with searchable attributes

---

# Test Suite 4: Retailer Management

## RET-001: Retailer List and Details
**Test ID**: RET-001  
**Priority**: High  
**Type**: Integration  
**Description**: Verify retailer list displays comprehensive information

**Prerequisites**:
- Multiple retailers in database
- Admin access to retailer management

**Test Steps**:
1. Navigate to `/retailers`
2. Verify retailer list loads
3. Check business information accuracy
4. Test retailer detail view
5. Verify contact information

**Expected Results**:
- All retailers listed correctly
- Business details accurate
- Contact information complete
- Detail views functional

**Test Data**: Retailers with complete profiles

---

## RET-002: Retailer Approval Workflow
**Test ID**: RET-002  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify retailer approval/rejection process

**Test Steps**:
1. View pending retailer applications
2. Review retailer documents
3. Approve qualified retailer
4. Reject unqualified retailer
5. Verify status updates

**Expected Results**:
- Pending applications visible
- Approval changes status
- Rejection includes reason
- Status updates immediately

**Test Data**: Retailers in pending status

---

## RET-003: Credit Limit Management
**Test ID**: RET-003  
**Priority**: High  
**Type**: Integration  
**Description**: Verify retailer credit limit assignment and updates

**Test Steps**:
1. Select approved retailer
2. Set initial credit limit
3. Update credit limit
4. Verify balance calculations
5. Test credit limit enforcement

**Expected Results**:
- Credit limits can be set/updated
- Balance calculations accurate
- Limits enforced during ordering
- Credit history maintained

**Test Data**: Retailers with credit transactions

---

## RET-004: Retailer Status Management
**Test ID**: RET-004  
**Priority**: High  
**Type**: Integration  
**Description**: Verify retailer status changes (active/inactive/suspended)

**Test Steps**:
1. Change retailer to inactive
2. Verify they cannot place orders
3. Suspend retailer account
4. Test suspension effects
5. Reactivate retailer

**Expected Results**:
- Status changes apply immediately
- Inactive retailers blocked from ordering
- Suspended accounts have limited access
- Reactivation restores full access

**Test Data**: Active retailers for status testing

---

## RET-005: Retailer Search and Filtering
**Test ID**: RET-005  
**Priority**: Medium  
**Type**: Functional  
**Description**: Verify retailer search and filtering capabilities

**Test Steps**:
1. Search by business name
2. Filter by status
3. Filter by location/city
4. Filter by business type
5. Sort by various criteria

**Expected Results**:
- Search returns accurate results
- Filters work correctly
- Location filtering functional
- Sorting works on all columns

**Test Data**: Retailers across different locations and types

---

## RET-006: Retailer Performance Analytics
**Test ID**: RET-006  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify retailer performance metrics and reports

**Test Steps**:
1. View retailer performance page
2. Check order volume metrics
3. Verify revenue calculations
4. Test performance comparisons
5. Generate retailer reports

**Expected Results**:
- Performance metrics accurate
- Order volumes calculated correctly
- Revenue figures match orders
- Reports generate successfully

**Test Data**: Retailers with order history

---

# Test Suite 5: Product Management

## PROD-001: Product Catalog Display
**Test ID**: PROD-001  
**Priority**: High  
**Type**: Integration  
**Description**: Verify product catalog displays with complete information

**Prerequisites**:
- Product catalog populated with test data
- Admin access to product management

**Test Steps**:
1. Navigate to `/products`
2. Verify product list loads
3. Check product information accuracy
4. Test product image display
5. Verify pricing information

**Expected Results**:
- All products displayed correctly
- Images load properly
- Pricing accurate
- Product details complete

**Test Data**: Products with images and pricing

---

## PROD-002: Product Creation
**Test ID**: PROD-002  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify new product creation process

**Test Steps**:
1. Click "Add Product" button
2. Fill product information form
3. Upload product images
4. Set pricing and stock
5. Assign categories/tags
6. Submit product creation

**Expected Results**:
- Product creation form functional
- Image upload works
- Validation prevents errors
- Product appears in catalog

**Test Data**: Complete product information and images

---

## PROD-003: Product Information Updates
**Test ID**: PROD-003  
**Priority**: High  
**Type**: Integration  
**Description**: Verify product information can be updated

**Test Steps**:
1. Select existing product
2. Update product name/description
3. Change pricing
4. Update stock quantity
5. Modify categories
6. Save changes

**Expected Results**:
- Product information updates successfully
- Changes reflect immediately
- Price changes affect calculations
- Stock updates are accurate

**Test Data**: Existing products for modification

---

## PROD-004: Product Stock Management
**Test ID**: PROD-004  
**Priority**: Critical  
**Type**: Integration  
**Description**: Verify product stock tracking and updates

**Test Steps**:
1. Check current stock levels
2. Update stock manually
3. Process order that reduces stock
4. Verify stock automatically decreases
5. Test low stock alerts

**Expected Results**:
- Manual stock updates work
- Orders automatically reduce stock
- Stock levels accurate
- Low stock alerts trigger

**Test Data**: Products with known stock levels

---

## PROD-005: Product Image Management
**Test ID**: PROD-005  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify product image upload and management

**Test Steps**:
1. Upload multiple product images
2. Set primary image
3. Reorder image gallery
4. Remove images
5. Test image optimization

**Expected Results**:
- Multiple images can be uploaded
- Primary image setting works
- Image reordering functional
- Images optimized automatically

**Test Data**: Various image file types and sizes

---

## PROD-006: Product Search and Filtering
**Test ID**: PROD-006  
**Priority**: Medium  
**Type**: Functional  
**Description**: Verify product search and filtering functionality

**Test Steps**:
1. Search by product name
2. Filter by category
3. Filter by price range
4. Filter by stock status
5. Sort by various criteria

**Expected Results**:
- Search returns relevant results
- Category filters work
- Price range filtering accurate
- Stock filters functional

**Test Data**: Products across different categories and price ranges

---

## PROD-007: Bulk Product Operations
**Test ID**: PROD-007  
**Priority**: Medium  
**Type**: Integration  
**Description**: Verify bulk operations on multiple products

**Test Steps**:
1. Select multiple products
2. Perform bulk price update
3. Bulk category assignment
4. Bulk status change (active/inactive)
5. Bulk export

**Expected Results**:
- Multiple product selection works
- Bulk updates apply to all selected
- Operations complete successfully
- Export includes all selected products

**Test Data**: Multiple products for bulk operations

---

## PROD-008: Product Status Management
**Test ID**: PROD-008  
**Priority**: High  
**Type**: Integration  
**Description**: Verify product activation/deactivation

**Test Steps**:
1. Deactivate product
2. Verify product not available for ordering
3. Check product still visible in admin
4. Reactivate product
5. Verify availability restored

**Expected Results**:
- Status changes immediately
- Inactive products blocked from orders
- Admin can still view all products
- Reactivation restores availability

**Test Data**: Active products for status testing

---

# Test Data Requirements

## Order Test Data
```json
{
  "orders": [
    {
      "order_number": "ORD-123456",
      "status": "pending",
      "retailer_id": "uuid",
      "total_amount": 150.50,
      "items": [
        {
          "product_id": "uuid",
          "quantity": 2,
          "unit_price": 75.25
        }
      ]
    }
  ]
}
```

## User Test Data
```json
{
  "users": [
    {
      "username": "testuser",
      "role": "admin",
      "is_active": true,
      "full_name": "Test User"
    }
  ]
}
```

## Retailer Test Data
```json
{
  "retailers": [
    {
      "business_name": "Test Store",
      "status": "active",
      "credit_limit": 5000,
      "current_balance": 1500
    }
  ]
}
```

## Product Test Data
```json
{
  "products": [
    {
      "sku": "PROD-001",
      "name_en": "Test Product",
      "base_price": 50.00,
      "stock_quantity": 100,
      "is_active": true
    }
  ]
}
```

---

# Performance Expectations

## Response Time Targets
- Dashboard load: < 3 seconds
- List pages (orders, users, etc.): < 2 seconds
- Search results: < 1 second
- Form submissions: < 2 seconds
- Bulk operations: < 30 seconds

## Concurrent User Support
- Support 50+ concurrent admin users
- No performance degradation with normal usage
- Database queries optimized
- Proper caching implemented

---

# Error Handling Tests

## Network Failure Scenarios
- **NET-001**: Order creation during network timeout
- **NET-002**: Form submission with connection loss
- **NET-003**: File upload interruption

## Database Error Scenarios
- **DB-001**: Order creation with database constraint violation
- **DB-002**: User update with duplicate username
- **DB-003**: Product creation with invalid category

## Validation Error Scenarios
- **VAL-001**: Invalid email format in user creation
- **VAL-002**: Negative stock quantity entry
- **VAL-003**: Invalid phone number format

---

# Browser Compatibility

## Supported Browsers
- Chrome 100+ (Primary)
- Firefox 100+
- Safari 15+
- Edge 100+

## Mobile Compatibility
- Responsive design on tablet screens
- Touch-friendly interface elements
- Mobile-optimized forms

---

# Automation Strategy

## Playwright E2E Tests
- Critical user journeys
- Form validation scenarios
- Multi-step workflows
- Cross-browser testing

## API Integration Tests
- tRPC endpoint validation
- Data consistency checks
- Error response handling
- Authentication verification

## Visual Regression Tests
- Dashboard layout consistency
- Form rendering accuracy
- Table display formatting
- Mobile responsive views