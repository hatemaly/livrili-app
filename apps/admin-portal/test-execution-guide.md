# Admin Portal Test Execution Guide

## Overview
This guide provides comprehensive instructions for running and maintaining the admin portal test suite.

## Current Test Status
- **Target Pass Rate**: 95%+ (22/23 tests minimum)
- **Test Infrastructure**: Playwright with comprehensive helper utilities
- **Authentication**: Session-based with automatic login/logout handling
- **Database**: Test data fixtures with cleanup procedures

## Test Categories

### 1. Authentication Tests (`01-authentication.spec.ts`)
- Login form validation
- Credential validation
- Successful login and redirect
- Logout functionality
- Error handling

### 2. Navigation Tests (`02-navigation.spec.ts`)
- Main navigation menu display
- Page navigation functionality
- User menu and profile options
- Mobile responsive navigation
- Browser back/forward handling

### 3. Dashboard Tests (`03-dashboard.spec.ts`)
- Dashboard page content
- Key metrics and statistics
- Activity sections and quick actions
- Responsive layout
- Chart/visualization loading
- Keyboard accessibility

### 4. Products Management Tests (`04-products.spec.ts`)
- Products page display
- Product list/table functionality
- Create product functionality
- Search and filtering
- Product actions (edit, delete, view)
- Responsive design

### 5. Categories Management Tests (`05-categories.spec.ts`)
- Categories page display
- Category list/tree view
- Create category functionality
- Category hierarchy handling
- Search functionality
- Bulk operations

### 6. Orders Management Tests (`06-orders.spec.ts`)
- Orders page display
- Orders list functionality
- Order information display
- Status filtering
- Search functionality
- Order actions

### 7. Session Persistence Tests (`07-session-persistence.spec.ts`)
- Session maintenance after refresh
- Session in new tabs
- Session expiration handling
- Navigation state persistence
- Browser history navigation
- Form data persistence

## Running Tests

### Prerequisites
```bash
# Install dependencies (from admin-portal directory)
npm install

# Ensure admin portal is running
npm run dev
# Server will start on http://localhost:3001
```

### Environment Setup
Ensure these environment variables are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Test Execution Commands

#### Run All Tests
```bash
npm run test
```

#### Run Tests with Browser UI
```bash
npm run test:headed
```

#### Run Interactive Test UI
```bash
npm run test:ui
```

#### Debug Tests
```bash
npm run test:debug
```

#### View Test Report
```bash
npm run test:report
```

#### Run Specific Test File
```bash
npx playwright test tests/01-authentication.spec.ts
```

#### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration Features

### Robust Selector Strategy
Tests use multiple fallback selectors to handle UI variations:
```typescript
const elementExists = await helpers.elementExists('[data-testid="primary"]') ||
                     await helpers.elementExists('.fallback-class') ||
                     await helpers.elementExists('generic-tag');
```

### Enhanced Timeout Handling
- **CI Environment**: Extended timeouts (30-60s) for slower environments
- **Local Development**: Standard timeouts (15-30s)
- **Dynamic Adjustment**: Automatic timeout scaling based on environment

### Loading State Management
```typescript
await helpers.waitForLoadingComplete();
```
Handles:
- Loading spinners and indicators
- Network idle states
- Dynamic content loading

### Authentication State Management
- Automatic login for authenticated tests
- Session persistence across tests
- Cleanup and reset procedures

## Troubleshooting

### Common Issues and Solutions

#### Test Timeouts
```bash
# Increase timeout for specific test
npx playwright test --timeout=60000
```

#### Element Not Found
- Check if element selectors match actual UI
- Verify loading states are properly handled
- Ensure test data exists in database

#### Authentication Failures
```bash
# Clear stored authentication
rm -rf playwright/.auth/
```

#### Database Issues
- Ensure Supabase is accessible
- Verify test data creation scripts
- Check database permissions

### Debugging Strategies

#### Visual Debugging
```bash
npm run test:headed --debug
```

#### Screenshot on Failure
Screenshots are automatically captured in `test-results/`

#### Video Recording
Test videos are recorded on failure in `test-results/`

#### Network Monitoring
Use Playwright trace viewer:
```bash
npx playwright show-trace test-results/trace.zip
```

## Maintenance

### Regular Maintenance Tasks

#### Update Test Data
```typescript
// In tests/database-setup.ts
await dbSetup.setupAllTestData();
```

#### Selector Updates
When UI changes, update selectors in test files:
```typescript
// Add new selector as primary, keep old as fallback
const newSelectors = [
  '[data-testid="new-selector"]',  // New primary
  '.old-selector',                 // Fallback
  'legacy-selector'                // Legacy fallback
];
```

#### Performance Monitoring
Monitor test execution times and optimize:
- Use `page.waitForLoadState('networkidle')`
- Implement proper wait strategies
- Minimize unnecessary delays

### Adding New Tests

#### Test File Structure
```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './test-helpers';

test.describe('New Feature Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page, context }) => {
    helpers = new TestHelpers(page);
    // Authentication setup
    // Navigation to feature
  });

  test('should test specific functionality', async ({ page }) => {
    // Test implementation with fallback selectors
    // Assertions with proper error handling
  });
});
```

## Performance Benchmarks

### Target Metrics
- **Total Execution Time**: < 5 minutes for full suite
- **Individual Test**: < 30 seconds average
- **Authentication Setup**: < 10 seconds
- **Page Navigation**: < 5 seconds

### Optimization Tips
1. Use parallel execution where possible
2. Implement proper cleanup procedures
3. Minimize unnecessary waits
4. Cache authentication states
5. Use efficient selectors

## Continuous Integration

### CI Configuration
Tests are configured for CI environments with:
- Extended timeouts
- Retry mechanisms
- Comprehensive reporting
- Artifact collection (screenshots, videos, traces)

### Environment Variables for CI
```env
CI=true
PLAYWRIGHT_WORKERS=1
PLAYWRIGHT_RETRIES=2
```

## Reporting

### HTML Report
Generated automatically at `playwright-report/index.html`

### JSON Results
Detailed results in `test-results/results.json`

### Test Metrics
- Pass/fail rates
- Execution times
- Error categorization
- Browser compatibility

## Support

### Getting Help
1. Check test execution logs
2. Review Playwright documentation
3. Examine test helper utilities
4. Use debug mode for investigation

### Best Practices
1. Write descriptive test names
2. Use data-testid attributes for stable selectors
3. Implement proper cleanup procedures
4. Handle loading states consistently
5. Use meaningful assertions with good error messages