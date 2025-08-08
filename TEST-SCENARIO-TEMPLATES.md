# Test Scenario Templates - Retail Portal

## Template Framework Overview

This document provides standardized test scenario templates for all testing areas of the Livrili retail portal. Each template is designed for specific agent types and testing contexts while ensuring consistency and completeness.

## Core Template Structure

### Universal Template Elements
```yaml
Test_ID: [AREA]-[TYPE]-[NUMBER]
Priority: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
Agent_Type: [Primary agent responsible]
Test_Environment: [Browser/Device/Network requirements]
Prerequisites: [Setup requirements and dependencies]
Test_Data: [Required data and user accounts]
Execution_Time: [Estimated time for execution]
Automation_Status: [Manual/Semi-automated/Fully automated]
```

## 1. Authentication & Security Test Templates

### Security Authentication Template
```yaml
Test_ID: SEC-AUTH-[NUMBER]
Priority: P0
Agent_Type: Security Specialist
Test_Environment: Chrome/Firefox/Safari, Desktop/Mobile
Prerequisites: 
  - Clean browser state
  - Test user accounts available
  - Database reset to baseline
Test_Data:
  - Valid retailer credentials
  - Invalid credential combinations
  - Edge case inputs (special characters, long strings)

Test_Steps:
  1. Navigate to login page
  2. Enter credentials: [CREDENTIAL_SET]
  3. Click login button
  4. Verify response behavior
  5. Check session establishment
  6. Validate security headers
  7. Test session persistence
  8. Verify logout functionality

Expected_Results:
  - Valid credentials: Successful authentication
  - Invalid credentials: Clear error message, no system exposure
  - Security headers: X-Frame-Options, CSRF protection present
  - Session: Secure token, appropriate timeout
  - No sensitive data in browser storage

Risk_Assessment: High
Business_Impact: Authentication failure blocks all user functionality
Security_Focus:
  - SQL injection attempts
  - XSS payload filtering
  - Session hijacking prevention
  - Brute force protection
```

### Session Management Template
```yaml
Test_ID: SEC-SESSION-[NUMBER]
Priority: P0
Agent_Type: Security Specialist
Test_Environment: Multiple browsers, Cross-tab testing
Prerequisites:
  - Authenticated user session
  - Multiple browser instances

Test_Steps:
  1. Establish authenticated session in Browser A
  2. Open same application in Browser B
  3. Perform logout in Browser A
  4. Attempt to access protected resource in Browser B
  5. Test session timeout behavior
  6. Validate session token rotation

Expected_Results:
  - Session properly invalidated across all instances
  - Timeout behavior secure and user-friendly
  - Token rotation prevents replay attacks

Security_Validations:
  - No session fixation vulnerabilities
  - Secure cookie attributes (HttpOnly, Secure, SameSite)
  - Proper session invalidation on logout
  - CSRF token validation
```

## 2. Product Management Test Templates

### Product Catalog Navigation Template
```yaml
Test_ID: FE-PROD-[NUMBER]
Priority: P0
Agent_Type: Frontend Specialist
Test_Environment: Mobile-first testing (iOS/Android), Desktop fallback
Prerequisites:
  - Authenticated user session
  - Product catalog populated with test data
  - Network conditions: WiFi, 3G simulation

Test_Data:
  - Categories with varying product counts (0, 1, 10, 100+ products)
  - Products with Arabic/French/English names
  - Products with/without images
  - Out-of-stock products

Test_Steps:
  1. Navigate to product catalog
  2. Measure initial load time
  3. Test category filtering
  4. Validate product card rendering
  5. Test search functionality
  6. Check infinite scroll/pagination
  7. Validate image lazy loading
  8. Test language switching

Expected_Results:
  - Load time < 3s on 3G, < 1s on WiFi
  - Smooth category transitions
  - Accurate product information display
  - Functional search with relevant results
  - Proper RTL layout for Arabic content
  - Image optimization and lazy loading

Performance_Criteria:
  - Time to First Contentful Paint < 2s
  - Largest Contentful Paint < 3s
  - First Input Delay < 100ms
  - Cumulative Layout Shift < 0.1

Mobile_Specific:
  - Touch targets ≥ 44px
  - Thumb-friendly navigation
  - Swipe gestures functional
  - Viewport meta tag proper
```

