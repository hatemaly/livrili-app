import { test, expect, Page } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  username: 'admin@test.com',
  password: 'test123'
};

test.describe('Debug Authentication', () => {
  test('Debug Login Flow', async ({ page }) => {
    console.log('🔍 Debugging login flow...');
    
    // Step 1: Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `test-screenshots/debug-login-page-${Date.now()}.png`, fullPage: true });
    
    // Step 2: Check what's actually on the page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    const url = page.url();
    console.log('Current URL:', url);
    
    // Step 3: Look for any form elements
    const forms = await page.locator('form').count();
    console.log('Forms found:', forms);
    
    const inputs = await page.locator('input').count();
    console.log('Input fields found:', inputs);
    
    // Step 4: Try to find login elements with various selectors
    const usernameSelectors = ['#username', '#email', 'input[type="email"]', 'input[name="username"]', 'input[name="email"]'];
    const passwordSelectors = ['#password', 'input[type="password"]', 'input[name="password"]'];
    
    let usernameField = null;
    let passwordField = null;
    
    for (const selector of usernameSelectors) {
      if (await page.locator(selector).count() > 0) {
        usernameField = selector;
        console.log('Found username field:', selector);
        break;
      }
    }
    
    for (const selector of passwordSelectors) {
      if (await page.locator(selector).count() > 0) {
        passwordField = selector;
        console.log('Found password field:', selector);
        break;
      }
    }
    
    if (usernameField && passwordField) {
      // Step 5: Try to login
      console.log('Attempting login...');
      await page.fill(usernameField, ADMIN_CREDENTIALS.username);
      await page.fill(passwordField, ADMIN_CREDENTIALS.password);
      await page.screenshot({ path: `test-screenshots/debug-filled-form-${Date.now()}.png`, fullPage: true });
      
      // Look for submit button
      const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Sign In")', 'button:has-text("Login")'];
      let submitButton = null;
      
      for (const selector of submitSelectors) {
        if (await page.locator(selector).count() > 0) {
          submitButton = selector;
          console.log('Found submit button:', selector);
          break;
        }
      }
      
      if (submitButton) {
        await page.click(submitButton);
        console.log('Clicked submit button');
        
        // Wait for response
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `test-screenshots/debug-after-submit-${Date.now()}.png`, fullPage: true });
        
        const newUrl = page.url();
        console.log('URL after submit:', newUrl);
        
        // Check for errors
        const errorElements = await page.locator('.error, [role="alert"], .alert, .text-red-600, .text-red-800').all();
        for (const element of errorElements) {
          if (await element.isVisible()) {
            const errorText = await element.textContent();
            console.log('Error found:', errorText);
          }
        }
        
        // Check if we're redirected
        if (newUrl !== url) {
          console.log('✅ Redirect occurred - login may have succeeded');
        } else {
          console.log('⚠️ No redirect - login may have failed');
        }
        
      } else {
        console.log('❌ No submit button found');
      }
      
    } else {
      console.log('❌ Could not find login fields');
      console.log('Username field found:', !!usernameField);
      console.log('Password field found:', !!passwordField);
      
      // Let's see what the page actually contains
      const bodyText = await page.locator('body').textContent();
      console.log('Page content (first 500 chars):', bodyText?.substring(0, 500));
    }
  });
});