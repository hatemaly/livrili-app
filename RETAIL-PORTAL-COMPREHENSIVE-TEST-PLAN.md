# Livrili Retail Portal - Comprehensive Test Plan

## Executive Summary

This comprehensive test plan covers the Livrili B2B e-commerce PWA for retailers in Algeria. The application runs on `http://localhost:3002` and provides wholesale ordering capabilities with multi-language support (Arabic RTL, French, English), PWA features, and mobile-first design.

### Application Overview
- **URL**: http://localhost:3002  
- **Type**: Progressive Web App (PWA)
- **Target Users**: Algerian B2B retailers
- **Tech Stack**: Next.js 15.4.5, tRPC, Supabase Auth, React Query
- **Authentication**: Username/Password based
- **Languages**: Arabic (RTL primary), French, English
- **Currency**: Algerian Dinar (DZD)

## Test Environment Setup

### Prerequisites
- Browser: Chrome, Firefox, Safari, Edge (mobile and desktop)
- Network conditions: 3G, WiFi, Offline
- Device types: Mobile phones, tablets, desktops
- Test data: Valid retailer accounts, product catalog, test orders

### Test Data Requirements
```
Test Retailers:
- Active retailer: username=testretailer1, password=Test123!
- Low credit retailer: username=lowcredit, password=Test123!
- Inactive retailer: username=inactive, password=Test123!

Test Products:
- In-stock products with various categories
- Out-of-stock products
- Products with minimum order quantities
- Products with different units (kg, pieces, boxes)

Test Scenarios:
- Empty cart vs cart with items
- Orders with different statuses
- Various network conditions
```

## Test Categories Overview

| Category | Test Cases | Priority Distribution |
|----------|------------|----------------------|
| Authentication & Authorization | 8 | Critical: 5, High: 2, Medium: 1 |
| Product Browsing & Search | 12 | Critical: 4, High: 6, Medium: 2 |
| Shopping Cart Management | 10 | Critical: 6, High: 3, Medium: 1 |
| Order Placement & Management | 8 | Critical: 5, High: 2, Medium: 1 |
| User Profile & Settings | 6 | High: 3, Medium: 3 |
| Multi-language Support | 6 | High: 4, Medium: 2 |
| PWA Features | 8 | High: 4, Medium: 4 |
| Performance & Load Testing | 4 | High: 2, Medium: 2 |
| Security Testing | 5 | Critical: 3, High: 2 |
| Accessibility Testing | 5 | High: 3, Medium: 2 |

**Total Test Cases: 72** | **Critical: 23 (32%)** | **High: 29 (40%)** | **Medium: 20 (28%)**

---

# Test Cases

## 1. Authentication & Authorization

### TC-AUTH-001: Valid User Login
**Priority**: Critical | **Type**: Functional
**Description**: Verify successful login with valid retailer credentials

**Preconditions**: 
- Application is accessible
- Valid retailer account exists

**Test Steps**:
1. Navigate to http://localhost:3002
2. Verify automatic redirect to /login page
3. Enter valid username "testretailer1" 
4. Enter valid password "Test123!"
5. Click "Enter Store" button
6. Verify successful authentication
7. Verify redirect to /home page

**Expected Results**:
- Login form accepts valid credentials
- Success message or seamless redirect
- User lands on dashboard/home page
- Navigation shows authenticated state
- User session is established

**Test Data**: 
- Username: testretailer1
- Password: Test123!

**Pass/Fail Criteria**: Login successful, redirected to home, no errors

---

### TC-AUTH-002: Invalid Username Login
**Priority**: Critical | **Type**: Functional
**Description**: Verify system rejects login with invalid username

**Preconditions**: Login page is accessible

**Test Steps**:
1. Navigate to login page
2. Enter invalid username "invaliduser"
3. Enter valid password format "Test123!"
4. Click "Enter Store" button
5. Observe error handling

**Expected Results**:
- Clear error message displayed
- User remains on login page
- No authentication session created
- Error message in Arabic/French/English based on language setting

**Test Data**: 
- Username: invaliduser
- Password: Test123!

**Pass/Fail Criteria**: Login rejected with appropriate error message

---

### TC-AUTH-003: Empty Credentials Login
**Priority**: Critical | **Type**: Functional
**Description**: Verify validation for empty username/password fields

**Preconditions**: Login page is accessible

**Test Steps**:
1. Navigate to login page
2. Leave username field empty
3. Leave password field empty  
4. Click "Enter Store" button
5. Verify field validation
6. Fill username only, leave password empty
7. Click submit again
8. Fill password only, leave username empty
9. Click submit again

**Expected Results**:
- Form validation prevents submission
- Visual indicators show required fields
- Appropriate error messages displayed
- Submit button may be disabled until fields filled
- No network requests made for invalid forms

**Test Data**: Empty strings for both fields

**Pass/Fail Criteria**: Form validation prevents invalid submissions

---

### TC-AUTH-004: Password Visibility Toggle
**Priority**: Medium | **Type**: Usability
**Description**: Verify password show/hide functionality

**Preconditions**: Login page is accessible

**Test Steps**:
1. Navigate to login page
2. Enter password in password field
3. Verify password is masked by default
4. Click the eye icon (👁️) to show password
5. Verify password becomes visible
6. Click the eye icon again (🙈) to hide password
7. Verify password is masked again
8. Test with different password lengths

**Expected Results**:
- Password field masked by default
- Eye icon toggles visibility state
- Icon changes between 👁️ and 🙈
- Functionality works on mobile and desktop
- Password remains functional in both states

**Test Data**: Various password strings

**Pass/Fail Criteria**: Toggle works correctly in all states

---

### TC-AUTH-005: Session Management
**Priority**: Critical | **Type**: Functional
**Description**: Verify user session persistence and logout

**Preconditions**: User can successfully log in

**Test Steps**:
1. Login with valid credentials
2. Navigate to different pages within app
3. Refresh browser page
4. Verify session persists
5. Close browser tab and reopen
6. Navigate to protected pages directly via URL
7. Verify automatic logout after extended inactivity (if implemented)

**Expected Results**:
- Session persists across page refreshes
- User remains authenticated during normal navigation
- Protected pages accessible when authenticated
- Appropriate session management (remember login state)
- Graceful handling of expired sessions

**Test Data**: Valid user credentials

**Pass/Fail Criteria**: Session management works as expected

---

### TC-AUTH-006: Multi-language Login Experience
**Priority**: High | **Type**: Functional
**Description**: Verify login form displays correctly in all supported languages

**Preconditions**: Application supports multiple languages

**Test Steps**:
1. Navigate to login page
2. Select Arabic language using language selector
3. Verify login form displays in Arabic with RTL layout
4. Switch to French language
5. Verify login form displays in French with LTR layout
6. Switch to English language  
7. Verify login form displays in English with LTR layout
8. Attempt login in each language
9. Verify error messages appear in selected language

**Expected Results**:
- Language selector works on login page
- Text displays correctly in each language
- RTL layout works properly for Arabic
- Error messages translated appropriately
- Login functionality works in all languages

**Test Data**: Valid login credentials

**Pass/Fail Criteria**: All languages display and function correctly

---

### TC-AUTH-007: Signup Process Navigation
**Priority**: High | **Type**: Functional
**Description**: Verify new retailer registration flow

**Preconditions**: Signup feature is available

**Test Steps**:
1. Navigate to login page
2. Click "Register new store" link
3. Verify redirect to signup page
4. Fill all required registration fields:
   - Business Name: "Test Retail Store"
   - Email: "test@retailstore.com"
   - Username: "newretailer"
   - Phone: "+213555123456"
   - Password: "NewPass123!"
   - Confirm Password: "NewPass123!"
5. Submit registration form
6. Verify success message and redirect

**Expected Results**:
- Signup form accessible from login
- All required fields present
- Form validation works correctly
- Password confirmation validates
- Phone number format validation
- Successful submission leads to appropriate next step