### Product Search Template  
```yaml
Test_ID: FE-SEARCH-[NUMBER]
Priority: P1
Agent_Type: Frontend Specialist
Test_Environment: Multi-language testing environment
Prerequisites:
  - Search index populated
  - Multi-language product data

Test_Data:
  - Search terms in Arabic, French, English
  - Product names, descriptions, SKUs
  - Special characters and numbers
  - Empty search queries

Search_Test_Cases:
  1. Exact product name match
  2. Partial keyword search
  3. Multi-word search queries
  4. Search in different languages
  5. Search with special characters
  6. Empty search handling
  7. No results scenario
  8. Auto-complete suggestions

Expected_Results:
  - Relevant search results returned
  - Multi-language search working
  - Auto-complete responsive < 200ms
  - Graceful no-results handling
  - Search history preservation

Accessibility_Requirements:
  - Search input accessible via keyboard
  - Screen reader compatible
  - Clear search result announcements
  - Focus management in results
```

## 3. Shopping Cart Test Templates

### Cart Operations Template
```yaml
Test_ID: FE-CART-[NUMBER]
Priority: P0
Agent_Type: Frontend Specialist + QA
Test_Environment: Mobile primary, cross-browser validation
Prerequisites:
  - Authenticated user
  - Products available in catalog
  - Empty cart initial state

Test_Data:
  - Various product types and prices
  - Products with different stock levels
  - Minimum order amount test data

Cart_Operation_Tests:
  1. Add single product to cart
  2. Add multiple products to cart
  3. Update product quantity (increase/decrease)
  4. Remove single product from cart
  5. Clear entire cart
  6. Test cart persistence across sessions
  7. Validate stock limit handling
  8. Test minimum order validation

Mobile_Specific_Tests:
  1. Swipe-to-delete gesture validation
  2. Touch quantity controls (+ / -)
  3. Cart drawer/modal behavior
  4. Cart icon update animation
  5. Haptic feedback (where available)

Expected_Results:
  - Real-time cart updates
  - Accurate price calculations
  - Stock validation enforcement
  - Smooth mobile interactions
  - Cart state persistence

Performance_Requirements:
  - Cart updates < 500ms response time
  - Smooth animations 60fps
  - No layout shifts during updates
  - Offline cart capability (PWA)

Error_Handling:
  - Out of stock product handling
  - Network failure scenarios
  - Invalid quantity inputs
  - Cart synchronization conflicts
```

### Cart State Management Template
```yaml
Test_ID: QA-CART-STATE-[NUMBER]
Priority: P0
Agent_Type: QA Specialist
Test_Environment: Multi-session, multi-device testing
Prerequisites:
  - User account with cart history
  - Multiple devices/browsers available

State_Management_Tests:
  1. Add items in Session A
  2. Verify cart in Session B (same user)
  3. Modify cart in Session B
  4. Verify updates in Session A
  5. Test logout/login cart preservation
  6. Cross-device cart synchronization
  7. Offline cart storage
  8. Cart merge on login

Data_Validation:
  - Cart item count accuracy
  - Price calculation correctness
  - Tax calculation validation
  - Delivery fee calculation
  - Total amount accuracy

Edge_Cases:
  - Product price changes while in cart
  - Product becomes out of stock
  - User session expires with items in cart
  - Concurrent cart modifications
  - Network interruption during cart update
```

## 4. Order Management Test Templates

### Checkout Process Template
```yaml
Test_ID: QA-ORDER-CHECKOUT-[NUMBER]
Priority: P0
Agent_Type: QA Specialist + Security
Test_Environment: End-to-end testing environment
Prerequisites:
  - Cart with valid items meeting minimum order
  - Retailer account with valid profile
  - Payment gateway test environment

Checkout_Flow_Tests:
  1. Navigate from cart to checkout
  2. Verify order summary accuracy
  3. Validate delivery information
  4. Apply any discount codes
  5. Review final order details
  6. Complete order placement
  7. Verify order confirmation
  8. Check order status update

Order_Validation:
  - Order ID generation and uniqueness
  - Order details accuracy (items, quantities, prices)
  - Delivery information correctness
  - Payment processing integration
  - Order status tracking initialization

Error_Scenarios:
  - Payment failure handling
  - Network interruption during checkout
  - Inventory changes during checkout
  - Session expiration during checkout
  - Invalid delivery information

Expected_Results:
  - Successful order placement
  - Accurate order confirmation
  - Email/SMS notifications sent
  - Order appears in order history
  - Inventory properly decremented

Security_Validations:
  - Order data encryption
  - User authorization validation
  - Price manipulation prevention
  - Order tampering protection
```

