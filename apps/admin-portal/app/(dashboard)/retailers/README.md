# Retailer Management System

This module provides comprehensive retailer management functionality for the Livrili admin portal.

## Features Implemented

### 1. Retailers List Page (`page.tsx`)
- **Enhanced search and filtering capabilities**:
  - Search by business name, email, phone, or tax ID
  - Filter by retailer status (pending, active, suspended, rejected)
  - Filter by business type (grocery, supermarket, convenience, restaurant, cafe, other)
  - Filter by credit status (good standing, over limit, no credit)
- **Comprehensive data display**:
  - Business information with type
  - Contact details including tax ID
  - Credit information with status indicators
  - Status badges with color coding
  - Creation date
- **Action buttons**:
  - View detailed retailer information
  - Edit retailer details
  - Approve/reject pending retailers
  - Suspend/reactivate accounts
- **Add new retailer functionality** via modal

### 2. Retailer Form Component (`retailer-form.tsx`)
- **Comprehensive form sections**:
  - Business Information: name, type, registration number, tax ID
  - Contact Information: phone, email, address (including city, state, postal code)
  - Financial Settings: credit limit
  - Status management (for existing retailers)
  - Document management system
- **Form validation**:
  - Required field validation
  - Email format validation
  - Phone number format validation
  - Credit limit validation
- **Document management**:
  - Upload multiple documents
  - Document type categorization (business license, tax certificate, ID, bank statement, other)
  - View and remove documents
  - Document URL validation

### 3. Retailer Detail Page (`[id]/page.tsx`)
- **Comprehensive retailer overview**:
  - Business and contact information display
  - Credit information with status indicators
  - Document viewer and management
  - Associated users table
  - Order and payment history
- **Status management**:
  - Approval workflow for pending retailers
  - Rejection with reason tracking
  - Suspension/reactivation controls
- **Credit management**:
  - Current credit status display
  - Credit limit update functionality
  - Available credit calculation
- **Statistics sidebar**:
  - Total orders and revenue
  - Pending and delivered orders
  - Payment totals
- **Document viewing**:
  - Modal-based document viewer
  - Document metadata display
  - External link opening

### 4. TypeScript Types (`types.ts`)
- **Comprehensive type definitions**:
  - `Retailer` - Complete retailer data structure
  - `RetailerWithDetails` - Extended retailer with related data
  - `RetailerFormData` - Form data interface
  - `Document` - Document structure
  - `CreditStatus` - Credit status with styling
  - `RetailerStats` - Statistics interface
  - Enums for status, business type, and document type

### 5. Credit History Component (`credit-history.tsx`)
- **Credit limit tracking**:
  - Historical credit limit changes
  - Change reason tracking
  - Admin user attribution
  - Visual indicators for increases/decreases
- **Credit limit management**:
  - Update credit limits with reasons
  - Form validation for new limits
  - Integration with main credit system

## Business Logic

### Credit Status Calculation
The system automatically calculates credit status based on:
- **No Credit**: Credit limit is 0
- **Over Limit**: Current balance exceeds credit limit
- **Low Credit**: Available credit is less than 20% of limit
- **Good Standing**: Adequate available credit

### Status Workflow
1. **Pending**: New retailers await admin approval
2. **Active**: Approved retailers can place orders
3. **Suspended**: Temporarily disabled accounts
4. **Rejected**: Permanently rejected applications with reason

### Document Management
- Supports multiple document types for compliance
- Document URLs for external storage integration
- Upload date tracking
- Document type categorization

## API Integration

The system uses the existing retailers API router with:
- `list` - Paginated retailer listing with filters
- `getById` - Detailed retailer information
- `getStats` - Retailer statistics
- `create` - New retailer creation
- `update` - Retailer information updates
- `updateStatus` - Status change management
- `updateCreditLimit` - Credit limit adjustments

## Styling and UX

- **Responsive design**: Works on mobile and desktop
- **Consistent UI patterns**: Follows existing admin portal design
- **Color-coded indicators**: Status and credit status visual feedback
- **Modal-based interactions**: Clean form and detail interactions
- **Loading states**: Proper loading indicators throughout
- **Error handling**: Form validation and API error display

## Technical Features

- **TypeScript**: Full type safety throughout
- **TRPC**: Type-safe API integration
- **React Query**: Optimistic updates and caching
- **Tailwind CSS**: Utility-first styling
- **Form validation**: Client-side and server-side validation
- **Modal system**: Reusable modal components
- **State management**: Proper local state management

## Future Enhancements

Potential areas for expansion:
1. **Advanced filtering**: Date ranges, credit amount ranges
2. **Bulk operations**: Bulk approve/reject/suspend
3. **Export functionality**: CSV/Excel export of retailer data
4. **Advanced search**: Full-text search across all fields
5. **Activity logging**: Audit trail for all actions
6. **Email notifications**: Status change notifications
7. **Credit history API**: Complete credit limit change tracking
8. **Document upload**: Direct file upload integration
9. **Advanced permissions**: Role-based access control
10. **Performance optimization**: Virtual scrolling for large lists