**Test Data**: New retailer information

**Pass/Fail Criteria**: Registration process completes successfully

---

### TC-AUTH-008: Authentication State UI Updates
**Priority**: Critical | **Type**: Functional
**Description**: Verify UI appropriately reflects authentication state

**Preconditions**: Application has authentication features

**Test Steps**:
1. Access application in unauthenticated state
2. Verify only public pages accessible
3. Verify protected routes redirect to login
4. Login with valid credentials
5. Verify navigation menu shows authenticated options
6. Verify user information displayed (name, business)
7. Verify protected routes now accessible

**Expected Results**:
- Unauthenticated users see limited options
- Login required for protected features
- Authenticated state clearly indicated
- User context displayed appropriately
- Navigation adapts to authentication status

**Test Data**: Valid user account

**Pass/Fail Criteria**: UI accurately reflects authentication state

---

## 2. Product Browsing & Search

### TC-PROD-001: Category Grid Display
**Priority**: Critical | **Type**: Functional
**Description**: Verify product categories display correctly with visual elements

**Preconditions**: 
- User is authenticated
- Product categories exist in database

**Test Steps**:
1. Navigate to /categories page
2. Verify category grid loads completely
3. Check each category shows:
   - Category name in current language
   - Appropriate emoji/icon
   - Product count (if available)
4. Verify responsive layout on mobile/desktop
5. Test touch interactions on mobile devices

**Expected Results**:
- Categories display in organized grid layout
- All categories visible and properly formatted
- Images/emojis load correctly
- Category names display in selected language
- Grid adapts to different screen sizes
- Touch/hover interactions work smoothly

**Test Data**: Existing product categories

**Pass/Fail Criteria**: All categories display correctly with proper formatting

---

### TC-PROD-002: Category Selection and Navigation
**Priority**: Critical | **Type**: Functional
**Description**: Verify selecting a category navigates to products

**Preconditions**: Categories are displayed

**Test Steps**:
1. From categories page, tap/click a category
2. Verify navigation to /products/[categoryId] 
3. Verify products from selected category display
4. Verify category context maintained (breadcrumbs/title)
5. Test back navigation to categories
6. Select different category and verify content updates

**Expected Results**:
- Category selection navigates correctly
- URL updates to reflect category selection  
- Products filtered by selected category
- Navigation breadcrumbs work
- Back button returns to categories
- Category-specific content loads

**Test Data**: Available product categories

**Pass/Fail Criteria**: Category navigation works without errors

---

### TC-PROD-003: Product Search Functionality
**Priority**: Critical | **Type**: Functional
**Description**: Verify product search returns relevant results

**Preconditions**: Search functionality is available

**Test Steps**:
1. Navigate to categories page
2. Enter search term in search bar: "bread"
3. Press Enter or tap search button
4. Verify search results displayed
5. Test search with Arabic terms: "خبز"
6. Test search with French terms: "pain"
7. Test partial matches and typos
8. Test empty search query
9. Test special characters in search

**Expected Results**:
- Search returns relevant products
- Multi-language search works
- Results show in preferred language
- Partial matches included
- Empty search handled gracefully
- Search history tracked (if implemented)
- No results state handled properly

**Test Data**: 
- Arabic: خبز, فواكه
- French: pain, fruits  
- English: bread, fruits

**Pass/Fail Criteria**: Search returns accurate, relevant results

---

### TC-PROD-004: Product Card Information Display
**Priority**: High | **Type**: Functional
**Description**: Verify product cards show complete and accurate information

**Preconditions**: Products are available in a category

**Test Steps**:
1. Navigate to a product category
2. Verify each product card displays:
   - Product name in current language
   - Price in DZD
   - Unit of measurement
   - Stock status
   - Product image (if available)
3. Check price formatting
4. Verify stock indicators (in stock/out of stock)
5. Test on different screen sizes

**Expected Results**:
- All product information visible
- Prices formatted correctly (e.g., "1,500 DZD")
- Stock status clearly indicated
- Images load properly or show placeholder
- Text adapts to selected language
- Cards responsive to screen size

**Test Data**: Products with various attributes

**Pass/Fail Criteria**: Product cards display complete, accurate information

---

### TC-PROD-005: Out of Stock Product Handling
**Priority**: High | **Type**: Functional
**Description**: Verify out-of-stock products are properly indicated and handled

**Preconditions**: Some products are out of stock

**Test Steps**:
1. Navigate to category with out-of-stock products
2. Identify out-of-stock product cards
3. Verify visual indicators (grayed out, "Out of Stock" label)
4. Attempt to add out-of-stock product to cart
5. Verify appropriate error/warning message
6. Check if out-of-stock products are filtered/sorted differently

**Expected Results**:
- Out-of-stock products clearly marked
- Visual distinction from available products
- Cannot add to cart when out of stock
- Clear messaging about availability
- Option to request notification when back in stock (if implemented)

**Test Data**: Products with zero stock quantity

**Pass/Fail Criteria**: Out-of-stock products handled appropriately

---

### TC-PROD-006: Product Quantity Selection
**Priority**: High | **Type**: Functional
**Description**: Verify quantity input and validation for products

**Preconditions**: Products are available for purchase

**Test Steps**:
1. Select a product with sufficient stock
2. Test quantity input controls:
   - Use +/- buttons
   - Direct input in quantity field
   - Test minimum quantity (1)
   - Test maximum quantity (stock limit)
   - Test invalid quantities (0, negative, non-numeric)
3. Verify quantity validation messages
4. Test with products having minimum order quantities

**Expected Results**:
- Quantity controls work smoothly
- Validation prevents invalid quantities
- Stock limits enforced
- Clear error messages for invalid input
- Minimum order quantities respected
- Touch-friendly controls on mobile

**Test Data**: Products with various stock levels

**Pass/Fail Criteria**: Quantity selection works with proper validation

---

### TC-PROD-007: Product Image Handling
**Priority**: Medium | **Type**: Functional
**Description**: Verify product images load correctly or show appropriate fallbacks

**Preconditions**: Products with and without images

**Test Steps**:
1. Navigate to products with images
2. Verify images load correctly
3. Test image loading on slow connections
4. Navigate to products without images
5. Verify placeholder images display
6. Test image caching (revisit same products)
7. Test on different screen densities

**Expected Results**:
- Product images load correctly when available
- Placeholder images for products without photos
- Images optimized for different screen sizes
- Lazy loading implemented (if applicable)
- Graceful fallback for loading errors
- Images cached for better performance

**Test Data**: Products with and without images

**Pass/Fail Criteria**: Image handling works correctly in all scenarios

---

### TC-PROD-008: Recently Searched Items
**Priority**: Medium | **Type**: Functional
**Description**: Verify search history and recent searches functionality

**Preconditions**: Search functionality exists

**Test Steps**:
1. Perform several searches with different terms
2. Navigate away from search
3. Return to search/categories page
4. Verify recent searches displayed
5. Click on a recent search term
6. Verify search executes with clicked term
7. Test clearing search history (if available)

**Expected Results**:
- Recent searches stored and displayed
- Clicking recent search re-executes it
- Search history persists across sessions
- Option to clear history (if implemented)
- Reasonable limit on stored searches (e.g., 5-10)

**Test Data**: Various search terms

**Pass/Fail Criteria**: Search history functions as expected

---

### TC-PROD-009: Category Loading Performance
**Priority**: High | **Type**: Performance
**Description**: Verify categories and products load within acceptable time limits

**Preconditions**: Application deployed with typical data volume

**Test Steps**:
1. Clear browser cache
2. Navigate to /categories
3. Measure page load time
4. Record time for category grid to appear
5. Select a category with many products
6. Measure product list load time
7. Test on 3G network conditions
8. Test with large product catalogs

**Expected Results**:
- Categories load within 3 seconds on WiFi
- Categories load within 5 seconds on 3G
- Product lists load within 3 seconds
- Loading indicators shown during waits
- Progressive loading for large catalogs
- No interface blocking during loads

