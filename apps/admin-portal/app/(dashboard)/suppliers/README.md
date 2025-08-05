# Suppliers Management System

A comprehensive supplier management system for the Livrili admin portal. This system allows administrators to manage their supplier network, track performance, and handle supplier relationships.

## Features

### 1. Supplier List Management
- **View Modes**: Table and grid view for supplier listings
- **Search & Filter**: Advanced filtering by status, categories, payment terms, performance rating
- **Sorting**: Sort by company name, status, performance rating, creation date, last order date
- **Selection**: Multi-select suppliers for bulk operations

### 2. Supplier Information Management
- **Company Details**: Name, registration number, tax ID, website
- **Contact Information**: Contact person, phone, email, address
- **Business Terms**: Payment terms, minimum order value, lead time
- **Banking Information**: Bank details for payments
- **Performance Tracking**: Ratings, delivery rates, quality scores
- **Status Management**: Active, inactive, suspended suppliers
- **Preferred Supplier**: Mark suppliers as preferred for priority

### 3. Advanced Features
- **Bulk Operations**: Activate/deactivate, update terms, set preferred status
- **Import/Export**: CSV and Excel support for bulk data management
- **Duplicate Detection**: Prevent duplicate supplier entries
- **Performance Analytics**: Track supplier performance metrics
- **Communication Logging**: Track interactions with suppliers (planned)

### 4. Integration Points
- **Product Management**: Link products to suppliers (ready for backend)
- **Purchase Orders**: Track orders from suppliers (UI ready)
- **Performance Monitoring**: Automated performance calculations
- **Document Management**: Store contracts and certificates

## File Structure

```
suppliers/
├── page.tsx                    # Main suppliers page component
├── supplier-form.tsx          # Add/edit supplier form
├── types.ts                   # TypeScript type definitions
├── README.md                  # This documentation
└── components/
    ├── supplier-filters.tsx    # Advanced filtering component
    ├── supplier-table.tsx     # Table view component
    ├── supplier-grid.tsx      # Grid view component
    ├── supplier-details.tsx   # Detailed supplier view modal
    ├── supplier-stats.tsx     # Statistics overview
    ├── bulk-actions.tsx       # Bulk operations component
    ├── view-toggle.tsx        # Table/grid view toggle
    ├── import-export-dialog.tsx # Import/export functionality
    └── batch-progress-dialog.tsx # Batch operation progress
```

## Database Schema

The system requires the following database tables (see migration `007_suppliers_system.sql`):

### Core Tables
- **suppliers**: Main supplier information
- **product_suppliers**: Many-to-many relationship between products and suppliers
- **purchase_orders**: Purchase orders from suppliers
- **purchase_order_items**: Line items for purchase orders
- **supplier_communications**: Communication logs with suppliers

### Key Features
- **Performance Metrics**: Automated calculation of delivery rates and ratings
- **Audit Trail**: Track all changes to supplier data
- **RLS Policies**: Row-level security for data access control

## Usage

### Adding a New Supplier
1. Click "Add Supplier" button
2. Fill in company information across multiple tabs:
   - Company Info: Basic company details
   - Contact Details: Contact person and address
   - Business Terms: Payment terms and order requirements
   - Banking Info: Payment account details
   - Settings: Status and preferences
3. Save to create the supplier

### Managing Suppliers
- **View Details**: Click the eye icon to see comprehensive supplier information
- **Edit Supplier**: Click the pencil icon to modify supplier details
- **Bulk Operations**: Select multiple suppliers and use bulk actions menu
- **Filter & Search**: Use the advanced filters to find specific suppliers

### Performance Tracking
- Performance ratings are calculated based on:
  - On-time delivery rate
  - Quality scores
  - Response time to communications
  - Overall supplier evaluation

## API Integration

The UI is ready for backend integration with the following API endpoints:

```typescript
// Supplier CRUD operations
api.suppliers.list.useQuery()
api.suppliers.create.useMutation()
api.suppliers.update.useMutation()
api.suppliers.delete.useMutation()
api.suppliers.getStats.useQuery()

// Bulk operations
api.suppliers.bulkUpdate.useMutation()
api.suppliers.duplicate.useMutation()

// Import/Export
api.suppliers.import.useMutation()
api.suppliers.export.useMutation()
```

## Performance Metrics

The system tracks key supplier performance indicators:

- **Overall Rating**: 1-5 stars based on multiple factors
- **On-time Delivery Rate**: Percentage of orders delivered on time
- **Quality Score**: Product quality assessment
- **Response Time**: Average response time to communications
- **Order Frequency**: How often orders are placed
- **Value Rating**: Cost competitiveness assessment

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic CRUD operations
- ✅ Advanced filtering and search
- ✅ Performance tracking UI
- ✅ Bulk operations
- ✅ Import/export functionality

### Phase 2 (Planned)
- 🔄 Purchase order management integration
- 🔄 Product-supplier relationship management
- 🔄 Communication logging system
- 🔄 Document management (contracts, certificates)
- 🔄 Automated performance calculations

### Phase 3 (Future)
- 📋 Supplier onboarding workflow
- 📋 Quote request system
- 📋 Supplier portal for self-service
- 📋 Advanced analytics and reporting
- 📋 Integration with accounting systems

## Error Handling

The system includes comprehensive error handling:
- Form validation with real-time feedback
- Network error recovery
- Bulk operation progress tracking
- Import error reporting with specific row/field details

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for modals and forms
- ARIA labels for complex interactions

## Testing Considerations

When implementing tests, consider:
- Form validation scenarios
- Bulk operation workflows
- Import/export functionality
- Performance metric calculations
- Search and filtering accuracy
- Modal interactions and keyboard navigation

## Performance Considerations

- Virtualized tables for large supplier lists
- Lazy loading of supplier details
- Optimistic updates for better UX
- Debounced search to reduce API calls
- Pagination for large datasets
- Caching of frequently accessed data