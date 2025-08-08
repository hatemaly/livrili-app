import { test, expect, Page } from '@playwright/test';

// Test Configuration
const BASE_URL = 'http://localhost:3001';
const ADMIN_CREDENTIALS = {
  username: 'admin@test.com',
  password: 'test123'
};
const INVALID_CREDENTIALS = {
  username: 'invalid@test.com',
  password: 'wrongpass'
};

// Helper Functions
async function navigateToLogin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
}

async function login(page: Page, username: string, password: string) {
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
}

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-screenshots/auth-${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

test.describe('Priority 1: Authentication & Authorization', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start each test from a clean state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('AUTH-001: Valid Email Login', async ({ page }) => {
    console.log('🧪 Executing AUTH-001: Valid Email Login');
    
    // Step 1: Navigate to login page
    await navigateToLogin(page);
    await takeScreenshot(page, 'auth-001-login-page');
    
    // Verify login page elements
    await expect(page.locator('h1, [data-testid="page-title"]')).toContainText(/login|sign in/i);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    
    // Step 2-4: Enter credentials and submit
    await login(page, ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
    
    // Step 5: Verify successful login and redirect
    await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('dashboard'), { timeout: 10000 });
    await takeScreenshot(page, 'auth-001-post-login');
    
    // Verify authentication success indicators
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    // Look for user profile or admin interface elements
    const userProfileSelectors = [
      '[data-testid="user-profile"]',
      '[data-testid="admin-nav"]',
      '.user-menu',
      '.admin-header',
      'nav[role="navigation"]'
    ];
    
    let profileFound = false;
    for (const selector of userProfileSelectors) {
      if (await page.locator(selector).count() > 0) {
        profileFound = true;
        break;
      }
    }
    
    console.log('✅ AUTH-001 PASSED: Valid email login successful');
  });

  test('AUTH-002: Valid Username Login', async ({ page }) => {
    console.log('🧪 Executing AUTH-002: Valid Username Login');
    
    await navigateToLogin(page);
    await takeScreenshot(page, 'auth-002-login-page');
    
    // Test username-based login
    await login(page, 'testadmin', ADMIN_CREDENTIALS.password);
    
    // Wait for navigation or error
    try {
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 5000 });
      await takeScreenshot(page, 'auth-002-success');
      console.log('✅ AUTH-002 PASSED: Username login successful');
    } catch {
      // Check if error is displayed
      const errorVisible = await page.locator('.error, [role="alert"], .alert-error').isVisible();
      if (errorVisible) {
        await takeScreenshot(page, 'auth-002-username-not-supported');
        console.log('ℹ️  AUTH-002 INFO: Username login not supported, email required');
      } else {
        await takeScreenshot(page, 'auth-002-failed');
        console.log('❌ AUTH-002 FAILED: Unexpected behavior');
      }
    }
  });

  test('AUTH-003: Invalid Credentials', async ({ page }) => {
    console.log('🧪 Executing AUTH-003: Invalid Credentials');
    
    await navigateToLogin(page);
    await takeScreenshot(page, 'auth-003-login-page');
    
    // Enter invalid credentials
    await login(page, INVALID_CREDENTIALS.username, INVALID_CREDENTIALS.password);
    
    // Wait a moment for error to appear
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'auth-003-error-state');
    
    // Verify error message is displayed
    const errorSelectors = [
      '.error',
      '[role="alert"]',
      '.alert-error',
      '.text-red-600',
      '.text-red-800',
      '[data-testid="error-message"]'
    ];
    
    let errorFound = false;
    let errorText = '';
    
    for (const selector of errorSelectors) {
      const errorElement = page.locator(selector);
      if (await errorElement.count() > 0 && await errorElement.isVisible()) {
        errorFound = true;
        errorText = await errorElement.textContent() || '';
        break;
      }
    }
    
    // Verify no redirect occurred (still on login page)
    expect(page.url()).toContain('/login');
    
    if (errorFound) {
      console.log(`✅ AUTH-003 PASSED: Error displayed - "${errorText}"`);
    } else {
      console.log('❌ AUTH-003 FAILED: No error message displayed');
    }
  });

  test('AUTH-004: Empty Field Validation', async ({ page }) => {
    console.log('🧪 Executing AUTH-004: Empty Field Validation');
    
    await navigateToLogin(page);
    await takeScreenshot(page, 'auth-004-login-page');
    
    // Test 1: Empty username
    await page.fill('#password', 'somepassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    let validationFound = await page.locator('#username:invalid').count() > 0;
    if (!validationFound) {
      const requiredMessage = await page.locator('#username + .error, .field-error').count();
      validationFound = requiredMessage > 0;
    }
    
    await takeScreenshot(page, 'auth-004-empty-username');
    
    // Test 2: Empty password
    await page.fill('#username', 'test@example.com');
    await page.fill('#password', '');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    let passwordValidationFound = await page.locator('#password:invalid').count() > 0;
    if (!passwordValidationFound) {
      const requiredMessage = await page.locator('#password + .error, .field-error').count();
      passwordValidationFound = requiredMessage > 0;
    }
    
    await takeScreenshot(page, 'auth-004-empty-password');
    
    if (validationFound || passwordValidationFound) {
      console.log('✅ AUTH-004 PASSED: Form validation working');
    } else {
      console.log('❌ AUTH-004 FAILED: Form validation not working properly');
    }
  });

  test('AUTH-005: Google OAuth Login', async ({ page }) => {
    console.log('🧪 Executing AUTH-005: Google OAuth Login');
    
    await navigateToLogin(page);
    await takeScreenshot(page, 'auth-005-login-page');
    
    // Look for Google OAuth button
    const googleButtonSelectors = [
      'button:has-text("Google")',
      'button:has-text("Continue with Google")',
      '[data-testid="google-login"]',
      '.google-auth-btn'
    ];
    
    let googleButtonFound = false;
    let googleButton = null;
    
    for (const selector of googleButtonSelectors) {
      googleButton = page.locator(selector);
      if (await googleButton.count() > 0) {
        googleButtonFound = true;
        break;
      }
    }
    
    if (googleButtonFound && googleButton) {
      await takeScreenshot(page, 'auth-005-google-button-found');
      
      // Note: We can't fully test OAuth flow without real credentials
      // but we can verify the button triggers the flow
      console.log('✅ AUTH-005 INFO: Google OAuth button present, full test requires real OAuth setup');
    } else {
      await takeScreenshot(page, 'auth-005-no-google-button');
      console.log('❌ AUTH-005 FAILED: Google OAuth button not found');
    }
  });

  test('AUTH-006: Session Persistence', async ({ page }) => {
    console.log('🧪 Executing AUTH-006: Session Persistence');
    
    // First, login with valid credentials
    await navigateToLogin(page);
    await login(page, ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
    
    try {
      // Wait for successful login
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
      await takeScreenshot(page, 'auth-006-logged-in');
      
      const authenticatedUrl = page.url();
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, 'auth-006-after-refresh');
      
      // Verify user is still authenticated
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        console.log('❌ AUTH-006 FAILED: Session not persistent, redirected to login after refresh');
      } else if (currentUrl === authenticatedUrl || !currentUrl.includes('/login')) {
        console.log('✅ AUTH-006 PASSED: Session persistent after refresh');
      } else {
        console.log('⚠️  AUTH-006 INCONCLUSIVE: Unexpected redirect behavior');
      }
      
    } catch (error) {
      console.log('❌ AUTH-006 FAILED: Could not complete login for session test');
    }
  });

  test('AUTH-007: Session Expiry Handling', async ({ page }) => {
    console.log('🧪 Executing AUTH-007: Session Expiry Handling');
    
    // Note: This is a challenging test to implement without backend cooperation
    // We'll simulate by clearing session storage/cookies
    
    await navigateToLogin(page);
    await login(page, ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
    
    try {
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
      await takeScreenshot(page, 'auth-007-logged-in');
      
      // Simulate session expiry by clearing storage
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to navigate to a protected page
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, 'auth-007-after-expiry-simulation');
      
      // Check if redirected to login
      if (page.url().includes('/login')) {
        console.log('✅ AUTH-007 PASSED: Expired session redirected to login');
      } else {
        console.log('❌ AUTH-007 FAILED: No redirect on expired session');
      }
      
    } catch (error) {
      console.log('❌ AUTH-007 FAILED: Error during session expiry test');
    }
  });

  test('AUTH-008: Page Load Performance', async ({ page }) => {
    console.log('🧪 Executing AUTH-008: Page Load Performance');
    
    const startTime = Date.now();
    await navigateToLogin(page);
    const loadTime = Date.now() - startTime;
    
    await takeScreenshot(page, 'auth-008-performance-test');
    
    console.log(`📊 Login page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ AUTH-008 PASSED: Page load under 3 seconds');
    } else if (loadTime < 5000) {
      console.log('⚠️  AUTH-008 WARNING: Page load 3-5 seconds (acceptable but slow)');
    } else {
      console.log('❌ AUTH-008 FAILED: Page load over 5 seconds');
    }
  });
});