**Test Data**: Full product catalog

**Pass/Fail Criteria**: Loading times meet performance targets

---

### TC-PROD-010: Search Result Relevance
**Priority**: High | **Type**: Functional
**Description**: Verify search results are relevant and properly ranked

**Preconditions**: Search functionality available with product data

**Test Steps**:
1. Search for specific product name
2. Verify exact match appears first
3. Search for category name
4. Verify products from that category appear
5. Search for partial product names
6. Test search with common misspellings
7. Search for products in different languages
8. Verify "no results" handling

**Expected Results**:
- Exact matches prioritized in results
- Partial matches included appropriately
- Category-based searches work
- Multi-language search effective
- Misspelling tolerance reasonable
- No results state informative
- Search suggestions provided (if implemented)

**Test Data**: Various product names and categories

**Pass/Fail Criteria**: Search results are relevant and useful

---

### TC-PROD-011: Popular Categories Section
**Priority**: Medium | **Type**: Functional
**Description**: Verify popular/featured categories display and function correctly

**Preconditions**: Popular categories feature exists

**Test Steps**:
1. Navigate to categories page
2. Locate "Most Popular Categories" section
3. Verify categories display correctly
4. Check visual indicators (fire emoji, etc.)
5. Verify clicking popular categories works
6. Compare with regular category behavior
7. Test on mobile devices

**Expected Results**:
- Popular categories clearly highlighted
- Visual distinction from regular categories
- Clicking functions same as regular categories
- Categories update based on actual popularity data
- Section responsive on mobile devices

**Test Data**: Categories with popularity metrics

**Pass/Fail Criteria**: Popular categories feature works correctly

---

### TC-PROD-012: Product Recommendation System
**Priority**: High | **Type**: Functional
**Description**: Verify product recommendations appear when appropriate

**Preconditions**: Recommendation system implemented

**Test Steps**:
1. Add products to cart approaching minimum order
2. Navigate to cart page
3. Verify suggestions appear for reaching minimum
4. Click "Browse Suggested Products"
5. Verify relevant products suggested
6. Test recommendations based on category
7. Test recommendations based on previous orders

**Expected Results**:
- Recommendations appear at appropriate times
- Suggested products relevant to user's cart
- Easy access to add recommended products
- Recommendations help reach minimum order
- Suggestions based on intelligent criteria

**Test Data**: Cart with items below minimum order

**Pass/Fail Criteria**: Recommendations are helpful and relevant

---

## 3. Shopping Cart Management

### TC-CART-001: Add Product to Cart
**Priority**: Critical | **Type**: Functional
**Description**: Verify products can be added to shopping cart successfully

**Preconditions**: 
- User is authenticated
- Products are available

**Test Steps**:
1. Navigate to a product category
2. Select a product with available stock
3. Set quantity to 2 using + button
4. Add product to cart
5. Verify success message appears
6. Navigate to cart page
7. Verify product appears in cart with correct quantity
8. Verify price calculation is correct

**Expected Results**:
- Product adds to cart successfully
- Quantity reflects user selection
- Success feedback provided
- Cart updates immediately
- Price calculations accurate
- Cart icon/counter updates

**Test Data**: 
- Product: Any in-stock item
- Quantity: 2

**Pass/Fail Criteria**: Product successfully added with correct details

---

### TC-CART-002: Cart Quantity Management
**Priority**: Critical | **Type**: Functional
**Description**: Verify cart quantity can be updated using controls

**Preconditions**: Cart contains items

**Test Steps**:
1. Navigate to cart page with items
2. Use + button to increase quantity
3. Verify quantity updates and totals recalculate
4. Use - button to decrease quantity
5. Verify updates happen immediately
6. Set quantity to maximum stock level
7. Try to exceed stock limit
8. Verify stock limit enforcement
9. Decrease quantity to 1, then try to decrease further

**Expected Results**:
- +/- buttons work smoothly
- Quantity updates reflected immediately
- Totals recalculate automatically
- Stock limits enforced
- Cannot set quantity below 1
- UI feedback for invalid operations
- Touch-friendly controls on mobile

**Test Data**: Cart items with various stock levels

**Pass/Fail Criteria**: Quantity controls work properly with validation

---

### TC-CART-003: Remove Items from Cart
**Priority**: Critical | **Type**: Functional
**Description**: Verify items can be removed from cart using multiple methods

**Preconditions**: Cart contains multiple items

**Test Steps**:
1. Navigate to cart with several items
2. Click remove button (🗑️) for one item
3. Verify item removed and totals updated
4. Test swipe-to-delete on mobile device
5. Swipe item left to reveal delete option
6. Tap delete to remove item
7. Verify removal confirmation and execution
8. Set item quantity to 0 using controls
9. Verify item automatically removes

**Expected Results**:
- Remove button deletes items immediately
- Swipe-to-delete works on mobile
- Quantity 0 auto-removes items
- Totals update after removal
- Success confirmation provided
- Smooth animations for removal
- Empty cart state handled

**Test Data**: Cart with multiple items

**Pass/Fail Criteria**: All removal methods work correctly

---

### TC-CART-004: Cart Total Calculations
**Priority**: Critical | **Type**: Functional
**Description**: Verify all cart calculations are accurate

**Preconditions**: Cart contains items with different prices and quantities

**Test Steps**:
1. Add products with different prices to cart
2. Verify subtotal calculation (qty × price for each item)
3. Check tax calculation (19% VAT)
4. Verify delivery fee logic:
   - Free delivery over 5000 DZD
   - 300 DZD fee under 5000 DZD
5. Confirm total = subtotal + tax + delivery
6. Update quantities and verify recalculations
7. Test with different currency amounts

**Expected Results**:
- All calculations mathematically correct
- Tax rate applied properly (19%)
- Delivery fee logic works correctly
- Totals update with quantity changes
- Currency formatting consistent (DZD)
- No rounding errors in calculations

**Test Data**: 
- Items: Various prices (100 DZD, 1,500 DZD, 3,000 DZD)
- Quantities: Different amounts

**Pass/Fail Criteria**: All calculations are accurate

---

### TC-CART-005: Minimum Order Warning
**Priority**: Critical | **Type**: Functional
**Description**: Verify minimum order amount warning and suggestions

**Preconditions**: Minimum order amount is 1,000 DZD

**Test Steps**:
1. Add products totaling less than 1,000 DZD to cart
2. Navigate to cart page
3. Verify minimum order warning appears
4. Check calculation shows amount needed
5. Click "Browse Suggested Products" button
6. Verify navigation to suggestions page
7. Add suggested product and return to cart
8. Verify warning disappears when minimum met

**Expected Results**:
- Warning appears when below minimum
- Clear calculation of amount needed
- Suggestions easily accessible
- Visual progress toward minimum
- Warning dismisses when minimum reached
- Checkout disabled until minimum met

**Test Data**: Products totaling < 1,000 DZD

**Pass/Fail Criteria**: Minimum order enforcement works correctly

---

### TC-CART-006: Empty Cart State
**Priority**: High | **Type**: Functional
**Description**: Verify empty cart displays appropriate messaging and options

**Preconditions**: Cart is empty

**Test Steps**:
1. Navigate to cart page with no items
2. Verify empty state message displayed
3. Check for shopping cart icon/illustration
4. Verify "Start Shopping" button present
5. Click "Start Shopping" button
6. Verify navigation to categories page
7. Test empty cart behavior after removing all items

**Expected Results**:
- Clear empty cart messaging
- Helpful illustration or icon
- Easy path to start shopping
- Encouraging, not discouraging tone
- Proper navigation to products
- Consistent with app design language

**Test Data**: Empty cart state

**Pass/Fail Criteria**: Empty cart state is user-friendly

---

### TC-CART-007: Cart Persistence
**Priority**: High | **Type**: Functional
**Description**: Verify cart contents persist across sessions

**Preconditions**: User has added items to cart