### Order History Template
```yaml
Test_ID: QA-ORDER-HISTORY-[NUMBER]
Priority: P1
Agent_Type: QA Specialist
Test_Environment: Historical data testing
Prerequisites:
  - User account with order history
  - Orders in various states (pending, completed, cancelled)

Order_History_Tests:
  1. Display complete order history
  2. Filter orders by status
  3. Filter orders by date range
  4. Search specific order by ID
  5. View detailed order information
  6. Reorder functionality
  7. Download order receipts
  8. Track order status updates

Display_Validation:
  - Correct order chronological display
  - Accurate order status representation
  - Proper order detail formatting
  - Multi-language order information

Pagination_Testing:
  - Large order history handling
  - Infinite scroll performance
  - Search within results
  - Export functionality
```

## 5. Multi-language & RTL Test Templates

### RTL Layout Template
```yaml
Test_ID: A11Y-RTL-[NUMBER]
Priority: P1
Agent_Type: Accessibility Specialist
Test_Environment: Arabic language setting, RTL layout
Prerequisites:
  - Application configured for Arabic (RTL)
  - Test data in Arabic language
  - RTL-aware browser settings

RTL_Layout_Tests:
  1. Overall page layout direction
  2. Navigation menu RTL alignment
  3. Product grid RTL arrangement
  4. Shopping cart RTL layout
  5. Form field RTL arrangement
  6. Button positioning and alignment
  7. Icon mirroring validation
  8. Text alignment consistency

Layout_Validation_Points:
  - Text alignment (right-aligned)
  - Navigation flow (right-to-left)
  - Icon mirroring where appropriate
  - Form label positioning
  - Button text and icon alignment

CSS_Specific_Checks:
  - Direction: rtl property application
  - Logical properties usage (margin-inline-start vs margin-left)
  - Float and positioning adjustments
  - Border radius and shadow positioning

Content_Validation:
  - Arabic text rendering correctly
  - Mixed content handling (Arabic + numbers/English)
  - Font selection and readability
  - Character encoding validation

Cross_Browser_RTL:
  - Chrome RTL rendering
  - Safari RTL support
  - Firefox RTL behavior
  - Mobile browser RTL consistency
```

### Language Switching Template
```yaml
Test_ID: A11Y-LANG-[NUMBER]
Priority: P1  
Agent_Type: Accessibility + Frontend
Test_Environment: Multi-language testing
Prerequisites:
  - Application with Arabic, French, English support
  - Translated content available

Language_Switch_Tests:
  1. Switch from English to Arabic
  2. Switch from English to French
  3. Switch from Arabic to French
  4. Verify layout changes (LTR/RTL)
  5. Test content translation completeness
  6. Validate UI element translations
  7. Check URL structure changes
  8. Test language persistence

Translation_Validation:
  - All text elements translated
  - Cultural appropriateness
  - Business term accuracy
  - Date/number formatting
  - Currency display

State_Preservation:
  - Cart contents maintained
  - User session preserved
  - Form data retention
  - Navigation state consistency

Performance_Impact:
  - Language switch speed < 1s
  - Layout reflow optimization
  - Font loading optimization
  - No content flash
```

## 6. PWA Features Test Templates

### PWA Installation Template
```yaml
Test_ID: PERF-PWA-INSTALL-[NUMBER]
Priority: P1
Agent_Type: Performance Specialist
Test_Environment: Mobile devices (iOS/Android), PWA-capable browsers
Prerequisites:
  - PWA manifest configured
  - Service worker registered
  - HTTPS enabled

PWA_Installation_Tests:
  1. Visit application on mobile device
  2. Verify install prompt appears
  3. Complete installation process
  4. Launch installed PWA
  5. Verify app icon and splash screen
  6. Test PWA uninstallation
  7. Reinstallation process
  8. Update handling

Installation_Validation:
  - Prompt appears at appropriate time
  - Installation completes successfully
  - App appears in device app drawer
  - Icon and name display correctly
  - Splash screen shows properly

PWA_Behavior:
  - Standalone display mode
  - Navigation bar customization
  - Theme color application
  - Status bar styling
  - Orientation handling

Manifest_Validation:
  - Required fields present
  - Icon formats and sizes
  - Shortcut definitions
  - Category classification
  - Protocol handlers
```

