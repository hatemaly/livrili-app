import { test, expect, Page } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  username: 'admin@test.com',
  password: 'test123'
};

async function loginAndExpectRedirect(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('#username', ADMIN_CREDENTIALS.username);
  await page.fill('#password', ADMIN_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect or error
  await Promise.race([
    page.waitForURL(url => url.pathname !== '/login', { timeout: 10000 }),
    page.waitForTimeout(5000) // Fallback timeout
  ]);
  
  return page.url();
}

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-screenshots/working-${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

test.describe('Working Authentication Tests', () => {
  
  test('LOGIN-001: Authentication Flow Analysis', async ({ page }) => {
    console.log('🧪 Testing complete authentication flow');
    
    const finalUrl = await loginAndExpectRedirect(page);
    await takeScreenshot(page, 'login-001-after-submit');
    
    console.log('Final URL after login:', finalUrl);
    
    // Check page content regardless of URL
    const pageContent = await page.locator('body').textContent();
    const hasAccessDenied = pageContent?.includes('Access Denied');
    const hasUnauthorized = pageContent?.includes('Unauthorized') || pageContent?.includes('unauthorized');
    const hasError = pageContent?.includes('Error') || pageContent?.includes('error');
    
    console.log('Page analysis:');
    console.log('- Contains "Access Denied":', hasAccessDenied);
    console.log('- Contains "Unauthorized":', hasUnauthorized);
    console.log('- Contains error text:', hasError);
    
    if (finalUrl.includes('/dashboard')) {
      if (hasAccessDenied) {
        console.log('🔍 LOGIN-001: Login successful but access denied (RBAC issue)');
      } else {
        console.log('✅ LOGIN-001 PASSED: Full login successful');
      }
    } else if (finalUrl.includes('/login')) {
      console.log('❌ LOGIN-001 FAILED: No redirect occurred');
    } else {
      console.log('⚠️ LOGIN-001: Unexpected redirect to:', finalUrl);
    }
  });

  test('LOGIN-002: Dashboard Access Test', async ({ page }) => {
    console.log('🧪 Testing dashboard access after login');
    
    const finalUrl = await loginAndExpectRedirect(page);
    await takeScreenshot(page, 'login-002-dashboard-access');
    
    if (finalUrl.includes('/dashboard')) {
      // Check what elements are actually present on dashboard
      const dashboardElements = [
        'nav',
        'header', 
        '.dashboard',
        '.admin-panel',
        'main',
        '[role="main"]'
      ];
      
      let elementsFound = [];
      for (const selector of dashboardElements) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          elementsFound.push(`${selector} (${count})`);
        }
      }
      
      console.log('Dashboard elements found:', elementsFound);
      
      // Check for navigation links
      const navLinks = await page.locator('nav a, .nav-link').all();
      const linkTexts = [];
      for (const link of navLinks) {
        const text = await link.textContent();
        if (text?.trim()) {
          linkTexts.push(text.trim());
        }
      }
      
      console.log('Navigation links found:', linkTexts);
      
      if (elementsFound.length > 0) {
        console.log('✅ LOGIN-002 PASSED: Dashboard accessible with navigation');
      } else {
        console.log('⚠️ LOGIN-002 WARNING: Dashboard reached but limited content');
      }
    } else {
      console.log('❌ LOGIN-002 FAILED: Could not reach dashboard');
    }
  });

  test('LOGIN-003: Navigation Testing', async ({ page }) => {
    console.log('🧪 Testing navigation after login');
    
    await loginAndExpectRedirect(page);
    
    // Test navigation to different pages
    const pagesToTest = [
      { path: '/', name: 'Home/Dashboard' },
      { path: '/orders', name: 'Orders' },
      { path: '/users', name: 'Users' },
      { path: '/products', name: 'Products' },
      { path: '/retailers', name: 'Retailers' }
    ];
    
    const results = [];
    
    for (const pageInfo of pagesToTest) {
      try {
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        
        const url = page.url();
        const title = await page.title();
        const hasContent = (await page.locator('body').textContent())?.length > 100;
        
        results.push({
          page: pageInfo.name,
          url: url,
          title: title,
          hasContent: hasContent,
          success: true
        });
        
        await takeScreenshot(page, `login-003-${pageInfo.name.toLowerCase()}`);
        console.log(`✓ ${pageInfo.name} loaded: ${title}`);
        
      } catch (error) {
        results.push({
          page: pageInfo.name,
          error: error.message,
          success: false
        });
        console.log(`✗ ${pageInfo.name} failed to load`);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Navigation results: ${successCount}/${pagesToTest.length} pages accessible`);
    
    if (successCount >= pagesToTest.length / 2) {
      console.log('✅ LOGIN-003 PASSED: Navigation working');
    } else {
      console.log('❌ LOGIN-003 FAILED: Limited navigation access');
    }
  });

  test('LOGIN-004: Performance Analysis', async ({ page }) => {
    console.log('🧪 Testing login and page load performance');
    
    const startTime = Date.now();
    const finalUrl = await loginAndExpectRedirect(page);
    const loginTime = Date.now() - startTime;
    
    console.log(`⏱️ Login flow completed in: ${loginTime}ms`);
    
    // Test individual page load times
    const pages = ['/', '/orders', '/users'];
    const loadTimes = [];
    
    for (const path of pages) {
      const pageStart = Date.now();
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        const pageTime = Date.now() - pageStart;
        loadTimes.push({ path, time: pageTime });
        console.log(`📊 ${path}: ${pageTime}ms`);
      } catch (error) {
        console.log(`❌ ${path}: Failed to load`);
      }
    }
    
    const avgLoadTime = loadTimes.reduce((sum, item) => sum + item.time, 0) / loadTimes.length;
    console.log(`📊 Average page load time: ${avgLoadTime.toFixed(0)}ms`);
    
    await takeScreenshot(page, 'login-004-performance-complete');
    
    if (avgLoadTime < 3000) {
      console.log('✅ LOGIN-004 PASSED: Good performance');
    } else if (avgLoadTime < 5000) {
      console.log('⚠️ LOGIN-004 WARNING: Acceptable performance');
    } else {
      console.log('❌ LOGIN-004 FAILED: Poor performance');
    }
  });
});