**Test Steps**:
1. Add several items to cart
2. Navigate away from cart page
3. Return to cart and verify items still present
4. Refresh browser page
5. Verify cart contents maintained
6. Close browser and reopen
7. Login again and check cart
8. Test across different browser tabs

**Expected Results**:
- Cart contents persist during session
- Items remain after page refresh
- Cart restored after login
- Consistent across browser tabs
- No duplicate items created
- Quantities maintained correctly

**Test Data**: Various cart items

**Pass/Fail Criteria**: Cart persistence works reliably

---

### TC-CART-008: Mobile Swipe Gestures
**Priority**: High | **Type**: Usability
**Description**: Verify swipe-to-delete functionality works smoothly on mobile

**Preconditions**: 
- Mobile device or touch simulation
- Cart contains items

**Test Steps**:
1. Open cart on mobile device
2. Swipe cart item left (RTL: swipe right)
3. Verify delete button reveals smoothly
4. Tap delete button to remove item
5. Test swipe gesture sensitivity
6. Try partial swipe and release
7. Verify item returns to position
8. Test rapid swipe gestures

**Expected Results**:
- Swipe gestures responsive and smooth
- Delete button reveals at appropriate threshold
- Partial swipes return to original position
- Visual feedback during swipe
- Works in both LTR and RTL languages
- No accidental deletions

**Test Data**: Cart items on mobile

**Pass/Fail Criteria**: Swipe gestures work intuitively

---

### TC-CART-009: Cart Performance with Many Items
**Priority**: Medium | **Type**: Performance
**Description**: Verify cart performance with large number of items

**Preconditions**: Ability to add many items to cart

**Test Steps**:
1. Add 20+ different products to cart
2. Navigate to cart page
3. Measure page load time
4. Test scrolling performance
5. Update quantities on multiple items
6. Measure calculation speed
7. Test remove operations
8. Verify memory usage reasonable

**Expected Results**:
- Cart loads within 3 seconds
- Smooth scrolling with many items
- Quick response to quantity changes
- No performance degradation
- Efficient memory usage
- UI remains responsive

**Test Data**: 20+ cart items

**Pass/Fail Criteria**: Good performance with large carts

---

### TC-CART-010: Checkout Process Initiation
**Priority**: Critical | **Type**: Functional
**Description**: Verify checkout process starts correctly from cart

**Preconditions**: 
- Cart meets minimum order requirements
- User has sufficient credit balance

**Test Steps**:
1. Add products totaling > 1,000 DZD to cart
2. Navigate to cart page
3. Verify checkout button is enabled
4. Review order summary details
5. Click checkout button
6. Verify order creation process initiates
7. Check for processing indicators
8. Verify navigation to order confirmation

**Expected Results**:
- Checkout button enabled when requirements met
- Order summary accurate before checkout
- Loading states during processing
- Successful order creation
- Appropriate success messaging
- Navigation to order details/confirmation

**Test Data**: Cart meeting all requirements

**Pass/Fail Criteria**: Checkout process completes successfully

---

## 4. Order Placement & Management

### TC-ORDER-001: Successful Order Creation
**Priority**: Critical | **Type**: Functional
**Description**: Verify complete order creation process from cart to confirmation

**Preconditions**: 
- Cart contains products totaling > 1,000 DZD
- User has sufficient credit balance

**Test Steps**:
1. Navigate to cart with valid items
2. Review order summary (subtotal, tax, delivery, total)
3. Click checkout button
4. Wait for order processing
5. Verify order creation success message
6. Check order number generation
7. Verify navigation to order details page
8. Verify cart is cleared after successful order
9. Check order appears in order history

**Expected Results**:
- Order creates successfully
- Unique order number generated
- Order confirmation displayed
- Cart emptied after order
- Order visible in history
- All order details accurate
- Success messaging clear

**Test Data**: Valid cart above minimum order

**Pass/Fail Criteria**: Order creation completes end-to-end successfully

---

### TC-ORDER-002: Order Details Display
**Priority**: High | **Type**: Functional
**Description**: Verify order details page shows complete information

**Preconditions**: Order has been created

**Test Steps**:
1. Create an order through checkout process
2. Navigate to order details page
3. Verify order information displayed:
   - Order number
   - Order date/time
   - Order status
   - Items list with quantities and prices
   - Subtotal, tax, delivery fee, total
   - Delivery address (if applicable)
4. Test order details for different order statuses

**Expected Results**:
- All order information visible and accurate
- Clear order status indication
- Itemized breakdown of costs
- Professional presentation
- Order tracking information (if available)
- Contact information for support

**Test Data**: Orders with different statuses

**Pass/Fail Criteria**: Order details are complete and accurate

---

### TC-ORDER-003: Order History Listing
**Priority**: High | **Type**: Functional
**Description**: Verify order history displays recent orders correctly

**Preconditions**: User has placed multiple orders

**Test Steps**:
1. Navigate to home page
2. Locate "Recent Orders" section
3. Verify recent orders displayed (3 most recent)
4. Check order information shows:
   - Order number (last 6 digits)
   - Order status with color coding
   - Total amount
   - Order date
   - Number of items
5. Test "View All" link navigation
6. Verify order statuses are color-coded correctly

**Expected Results**:
- Recent orders displayed prominently
- Order information summary accurate
- Status colors intuitive (green=delivered, etc.)
- Easy navigation to full order details
- "View All" leads to complete history
- Orders sorted by date (newest first)

**Test Data**: Multiple historical orders

**Pass/Fail Criteria**: Order history displays correctly

---

### TC-ORDER-004: Reorder Functionality
**Priority**: Critical | **Type**: Functional
**Description**: Verify users can reorder previous orders

**Preconditions**: User has delivered orders in history

**Test Steps**:
1. Navigate to recent orders section
2. Identify delivered order
3. Click "Reorder" button
4. Verify products added to cart
5. Check product availability
6. Handle out-of-stock items appropriately
7. Navigate to cart to review reorder
8. Test reorder with mixed stock availability

**Expected Results**:
- Reorder button available on delivered orders
- Available products added to cart
- Out-of-stock items handled gracefully
- Clear messaging about stock status
- Cart updated with reorder items
- Quantities maintained from original order

**Test Data**: Historical delivered orders

**Pass/Fail Criteria**: Reorder functionality works smoothly

---

### TC-ORDER-005: Order Status Progression
**Priority**: High | **Type**: Functional
**Description**: Verify order status updates reflect actual progression

**Preconditions**: Orders in different statuses exist

**Test Steps**:
1. Create new order (status: pending)
2. Verify order shows as "pending"
3. Check status color coding
4. Test orders in different statuses:
   - Pending (yellow)
   - Processing (blue)
   - Delivered (green)
5. Verify status text translations
6. Check status history (if available)

**Expected Results**:
- Order statuses display correctly
- Color coding consistent and intuitive
- Status text clear in all languages
- Status updates reflect real changes
- Historical status progression visible

**Test Data**: Orders in various statuses

**Pass/Fail Criteria**: Order status system works accurately

---

### TC-ORDER-006: Credit Balance Impact
**Priority**: Critical | **Type**: Functional
**Description**: Verify order creation affects credit balance appropriately

**Preconditions**: 
- User has known credit balance
- Can place orders

**Test Steps**:
1. Note current credit balance
2. Create order with known total amount
3. Calculate expected new balance
4. Verify balance updates after order
5. Check balance on profile page
6. Verify balance in cart order summary
7. Test with insufficient balance (if applicable)

**Expected Results**:
- Balance decreases by order total
- Balance updates immediately after order
- Correct balance shown throughout app
- Insufficient balance prevents order
- Balance calculations accurate
- Balance history maintained (if available)

**Test Data**: Known balance amounts and order totals

**Pass/Fail Criteria**: Credit balance management is accurate

---

### TC-ORDER-007: Order Error Handling
**Priority**: High | **Type**: Functional
**Description**: Verify appropriate error handling during order creation