### Offline Functionality Template
```yaml
Test_ID: PERF-PWA-OFFLINE-[NUMBER]
Priority: P1
Agent_Type: Performance Specialist + QA
Test_Environment: Network simulation (online/offline/slow)
Prerequisites:
  - PWA installed and service worker active
  - Initial app data cached
  - Network simulation tools available

Offline_Feature_Tests:
  1. Use app while online (cache priming)
  2. Disable network connection
  3. Navigate through cached pages
  4. Attempt to add items to cart
  5. Try to place order offline
  6. Re-enable network connection
  7. Verify data synchronization
  8. Test background sync

Offline_Capabilities:
  - View previously loaded products
  - Browse cached categories
  - Modify cart offline
  - Queue orders for sync
  - Show offline indicators

Sync_Validation:
  - Background sync when online
  - Conflict resolution
  - Data integrity maintenance
  - User notification on sync
  - Error handling for failed sync

Cache_Strategy:
  - Critical resource caching
  - Dynamic content caching
  - Cache invalidation
  - Storage quota management
  - Cache version control
```

## 7. Performance Test Templates

### Core Web Vitals Template
```yaml
Test_ID: PERF-VITALS-[NUMBER]
Priority: P1
Agent_Type: Performance Specialist
Test_Environment: Various network conditions (WiFi, 3G, Slow 3G)
Prerequisites:
  - Lighthouse CI configured
  - WebPageTest account
  - Performance monitoring tools

Core_Web_Vitals_Tests:
  1. Measure Largest Contentful Paint (LCP)
  2. Measure First Input Delay (FID)
  3. Measure Cumulative Layout Shift (CLS)
  4. Test across different pages
  5. Measure on various devices
  6. Monitor real user metrics
  7. Performance regression testing

Performance_Targets:
  - LCP: < 2.5 seconds (good)
  - FID: < 100 milliseconds (good)
  - CLS: < 0.1 (good)
  - Time to First Byte: < 800ms
  - First Contentful Paint: < 1.8s

Testing_Conditions:
  - Mobile devices (mid-range, low-end)
  - Network throttling (3G, Slow 3G)
  - Cache states (cold, warm, hot)
  - Different user journeys

Optimization_Areas:
  - Image optimization and lazy loading
  - JavaScript bundle optimization
  - CSS critical path optimization
  - Font loading optimization
  - Third-party script impact
```

### Mobile Performance Template
```yaml
Test_ID: PERF-MOBILE-[NUMBER]
Priority: P1
Agent_Type: Performance Specialist
Test_Environment: Physical mobile devices, various specs
Prerequisites:
  - Device lab access
  - Performance profiling tools
  - Battery monitoring capabilities

Mobile_Performance_Tests:
  1. Test on high-end devices
  2. Test on mid-range devices
  3. Test on low-end devices
  4. Monitor battery consumption
  5. Test memory usage patterns
  6. Validate scroll performance
  7. Check animation smoothness
  8. Touch response time measurement

Device_Categories:
  - High-end: iPhone 13+, Galaxy S21+
  - Mid-range: iPhone SE, Galaxy A series
  - Low-end: Budget Android devices

Performance_Metrics:
  - JavaScript execution time
  - Memory usage and garbage collection
  - Battery drain measurement
  - Touch to paint time
  - Scroll janks and frame drops

Mobile_Specific_Optimizations:
  - Touch delay optimization
  - Scroll performance
  - Image format optimization
  - Connection type adaptation
  - CPU usage optimization
```

## 8. Accessibility Test Templates

### WCAG Compliance Template
```yaml
Test_ID: A11Y-WCAG-[NUMBER]
Priority: P1
Agent_Type: Accessibility Specialist
Test_Environment: Screen readers (NVDA, JAWS, VoiceOver), keyboard-only
Prerequisites:
  - Screen reader software installed
  - Accessibility testing tools (aXe, WAVE)
  - Keyboard testing environment

WCAG_Compliance_Tests:
  1. Automated accessibility scan
  2. Manual keyboard navigation
  3. Screen reader testing
  4. Color contrast validation
  5. Focus management testing
  6. Alternative text validation
  7. Form accessibility testing
  8. Error message accessibility

WCAG_2.1_AA_Requirements:
  - Perceivable: Alt text, captions, color contrast
  - Operable: Keyboard accessible, no seizure triggers
  - Understandable: Clear language, predictable
  - Robust: Compatible with assistive technologies

Screen_Reader_Tests:
  - Page structure navigation
  - Link and button announcements
  - Form field labels and instructions
  - Error message communication
  - Status update announcements

Keyboard_Navigation:
  - Tab order logical and complete
  - All interactive elements reachable
  - Skip links functional
  - Focus indicators visible
  - Modal trap focus properly
```

