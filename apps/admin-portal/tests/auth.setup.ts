import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Wait for the login form to be visible
  await page.waitForSelector('form[data-testid="login-form"]', { 
    timeout: 30000 
  });
  
  // Fill in login credentials
  await page.fill('input[name="email"]', 'admin@livrili.com');
  await page.fill('input[name="password"]', 'admin123');
  
  // Submit login form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard - using multiple possible selectors
  await Promise.race([
    page.waitForURL('/dashboard'),
    page.waitForURL('/'),
    page.waitForSelector('[data-testid="dashboard"]'),
    page.waitForSelector('[data-testid="navigation"]'),
    page.waitForSelector('nav'),
  ]);
  
  // Verify login was successful by checking for user menu or navigation
  const isLoggedIn = await Promise.race([
    page.locator('[data-testid="user-menu"]').isVisible(),
    page.locator('nav').isVisible(),
    page.locator('[data-testid="navigation"]').isVisible(),
    page.locator('[data-testid="dashboard"]').isVisible(),
  ]);
  
  expect(isLoggedIn).toBe(true);
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});