**Preconditions**: Ability to simulate error conditions

**Test Steps**:
1. Create order with products that become unavailable
2. Create order with insufficient balance
3. Test network failures during checkout
4. Test system errors during order processing
5. Verify error messages are clear
6. Check that cart state preserved on errors
7. Test error recovery mechanisms

**Expected Results**:
- Clear, actionable error messages
- Cart preserved when order fails
- Network errors handled gracefully
- User can retry after errors
- No partial orders created
- System recovers from errors appropriately

**Test Data**: Various error conditions

**Pass/Fail Criteria**: Error handling provides good user experience

---

### TC-ORDER-008: Monthly Order Statistics
**Priority**: Medium | **Type**: Functional
**Description**: Verify monthly order statistics display correctly

**Preconditions**: User has order history

**Test Steps**:
1. Navigate to home page
2. Locate "Quick Stats" section
3. Verify "This Month" orders count
4. Verify "Total Spent" calculation
5. Compare with actual order history
6. Test with orders from different months
7. Verify stats update with new orders

**Expected Results**:
- Monthly order count accurate
- Total spent calculation correct
- Stats update with new orders
- Clear labeling of time periods
- Currency formatting consistent
- Statistics provide value to user

**Test Data**: Orders from current and previous months

**Pass/Fail Criteria**: Order statistics are accurate and useful

---

## 5. User Profile & Settings

### TC-PROFILE-001: Profile Information Display
**Priority**: High | **Type**: Functional
**Description**: Verify user profile displays complete business information

**Preconditions**: User is authenticated with complete profile

**Test Steps**:
1. Navigate to profile page
2. Verify user information displayed:
   - Business name
   - Username
   - Email address
   - Phone number
   - Account ID
   - Registration date
3. Check business information section
4. Verify credit limit and current balance
5. Test profile display in different languages

**Expected Results**:
- All profile information visible
- Business details accurate
- Financial information current
- Professional presentation
- Information organized logically
- Translations accurate

**Test Data**: Complete user profile

**Pass/Fail Criteria**: Profile displays complete, accurate information

---

### TC-PROFILE-002: Profile Edit Functionality
**Priority**: High | **Type**: Functional
**Description**: Verify users can update their profile information

**Preconditions**: User profile is editable

**Test Steps**:
1. Navigate to profile page
2. Click edit profile button
3. Update changeable fields:
   - Business name
   - Phone number
   - Email address (if allowed)
4. Save changes
5. Verify success message
6. Refresh page and confirm changes persisted
7. Test validation on required fields

**Expected Results**:
- Profile editing interface available
- Changes save successfully
- Validation prevents invalid data
- Changes persist across sessions
- Success feedback provided
- Audit trail maintained (if applicable)

**Test Data**: Updated profile information

**Pass/Fail Criteria**: Profile updates work correctly

---

### TC-PROFILE-003: Business Information Section
**Priority**: Medium | **Type**: Functional
**Description**: Verify business-specific information displays appropriately

**Preconditions**: User has business profile

**Test Steps**:
1. Navigate to profile page
2. Locate business information section
3. Verify business details displayed:
   - Registration status
   - Business type
   - Credit limit
   - Account status
4. Check approval status messaging
5. Verify business verification indicators

**Expected Results**:
- Business information clearly presented
- Account status indicated
- Credit information accurate
- Professional business context
- Approval process status clear

**Test Data**: Business account information

**Pass/Fail Criteria**: Business information is complete and clear

---

### TC-PROFILE-004: Language Preference
**Priority**: High | **Type**: Functional
**Description**: Verify language preference can be changed and persists

**Preconditions**: Multiple languages available

**Test Steps**:
1. Navigate to profile page
2. Change language preference to Arabic
3. Verify interface switches to Arabic RTL
4. Change to French
5. Verify interface switches to French LTR
6. Save preference
7. Logout and login again
8. Verify language preference persisted

**Expected Results**:
- Language changes apply immediately
- RTL/LTR layout adapts correctly
- Preference saves successfully
- Setting persists across sessions
- All interface elements translate
- Setting overrides browser default

**Test Data**: All available languages

**Pass/Fail Criteria**: Language preference works consistently

---

### TC-PROFILE-005: Account Security Information
**Priority**: Medium | **Type**: Security
**Description**: Verify account security information is appropriately displayed

**Preconditions**: User account has security information

**Test Steps**:
1. Navigate to profile page
2. Check for security information:
   - Last login date/time
   - Account creation date
   - Login history (if available)
3. Verify sensitive information is protected
4. Check password change option (if available)
5. Verify account status indicators

**Expected Results**:
- Security information helpful but not excessive
- Sensitive data appropriately protected
- Login information accurate
- Password security maintained
- Account status clear

**Test Data**: Account with login history

**Pass/Fail Criteria**: Security information is appropriate and secure

---

### TC-PROFILE-006: Profile Completion Status
**Priority**: Medium | **Type**: Functional
**Description**: Verify profile completion prompts and requirements

**Preconditions**: User with incomplete profile

**Test Steps**:
1. Login with incomplete profile
2. Check for completion prompts
3. Navigate to profile completion wizard
4. Complete required fields
5. Verify progress indicators
6. Submit completed profile
7. Check for approval process indicators

**Expected Results**:
- Profile completion requirements clear
- Progress indicators helpful
- Completion process smooth
- Required vs optional fields clear
- Submission successful
- Next steps clearly communicated

**Test Data**: Incomplete user profile

**Pass/Fail Criteria**: Profile completion process is user-friendly

---

## 6. Multi-language Support (RTL/LTR)

### TC-LANG-001: Arabic RTL Layout
**Priority**: Critical | **Type**: Functional
**Description**: Verify Arabic language displays with proper RTL layout

**Preconditions**: Arabic language support available

**Test Steps**:
1. Navigate to login page
2. Select Arabic language
3. Verify layout switches to RTL:
   - Text alignment right-to-left
   - Navigation icons mirrored
   - Form fields align right
   - Buttons positioned correctly
4. Navigate through all major pages
5. Verify consistent RTL layout
6. Test Arabic text rendering

**Expected Results**:
- Complete RTL layout transformation
- Arabic text renders correctly
- Navigation intuitive in RTL
- All UI elements mirrored appropriately
- No layout breaking or overflow
- Font supports Arabic characters

**Test Data**: All Arabic interface text

**Pass/Fail Criteria**: Arabic RTL layout is consistent and functional

---

### TC-LANG-002: Language Switching
**Priority**: High | **Type**: Functional
**Description**: Verify seamless switching between languages

**Preconditions**: Multiple languages available

**Test Steps**:
1. Start in English language
2. Switch to French using language selector
3. Verify immediate language change
4. Switch to Arabic
5. Verify RTL layout change
6. Switch back to English
7. Verify LTR layout restoration
8. Test language switching on different pages

**Expected Results**:
- Language changes apply immediately
- Layout changes appropriately (RTL/LTR)
- No page refresh required
- Language preference remembered
- All text translates correctly
- UI remains functional during switch

**Test Data**: All supported languages

**Pass/Fail Criteria**: Language switching is smooth and complete

---

### TC-LANG-003: Currency and Number Formatting
**Priority**: High | **Type**: Functional
**Description**: Verify numbers and currency format correctly in all languages

**Preconditions**: Different language settings available

**Test Steps**:
1. View prices in English (1,500 DZD)
2. Switch to French and verify formatting
3. Switch to Arabic and verify formatting
4. Test large numbers (100,000+ DZD)
5. Verify decimal handling
6. Check thousand separators
7. Test currency symbol placement

**Expected Results**:
- Consistent currency formatting
- Appropriate thousand separators
- Currency symbol positioned correctly
- Numbers readable in all languages
- Decimal points handled properly
- Cultural formatting respected

**Test Data**: Various price ranges and amounts

**Pass/Fail Criteria**: Currency formatting is appropriate for each language

---

