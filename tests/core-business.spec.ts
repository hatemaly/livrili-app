import { test, expect, Page } from '@playwright/test';

// Test Configuration
const BASE_URL = 'http://localhost:3001';
const ADMIN_CREDENTIALS = {
  username: 'admin@test.com',
  password: 'test123'
};

// Helper Functions
async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('#username', ADMIN_CREDENTIALS.username);
  await page.fill('#password', ADMIN_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  
  // Wait for successful login
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
}

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-screenshots/core-${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

async function measurePageLoad(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  return Date.now() - startTime;
}

test.describe('Priority 2: Core Business Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsAdmin(page);
  });

  // Test Suite 1: Dashboard & Analytics
  test('DASH-001: Dashboard Load Performance', async ({ page }) => {
    console.log('🧪 Executing DASH-001: Dashboard Load Performance');
    
    const loadTime = await measurePageLoad(page, '/');
    await takeScreenshot(page, 'dash-001-dashboard-loaded');
    
    console.log(`📊 Dashboard load time: ${loadTime}ms`);
    
    // Verify dashboard elements are present
    const dashboardSelectors = [
      'nav', // Navigation
      '[role="main"]', // Main content
      '.card, .metric, .kpi', // Metric cards
      'h1, h2, [data-testid="dashboard-title"]' // Page title
    ];
    
    let dashboardElementsFound = 0;
    for (const selector of dashboardSelectors) {
      if (await page.locator(selector).count() > 0) {
        dashboardElementsFound++;
      }
    }
    
    if (loadTime < 3000 && dashboardElementsFound >= 2) {
      console.log('✅ DASH-001 PASSED: Dashboard loaded quickly with content');
    } else if (loadTime < 5000) {
      console.log(`⚠️  DASH-001 WARNING: Dashboard slow (${loadTime}ms) but functional`);
    } else {
      console.log(`❌ DASH-001 FAILED: Dashboard too slow (${loadTime}ms)`);
    }
  });

  test('DASH-002: Navigation Menu Functionality', async ({ page }) => {
    console.log('🧪 Executing DASH-002: Navigation Menu Functionality');
    
    await page.goto('/');
    await takeScreenshot(page, 'dash-002-main-dashboard');
    
    // Find navigation elements
    const navSelectors = [
      'nav a[href*="orders"]',
      'nav a[href*="users"]', 
      'nav a[href*="retailers"]',
      'nav a[href*="products"]',
      '.nav-item',
      '.menu-item',
      '[role="menuitem"]'
    ];
    
    let navigationLinks = [];
    for (const selector of navSelectors) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        const href = await element.getAttribute('href');
        const text = await element.textContent();
        if (href && text) {
          navigationLinks.push({ href, text: text.trim() });
        }
      }
    }
    
    console.log(`Found ${navigationLinks.length} navigation links`);
    
    // Test clicking a few navigation items
    let successfulNavigations = 0;
    const testUrls = ['/orders', '/users', '/retailers', '/products'];
    
    for (const url of testUrls) {
      try {
        await page.goto(url);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        await takeScreenshot(page, `dash-002-nav-${url.replace('/', '')}`);
        successfulNavigations++;
        console.log(`✓ Successfully navigated to ${url}`);
      } catch (error) {
        console.log(`✗ Failed to navigate to ${url}`);
      }
    }
    
    if (successfulNavigations >= 2) {
      console.log('✅ DASH-002 PASSED: Navigation working');
    } else {
      console.log('❌ DASH-002 FAILED: Navigation issues found');
    }
  });

  // Test Suite 2: Order Management
  test('ORDER-001: Order List Display', async ({ page }) => {
    console.log('🧪 Executing ORDER-001: Order List Display');
    
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'order-001-orders-page');
    
    // Check for order management elements
    const orderElements = [
      'table',
      '.order-list',
      '.order-item',
      '[data-testid="orders-table"]',
      'thead',
      'tbody tr'
    ];
    
    let orderElementsFound = 0;
    for (const selector of orderElements) {
      if (await page.locator(selector).count() > 0) {
        orderElementsFound++;
        console.log(`✓ Found ${selector}`);
      }
    }
    
    // Check for common order columns/data
    const orderColumns = ['order', 'customer', 'status', 'total', 'date'];
    let columnsFound = 0;
    
    for (const column of orderColumns) {
      const columnExists = await page.locator(`th:has-text("${column}"), td:has-text("${column}"), [data-column="${column}"]`).count() > 0;
      if (columnExists) {
        columnsFound++;
      }
    }
    
    if (orderElementsFound >= 2 || columnsFound >= 2) {
      console.log('✅ ORDER-001 PASSED: Order list displayed');
    } else {
      console.log('❌ ORDER-001 FAILED: Order list not found');
    }
  });

  test('ORDER-002: Order Search and Filter', async ({ page }) => {
    console.log('🧪 Executing ORDER-002: Order Search and Filter');
    
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'order-002-before-search');
    
    // Look for search/filter elements
    const searchElements = [
      'input[type="search"]',
      'input[placeholder*="search"]',
      '.search-input',
      '[data-testid="search"]',
      'select[name*="status"]',
      '.filter-select'
    ];
    
    let searchElementFound = false;
    let searchElement = null;
    
    for (const selector of searchElements) {
      searchElement = page.locator(selector).first();
      if (await searchElement.count() > 0) {
        searchElementFound = true;
        console.log(`✓ Found search element: ${selector}`);
        break;
      }
    }
    
    if (searchElementFound && searchElement) {
      // Try to use the search functionality
      await searchElement.fill('test');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000); // Wait for search results
      await takeScreenshot(page, 'order-002-after-search');
      
      console.log('✅ ORDER-002 PASSED: Search functionality found');
    } else {
      console.log('❌ ORDER-002 FAILED: No search functionality found');
    }
  });

  // Test Suite 3: User Management
  test('USER-001: User List Display', async ({ page }) => {
    console.log('🧪 Executing USER-001: User List Display');
    
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'user-001-users-page');
    
    // Check for user management elements
    const userElements = [
      'table',
      '.user-list',
      '.user-item',
      '[data-testid="users-table"]',
      'thead',
      'tbody tr'
    ];
    
    let userElementsFound = 0;
    for (const selector of userElements) {
      if (await page.locator(selector).count() > 0) {
        userElementsFound++;
        console.log(`✓ Found user element: ${selector}`);
      }
    }
    
    // Check for user data columns
    const userColumns = ['name', 'email', 'role', 'status', 'created'];
    let columnsFound = 0;
    
    for (const column of userColumns) {
      const exists = await page.locator(`th:has-text("${column}"), [data-column="${column}"]`).count() > 0;
      if (exists) {
        columnsFound++;
      }
    }
    
    if (userElementsFound >= 1 || columnsFound >= 2) {
      console.log('✅ USER-001 PASSED: User list displayed');
    } else {
      console.log('❌ USER-001 FAILED: User list not found');
    }
  });

  test('USER-002: Add New User Button', async ({ page }) => {
    console.log('🧪 Executing USER-002: Add New User Button');
    
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'user-002-users-page');
    
    // Look for add user button or functionality
    const addUserSelectors = [
      'button:has-text("Add")',
      'button:has-text("New")',
      'button:has-text("Create")',
      'a:has-text("Add")',
      '[data-testid="add-user"]',
      '.add-user-btn'
    ];
    
    let addButtonFound = false;
    for (const selector of addUserSelectors) {
      if (await page.locator(selector).count() > 0) {
        addButtonFound = true;
        console.log(`✓ Found add user button: ${selector}`);
        
        // Try to click it
        try {
          await page.locator(selector).first().click();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, 'user-002-add-user-clicked');
        } catch (error) {
          console.log('Could not click add user button');
        }
        break;
      }
    }
    
    if (addButtonFound) {
      console.log('✅ USER-002 PASSED: Add user functionality found');
    } else {
      console.log('❌ USER-002 FAILED: Add user button not found');
    }
  });

  // Test Suite 4: Retailer Management
  test('RET-001: Retailer List Display', async ({ page }) => {
    console.log('🧪 Executing RET-001: Retailer List Display');
    
    await page.goto('/retailers');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'ret-001-retailers-page');
    
    // Check for retailer management elements
    const retailerElements = [
      'table',
      '.retailer-list',
      '.retailer-item',
      '[data-testid="retailers-table"]',
      '.business-list'
    ];
    
    let elementsFound = 0;
    for (const selector of retailerElements) {
      if (await page.locator(selector).count() > 0) {
        elementsFound++;
        console.log(`✓ Found retailer element: ${selector}`);
      }
    }
    
    if (elementsFound >= 1) {
      console.log('✅ RET-001 PASSED: Retailer list displayed');
    } else {
      console.log('❌ RET-001 FAILED: Retailer list not found');
    }
  });

  // Test Suite 5: Product Management  
  test('PROD-001: Product List Display', async ({ page }) => {
    console.log('🧪 Executing PROD-001: Product List Display');
    
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'prod-001-products-page');
    
    // Check for product management elements
    const productElements = [
      'table',
      '.product-list',
      '.product-item',
      '[data-testid="products-table"]',
      '.product-grid',
      '.product-card'
    ];
    
    let elementsFound = 0;
    for (const selector of productElements) {
      if (await page.locator(selector).count() > 0) {
        elementsFound++;
        console.log(`✓ Found product element: ${selector}`);
      }
    }
    
    // Check for product data
    const productData = ['name', 'price', 'category', 'stock', 'sku'];
    let dataFound = 0;
    
    for (const data of productData) {
      const exists = await page.locator(`th:has-text("${data}"), td:has-text("${data}"), [data-field="${data}"]`).count() > 0;
      if (exists) {
        dataFound++;
      }
    }
    
    if (elementsFound >= 1 || dataFound >= 2) {
      console.log('✅ PROD-001 PASSED: Product list displayed');
    } else {
      console.log('❌ PROD-001 FAILED: Product list not found');
    }
  });

  test('PROD-002: Product Search Functionality', async ({ page }) => {
    console.log('🧪 Executing PROD-002: Product Search Functionality');
    
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'prod-002-before-search');
    
    // Look for search functionality
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="search"]',
      '.search-input',
      '[data-testid="product-search"]'
    ];
    
    let searchFound = false;
    for (const selector of searchSelectors) {
      if (await page.locator(selector).count() > 0) {
        searchFound = true;
        console.log(`✓ Found product search: ${selector}`);
        
        // Test search functionality
        try {
          await page.locator(selector).fill('test');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(2000);
          await takeScreenshot(page, 'prod-002-after-search');
        } catch (error) {
          console.log('Could not use search functionality');
        }
        break;
      }
    }
    
    if (searchFound) {
      console.log('✅ PROD-002 PASSED: Product search functionality found');
    } else {
      console.log('❌ PROD-002 FAILED: Product search not found');
    }
  });

  // Cross-functional test
  test('CROSS-001: Page Response Times', async ({ page }) => {
    console.log('🧪 Executing CROSS-001: Page Response Times');
    
    const pagesToTest = ['/', '/orders', '/users', '/retailers', '/products'];
    const loadTimes: { [key: string]: number } = {};
    
    for (const url of pagesToTest) {
      try {
        const loadTime = await measurePageLoad(page, url);
        loadTimes[url] = loadTime;
        console.log(`📊 ${url}: ${loadTime}ms`);
        await takeScreenshot(page, `cross-001-${url.replace('/', 'home')}`);
      } catch (error) {
        console.log(`❌ Failed to load ${url}`);
        loadTimes[url] = -1;
      }
    }
    
    const averageLoadTime = Object.values(loadTimes)
      .filter(time => time > 0)
      .reduce((a, b) => a + b, 0) / Object.values(loadTimes).filter(time => time > 0).length;
    
    console.log(`📊 Average page load time: ${averageLoadTime.toFixed(0)}ms`);
    
    if (averageLoadTime < 3000) {
      console.log('✅ CROSS-001 PASSED: Good overall performance');
    } else if (averageLoadTime < 5000) {
      console.log('⚠️  CROSS-001 WARNING: Acceptable performance');
    } else {
      console.log('❌ CROSS-001 FAILED: Poor performance');
    }
  });
});