### Arabic RTL Accessibility Template
```yaml
Test_ID: A11Y-RTL-ACCESS-[NUMBER]
Priority: P1
Agent_Type: Accessibility Specialist
Test_Environment: Arabic screen readers, RTL keyboard navigation
Prerequisites:
  - Arabic language screen reader
  - RTL keyboard navigation setup
  - Arabic content test data

RTL_Accessibility_Tests:
  1. Arabic screen reader navigation
  2. RTL keyboard tab order
  3. Arabic text reading flow
  4. Form navigation in RTL
  5. Error message placement RTL
  6. Focus indicators in RTL
  7. Modal behavior in RTL
  8. Skip links RTL functionality

Arabic_Specific_Validation:
  - Proper Arabic text pronunciation
  - Correct reading order
  - Form error association
  - Button and link identification
  - Navigation landmark identification

Cultural_Accessibility:
  - Culturally appropriate error messages
  - Local accessibility conventions
  - Arabic language support quality
  - Regional assistive technology compatibility
```

## 9. Security Test Templates

### Input Validation Template
```yaml
Test_ID: SEC-INPUT-[NUMBER]
Priority: P0
Agent_Type: Security Specialist
Test_Environment: Manual and automated security testing
Prerequisites:
  - Security testing tools configured
  - Input fuzzing data sets
  - Vulnerability scanners ready

Input_Validation_Tests:
  1. SQL injection attempts
  2. XSS payload injection
  3. Command injection testing
  4. File upload validation
  5. JSON/XML parsing security
  6. Special character handling
  7. Unicode attack vectors
  8. Buffer overflow attempts

Security_Test_Cases:
  - Login form injection tests
  - Search query malicious payloads
  - Profile update field validation
  - Product review content filtering
  - Cart quantity manipulation
  - Order notes security validation

Expected_Security_Behavior:
  - All malicious inputs safely rejected
  - No system information leakage
  - Proper error message display
  - Input sanitization effective
  - Output encoding applied

Vulnerability_Categories:
  - OWASP Top 10 coverage
  - Input validation flaws
  - Authentication bypasses
  - Authorization vulnerabilities
  - Information disclosure
```

### API Security Template
```yaml
Test_ID: SEC-API-[NUMBER]
Priority: P0
Agent_Type: Security Specialist
Test_Environment: API testing tools (Burp Suite, OWASP ZAP)
Prerequisites:
  - API documentation
  - Authentication tokens
  - API testing tools configured

API_Security_Tests:
  1. Authentication bypass attempts
  2. Authorization boundary testing
  3. Rate limiting validation
  4. Input parameter manipulation
  5. HTTP method testing
  6. CORS configuration validation
  7. Error message information leakage
  8. Token security validation

API_Endpoints_Testing:
  - /api/auth/login security
  - /api/products access control
  - /api/cart authorization
  - /api/orders data protection
  - /api/profile privilege escalation

Security_Validations:
  - Proper authentication required
  - Role-based access control
  - Input validation on all parameters
  - Sensitive data protection
  - Secure error handling

Rate_Limiting_Tests:
  - API call frequency limits
  - Account lockout mechanisms
  - DDoS protection validation
  - Resource consumption limits
```

## Template Usage Guidelines

### Template Selection Criteria
1. **By Agent Type**: Choose templates matching your specialization
2. **By Priority**: Start with P0 (Critical) tests first
3. **By Dependency**: Follow prerequisite chains
4. **By Risk Level**: Focus on high-risk areas early

### Template Customization
1. **Adapt Test Data**: Use relevant data for your testing context
2. **Modify Environment**: Adjust for available tools and infrastructure
3. **Scale Complexity**: Adjust based on feature maturity
4. **Add Context**: Include project-specific requirements

### Quality Assurance
1. **Peer Review**: Have templates reviewed by other agents
2. **Execution Validation**: Test template effectiveness
3. **Continuous Improvement**: Update based on lessons learned
4. **Documentation**: Maintain change history and rationale

These templates provide the foundation for comprehensive, consistent testing while allowing for customization based on specific needs and contexts.