### TC-LANG-004: Form Input in Different Languages
**Priority**: High | **Type**: Functional
**Description**: Verify form inputs work correctly in all languages

**Preconditions**: Forms available in multiple languages

**Test Steps**:
1. Test login form in Arabic
2. Verify text input accepts Arabic characters
3. Test form in French
4. Verify accent characters work
5. Test search in all languages
6. Verify mixed-language input handling
7. Test form validation messages in each language

**Expected Results**:
- All character sets accepted in inputs
- Text direction appropriate for language
- Validation messages translated
- Form submission works in all languages
- Mixed-language input handled gracefully

**Test Data**: Text in Arabic, French, and English

**Pass/Fail Criteria**: Forms function properly in all languages

---

### TC-LANG-005: Navigation and Menu Translation
**Priority**: Medium | **Type**: Functional
**Description**: Verify navigation menus translate completely

**Preconditions**: Full navigation system available

**Test Steps**:
1. Navigate to dashboard in English
2. Note all navigation labels
3. Switch to Arabic
4. Verify all navigation items translated
5. Switch to French
6. Verify complete French translation
7. Test menu functionality in each language
8. Verify breadcrumbs translate

**Expected Results**:
- All navigation elements translated
- Menu structure consistent across languages
- Navigation functionality preserved
- Breadcrumbs work in all languages
- No untranslated text visible

**Test Data**: Full navigation structure

**Pass/Fail Criteria**: Navigation fully translated and functional

---

### TC-LANG-006: Error Messages Translation
**Priority**: Medium | **Type**: Functional
**Description**: Verify error messages display in selected language

**Preconditions**: Error conditions can be triggered

**Test Steps**:
1. Set language to Arabic
2. Trigger login error with invalid credentials
3. Verify error message in Arabic
4. Switch to French and trigger form error
5. Verify error message in French
6. Test network error messages
7. Test validation error messages
8. Verify error messages are culturally appropriate

**Expected Results**:
- All error messages translated
- Messages clear in target language
- Cultural appropriateness maintained
- No English fallbacks visible
- Error severity maintained across languages

**Test Data**: Various error conditions

**Pass/Fail Criteria**: Error messages fully localized

---

## 7. PWA Features

### TC-PWA-001: Installation Prompt
**Priority**: High | **Type**: Functional
**Description**: Verify PWA can be installed on mobile devices

**Preconditions**: 
- Mobile browser that supports PWA
- Valid manifest.json

**Test Steps**:
1. Open app in mobile Chrome/Safari
2. Use app for a few interactions
3. Look for installation prompt
4. Tap "Add to Home Screen" or similar
5. Verify app icon appears on home screen
6. Launch app from home screen
7. Verify app opens in standalone mode

**Expected Results**:
- Installation prompt appears appropriately
- Installation process is smooth
- App icon displays correctly on home screen
- App launches in fullscreen/standalone mode
- App behaves like native app when installed

**Test Data**: PWA manifest and service worker

**Pass/Fail Criteria**: PWA installation works on supported devices

---

### TC-PWA-002: Offline Functionality
**Priority**: High | **Type**: Functional
**Description**: Verify app functions when network is unavailable

**Preconditions**: PWA installed or service worker registered

**Test Steps**:
1. Use app while online normally
2. Turn off device network connection
3. Navigate to previously visited pages
4. Verify cached pages load correctly
5. Try to access new pages
6. Verify appropriate offline messaging
7. Turn network back on
8. Verify app resumes normal operation

**Expected Results**:
- Previously visited pages work offline
- Offline indicator shows when network unavailable
- Graceful degradation for network-dependent features
- Clear messaging about offline status
- Smooth transition back to online mode

**Test Data**: Various app pages and features

**Pass/Fail Criteria**: Core offline functionality works appropriately

---

### TC-PWA-003: App Manifest Properties
**Priority**: Medium | **Type**: Technical
**Description**: Verify PWA manifest contains correct information

**Preconditions**: Manifest.json file accessible

**Test Steps**:
1. Access /manifest.json directly
2. Verify required properties present:
   - name: "Livrili - B2B Marketplace"
   - short_name: "Livrili"
   - theme_color: "#003049"
   - background_color: "#003049"
   - display: "standalone"
   - start_url: "/"
3. Check icon definitions
4. Verify shortcuts are defined
5. Test manifest validation

**Expected Results**:
- All required manifest properties present
- Icons available in multiple sizes
- Shortcuts provide useful quick access
- Manifest validates correctly
- Properties reflect app purpose

**Test Data**: Manifest.json file

**Pass/Fail Criteria**: Manifest is complete and valid

---

### TC-PWA-004: Push Notifications (if implemented)
**Priority**: Medium | **Type**: Functional
**Description**: Verify push notification functionality

**Preconditions**: Push notifications implemented

**Test Steps**:
1. Install PWA on mobile device
2. Grant notification permissions
3. Trigger notification-worthy event
4. Verify notification appears on device
5. Tap notification
6. Verify app opens to relevant section
7. Test notification settings

**Expected Results**:
- Notification permission request appears
- Notifications display with correct content
- Tapping notifications opens relevant app section
- Notifications work when app is closed
- User can manage notification preferences

**Test Data**: Events that trigger notifications

**Pass/Fail Criteria**: Push notifications enhance user experience

---

### TC-PWA-005: App Shell Loading
**Priority**: High | **Type**: Performance
**Description**: Verify app shell loads quickly on repeat visits

**Preconditions**: Service worker caching implemented

**Test Steps**:
1. Visit app for first time and fully load
2. Clear browser cache except service worker
3. Revisit app
4. Measure app shell load time
5. Test on slow network conditions
6. Verify core UI appears quickly
7. Test progressive loading of content

**Expected Results**:
- App shell loads within 1 second on repeat visits
- Core UI appears before content loads
- Progressive loading provides good perceived performance
- Service worker caching works effectively
- App remains responsive during loading

**Test Data**: App shell components

**Pass/Fail Criteria**: Fast app shell loading provides good UX

---

### TC-PWA-006: Background Sync (if implemented)
**Priority**: Medium | **Type**: Functional
**Description**: Verify offline actions sync when connection restored

**Preconditions**: Background sync implemented for cart actions

**Test Steps**:
1. Go offline
2. Attempt to add items to cart
3. Verify actions queued for later sync
4. Go back online
5. Verify queued actions execute automatically
6. Check cart reflects offline changes
7. Test with various offline actions

**Expected Results**:
- Offline actions queued appropriately
- Automatic sync when connection restored
- No duplicate actions executed
- User informed of sync status
- Data consistency maintained

**Test Data**: Cart modifications while offline

**Pass/Fail Criteria**: Background sync maintains data consistency

---

### TC-PWA-007: App Updates
**Priority**: Medium | **Type**: Functional
**Description**: Verify app updates install correctly

**Preconditions**: New version of app available

**Test Steps**:
1. Open existing PWA installation
2. Deploy new version to server
3. Verify update detection
4. Check for update notification
5. Accept app update
6. Verify new version loads
7. Test backward compatibility

**Expected Results**:
- App detects updates automatically
- User notified of available updates
- Update process is smooth
- New features/fixes work correctly
- No data loss during update

**Test Data**: New app version

**Pass/Fail Criteria**: App updates work seamlessly

---

### TC-PWA-008: Cross-Platform Consistency
**Priority**: High | **Type**: Functional
**Description**: Verify PWA works consistently across platforms

**Preconditions**: Multiple devices/browsers available

**Test Steps**:
1. Test PWA on iOS Safari
2. Test PWA on Android Chrome
3. Test on desktop browsers
4. Compare functionality across platforms
5. Test installation on each platform
6. Verify feature parity
7. Check performance consistency

**Expected Results**:
- Core functionality works on all platforms
- Installation available where supported
- Performance reasonable across platforms
- UI adapts appropriately to platform
- No platform-specific blocking issues

**Test Data**: Multiple devices and browsers

**Pass/Fail Criteria**: Consistent experience across supported platforms

---

## 8. Performance & Load Testing

### TC-PERF-001: Page Load Times
**Priority**: High | **Type**: Performance
**Description**: Verify pages load within acceptable time limits

**Preconditions**: Application deployed with typical data

**Test Steps**:
1. Clear browser cache completely
2. Navigate to login page and measure load time
3. Login and measure home page load time
4. Navigate to categories page and measure
5. Select category with many products and measure
6. Test on 3G network simulation
7. Test with large product catalogs

**Expected Results**:
- Login page loads < 2 seconds
- Home page loads < 3 seconds  
- Categories page loads < 3 seconds
- Product pages load < 3 seconds
- 3G performance acceptable (< 5 seconds)
- Progressive loading implemented

**Performance Targets**:
- WiFi: < 3 seconds
- 3G: < 5 seconds
- Cache miss: < 4 seconds

**Pass/Fail Criteria**: Pages meet performance targets

---

### TC-PERF-002: Cart Operations Performance
**Priority**: High | **Type**: Performance
**Description**: Verify cart operations respond quickly

**Preconditions**: Products available for cart operations

**Test Steps**:
1. Measure time to add item to cart
2. Measure time to update cart quantity
3. Measure time to remove item from cart
4. Test with cart containing 20+ items
5. Measure cart page load with many items
6. Test bulk operations if available

**Expected Results**:
- Add to cart < 500ms
- Quantity update < 300ms  
- Remove from cart < 300ms
- Cart page loads < 2 seconds with 20+ items
- No UI blocking during operations
- Smooth animations

**Performance Targets**:
- Cart operations: < 500ms
- Cart page load: < 2 seconds
- UI responsiveness: < 100ms

**Pass/Fail Criteria**: Cart operations are responsive

---

### TC-PERF-003: Search Performance
**Priority**: Medium | **Type**: Performance
**Description**: Verify search returns results quickly

**Preconditions**: Large product catalog available

**Test Steps**:
1. Measure search response time for common terms
2. Test search with large result sets
3. Test search with no results
4. Measure autocomplete/suggestions response
5. Test search across different languages
6. Test partial match searches

**Expected Results**:
- Search results < 1 second
- Large result sets handled efficiently
- No-results handled quickly
- Autocomplete responsive (< 300ms)
- Multi-language search performs well
- Search UI remains responsive

**Performance Targets**:
- Search results: < 1 second
- Autocomplete: < 300ms
- UI responsiveness maintained

**Pass/Fail Criteria**: Search performance meets targets

---

### TC-PERF-004: Memory Usage
**Priority**: Medium | **Type**: Performance
**Description**: Verify app uses memory efficiently

**Preconditions**: Browser developer tools available

**Test Steps**:
1. Open browser developer tools
2. Monitor memory usage during typical session
3. Navigate through multiple pages
4. Add/remove items from cart repeatedly
5. Test for memory leaks
6. Monitor over extended usage (30+ minutes)
7. Check memory usage with large datasets

**Expected Results**:
- Memory usage remains stable
- No significant memory leaks detected
- Memory usage reasonable for device type
- Garbage collection working effectively
- App doesn't cause browser slowdown

**Memory Targets**:
- Mobile: < 100MB
- Desktop: < 200MB
- No memory leaks over time

**Pass/Fail Criteria**: Memory usage is efficient and stable

---

## 9. Security Testing

### TC-SEC-001: Authentication Security
**Priority**: Critical | **Type**: Security
**Description**: Verify authentication system is secure against common attacks

**Preconditions**: Authentication system available

**Test Steps**:
1. Test brute force protection
2. Attempt multiple failed logins rapidly
3. Verify account lockout or rate limiting
4. Test SQL injection in login fields
5. Test XSS in username/password fields
6. Verify password is not logged or exposed
7. Test session timeout behavior

**Expected Results**:
- Brute force protection active
- Rate limiting prevents rapid attempts
- SQL injection attempts blocked
- XSS attempts neutralized
- Passwords never exposed in logs/network
- Sessions timeout appropriately

**Security Requirements**:
- Rate limiting: 5 attempts per minute
- Input sanitization active
- Secure session management

**Pass/Fail Criteria**: Authentication system resists common attacks

---

### TC-SEC-002: Authorization Controls
**Priority**: Critical | **Type**: Security
**Description**: Verify users can only access authorized resources

**Preconditions**: Different user roles or retailer accounts

**Test Steps**:
1. Login as regular retailer
2. Attempt to access admin URLs directly
3. Attempt to access other retailer's data
4. Test API endpoints with invalid tokens
5. Verify session isolation
6. Test privilege escalation attempts

**Expected Results**:
- Access controls prevent unauthorized access
- Admin areas not accessible to retailers
- Retailer data properly isolated
- Invalid tokens rejected
- No privilege escalation possible
- Clear error messages for unauthorized access

**Security Requirements**:
- Role-based access control
- Data isolation between users
- Secure API endpoints

**Pass/Fail Criteria**: Authorization controls work correctly

---

### TC-SEC-003: Data Transmission Security
**Priority**: Critical | **Type**: Security
**Description**: Verify all data transmission is secure

**Preconditions**: Network monitoring tools available

**Test Steps**:
1. Monitor network traffic during login
2. Verify HTTPS used for all requests
3. Check for mixed content warnings
4. Verify sensitive data encryption
5. Test certificate validation
6. Check for secure cookie settings

**Expected Results**:
- All traffic uses HTTPS
- No mixed content issues
- Sensitive data encrypted in transit
- Valid SSL/TLS certificates
- Secure cookie attributes set
- No sensitive data in URLs

**Security Requirements**:
- HTTPS enforcement
- Valid certificates
- Secure cookie handling

**Pass/Fail Criteria**: All data transmission is secure

---

### TC-SEC-004: Input Validation
**Priority**: High | **Type**: Security
**Description**: Verify all user inputs are properly validated

**Preconditions**: Forms with user input available

**Test Steps**:
1. Test XSS payloads in all input fields
2. Test SQL injection in search and forms
3. Test file upload security (if applicable)
4. Verify input length limits
5. Test special character handling
6. Test Unicode character support

**Expected Results**:
- XSS payloads neutralized
- SQL injection attempts blocked
- File uploads validated properly
- Input limits enforced
- Special characters handled safely
- No code execution through inputs

**Security Requirements**:
- Input sanitization
- Output encoding
- File type validation

**Pass/Fail Criteria**: All inputs properly validated

---

### TC-SEC-005: Session Management
**Priority**: High | **Type**: Security
**Description**: Verify secure session management

**Preconditions**: User authentication available

**Test Steps**:
1. Login and examine session cookies
2. Verify secure cookie attributes
3. Test session fixation attacks
4. Test concurrent session handling
5. Verify logout clears session
6. Test session timeout behavior

**Expected Results**:
- Session cookies have secure attributes
- Session fixation prevented
- Concurrent sessions handled appropriately
- Logout fully clears session
- Sessions timeout after inactivity
- Session IDs not predictable

**Security Requirements**:
- HttpOnly, Secure cookie flags
- Session timeout: 24 hours
- Secure session generation

**Pass/Fail Criteria**: Session management is secure

---

## 10. Accessibility Testing

### TC-ACC-001: Screen Reader Compatibility
**Priority**: High | **Type**: Accessibility
**Description**: Verify app works with screen readers

**Preconditions**: Screen reader software available (NVDA, JAWS, or VoiceOver)

**Test Steps**:
1. Enable screen reader
2. Navigate through login process using only keyboard
3. Test product browsing with screen reader
4. Navigate cart using screen reader
5. Verify alt text on images
6. Test form labels and descriptions
7. Verify focus management

**Expected Results**:
- All interface elements announced correctly
- Images have descriptive alt text
- Form labels associated properly
- Navigation landmarks present
- Focus order logical
- No information lost to screen readers

**Accessibility Standards**: WCAG 2.1 AA compliance

**Pass/Fail Criteria**: App usable with screen readers

---

### TC-ACC-002: Keyboard Navigation
**Priority**: High | **Type**: Accessibility
**Description**: Verify full keyboard navigation support

**Preconditions**: No mouse/touch input used

**Test Steps**:
1. Navigate entire app using only Tab/Shift+Tab
2. Test Enter/Space for activation
3. Use arrow keys in lists/grids
4. Test Escape key functionality
5. Verify focus indicators visible
6. Test skip links if available
7. Navigate forms using keyboard only

**Expected Results**:
- All interactive elements keyboard accessible
- Focus indicators clearly visible
- Logical tab order throughout app
- Escape key closes modals/dropdowns
- Skip links help navigation efficiency
- No keyboard traps

**Accessibility Standards**: WCAG 2.1 AA keyboard requirements

**Pass/Fail Criteria**: Complete keyboard accessibility

---

### TC-ACC-003: Color Contrast and Visual Design
**Priority**: High | **Type**: Accessibility
**Description**: Verify sufficient color contrast and visual accessibility

**Preconditions**: Color contrast analyzer tools

**Test Steps**:
1. Test text/background contrast ratios
2. Check button contrast in all states
3. Verify error message visibility
4. Test with high contrast mode
5. Verify no information conveyed by color alone
6. Test with different zoom levels (up to 200%)

**Expected Results**:
- Text contrast ratio ≥ 4.5:1 for normal text
- Text contrast ratio ≥ 3:1 for large text
- Interactive elements meet contrast requirements
- Information not dependent on color alone
- App usable at 200% zoom
- High contrast mode supported

**Accessibility Standards**: WCAG 2.1 AA color requirements

**Pass/Fail Criteria**: Visual accessibility standards met

---

### TC-ACC-004: Arabic RTL Accessibility
**Priority**: Medium | **Type**: Accessibility
**Description**: Verify accessibility features work correctly in RTL layout

**Preconditions**: 
- Arabic language support
- Screen reader with Arabic support

**Test Steps**:
1. Switch to Arabic language
2. Test screen reader with RTL content
3. Verify keyboard navigation in RTL
4. Test focus order with RTL layout
5. Verify form navigation in RTL
6. Test with Arabic assistive technologies

**Expected Results**:
- Screen reader handles RTL text correctly
- Keyboard navigation follows RTL convention
- Focus order appropriate for RTL layout
- Arabic content properly announced
- RTL layout doesn't break accessibility

**Accessibility Standards**: RTL accessibility best practices

**Pass/Fail Criteria**: RTL accessibility maintains standards

---

### TC-ACC-005: Mobile Accessibility
**Priority**: Medium | **Type**: Accessibility
**Description**: Verify accessibility on mobile devices

**Preconditions**: Mobile device with accessibility features

**Test Steps**:
1. Test with iOS VoiceOver
2. Test with Android TalkBack
3. Verify touch target sizes (≥ 44px)
4. Test zoom up to 200%
5. Verify voice control compatibility
6. Test with assistive switch controls

**Expected Results**:
- Mobile screen readers work correctly
- Touch targets meet minimum size requirements
- App usable with zoom enabled
- Voice control commands work
- Switch control navigation possible
- Mobile-specific gestures accessible

**Accessibility Standards**: Mobile accessibility guidelines

**Pass/Fail Criteria**: Mobile accessibility standards met

---

# Test Execution Strategy

## Priority-Based Testing

### Phase 1: Critical Tests (Priority: Critical)
Execute all 23 Critical priority test cases first
- Focus on core business functionality
- Authentication and authorization
- Cart and order management
- Basic product browsing

### Phase 2: High Priority Tests (Priority: High)
Execute 29 High priority test cases
- Enhanced functionality
- Performance requirements
- Multi-language support
- PWA features

### Phase 3: Medium Priority Tests (Priority: Medium)
Execute 20 Medium priority test cases  
- Nice-to-have features
- Advanced functionality
- Edge cases
- Optimization features

## Test Environment Matrix

| Environment | Purpose | Test Scope |
|-------------|---------|------------|
| Local Development | Development testing | All functionality |
| Staging | Pre-production validation | Full regression |
| Production | Live environment verification | Smoke tests only |

## Device Testing Matrix

| Device Type | Browsers | Languages | Network |
|-------------|----------|-----------|---------|
| Mobile Android | Chrome, Firefox | AR, FR, EN | 3G, WiFi |
| Mobile iOS | Safari, Chrome | AR, FR, EN | 3G, WiFi |
| Tablet | Chrome, Safari, Firefox | AR, FR, EN | WiFi |
| Desktop | Chrome, Firefox, Safari, Edge | AR, FR, EN | WiFi |

## Bug Severity Classification

### Severity 1 - Critical
- Application crashes or doesn't load
- Authentication completely broken
- Cannot complete core business flow (orders)
- Data corruption or security breaches

### Severity 2 - High  
- Major functionality broken
- Workaround exists but difficult
- Performance significantly degraded
- Accessibility barriers

### Severity 3 - Medium
- Minor functionality issues
- Easy workaround available
- Cosmetic issues affecting usability
- Non-critical performance issues

### Severity 4 - Low
- Cosmetic issues
- Enhancement requests
- Documentation issues
- Minor inconsistencies

## Test Data Management

### Test Retailer Accounts
```
Primary Test Account:
- Username: testretailer1
- Password: Test123!
- Business: Test Retail Store
- Credit Limit: 5,000 DZD
- Current Balance: 2,500 DZD

Low Credit Account:
- Username: lowcredit  
- Password: Test123!
- Credit Limit: 1,000 DZD
- Current Balance: 100 DZD

High Volume Account:
- Username: highvolume
- Password: Test123!
- Credit Limit: 50,000 DZD
- Previous orders: 50+
```

### Test Product Catalog
- 100+ products across 10 categories
- Various stock levels (0, low, high)
- Different price ranges (50 DZD - 10,000 DZD)
- Products with minimum order quantities
- Products in different units (kg, pieces, boxes)

## Risk Assessment

### High Risk Areas
1. **Authentication System**: Critical for access control
2. **Order Processing**: Core business functionality
3. **Payment/Credit Management**: Financial implications
4. **Multi-language RTL**: Complex layout and text handling
5. **Mobile Performance**: Primary user interface

### Mitigation Strategies
- Automated regression tests for core flows
- Manual testing on real devices
- Performance monitoring in production
- Security scanning and penetration testing
- Accessibility audits with real users

## Test Reporting

### Daily Test Reports
- Test execution progress
- Pass/fail summary by category
- Critical and high severity bugs
- Blocked test cases
- Risk assessment updates

### Weekly Test Summary
- Overall test completion percentage
- Bug trends and resolution rates
- Performance benchmark results
- Device/browser compatibility status
- Accessibility compliance status

### Final Test Report
- Complete test execution summary
- All identified issues and resolutions
- Risk assessment and recommendations
- Performance and accessibility certification
- Production readiness assessment

## Success Criteria

### Functional Requirements
- ≥ 95% of Critical tests pass
- ≥ 90% of High priority tests pass  
- ≥ 85% of Medium priority tests pass
- No Severity 1 bugs open
- ≤ 3 Severity 2 bugs open

### Performance Requirements
- Page load times meet targets
- Cart operations responsive
- Search results under 1 second
- Memory usage within limits

### Accessibility Requirements
- WCAG 2.1 AA compliance achieved
- Screen reader compatibility verified
- Keyboard navigation complete
- Color contrast standards met

### Security Requirements
- No critical security vulnerabilities
- Authentication system secure
- Data transmission encrypted
- Input validation comprehensive

---

This comprehensive test plan covers all major aspects of the Livrili retail portal PWA, with detailed test cases, execution strategy, and success criteria. The plan emphasizes the mobile-first, multi-language, and B2B e-commerce nature of the application while ensuring thorough coverage of functionality, performance, security, and accessibility requirements.