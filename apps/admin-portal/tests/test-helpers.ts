import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(public page: Page) {}

  /**
   * Smart selector that tries multiple strategies to find elements
   */
  async smartElementExists(primarySelector: string, fallbackSelectors: string[] = []): Promise<boolean> {
    const allSelectors = [primarySelector, ...fallbackSelectors];
    
    for (const selector of allSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          return true;
        }
      } catch {
        continue;
      }
    }
    
    return false;
  }

  /**
   * Enhanced form interaction with smart waiting
   */
  async smartFillAndSubmit(formData: { [key: string]: string }, submitSelector?: string) {
    // Fill all form fields
    for (const [fieldName, value] of Object.entries(formData)) {
      const selectors = [
        `input[name="${fieldName}"]`,
        `input#${fieldName}`,
        `[data-testid="${fieldName}"]`,
        fieldName === 'username' ? 'input[type="text"]' : `input[type="${fieldName}"]`
      ].join(', ');
      
      await this.fillField(selectors, value);
    }
    
    // Submit form if selector provided
    if (submitSelector) {
      await this.clickAndWait(submitSelector, { waitForNavigation: true });
    }
  }

  /**
   * Wait for element with multiple selector fallbacks
   */
  async waitForElementWithFallback(selectors: string[], options: { timeout?: number } = {}) {
    const timeout = options.timeout || 15000;
    
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: timeout / selectors.length });
        return selector;
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }
    
    throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
  }

  /**
   * Navigate and wait for page load with multiple indicators
   */
  async navigateAndWait(url: string, waitSelectors: string[] = []) {
    await this.page.goto(url);
    
    // Default wait selectors if none provided
    const defaultSelectors = [
      'main',
      '[data-testid="page-content"]',
      'h1',
      '.page-content',
    ];
    
    const selectorsToWait = waitSelectors.length > 0 ? waitSelectors : defaultSelectors;
    
    await this.waitForElementWithFallback(selectorsToWait);
  }

  /**
   * Fill form field with multiple selector fallbacks and retry logic
   */
  async fillField(selectors: string, value: string, options: { retry?: number } = {}) {
    const maxRetries = options.retry || 3;
    const selectorList = selectors.split(', ');
    
    for (let i = 0; i < maxRetries; i++) {
      for (const selector of selectorList) {
        try {
          // Wait for element to be available
          await this.page.waitForSelector(selector.trim(), { timeout: 2000 });
          
          // Clear any existing content first
          await this.page.fill(selector.trim(), '');
          
          // Fill with the desired value
          await this.page.fill(selector.trim(), value);
          
          // Verify the field was filled correctly
          const fieldValue = await this.page.inputValue(selector.trim());
          if (fieldValue === value) {
            return;
          }
        } catch (error) {
          // Try next selector if current one fails
          continue;
        }
      }
      
      // If all selectors failed, wait and retry
      if (i < maxRetries - 1) {
        await this.page.waitForTimeout(1000);
      }
    }
    
    throw new Error(`Failed to fill field with any of these selectors: ${selectors}`);
  }

  /**
   * Click with multiple selector fallbacks, retry logic, and response waiting
   */
  async clickAndWait(selectors: string, options: { 
    waitForResponse?: string | RegExp;
    waitForNavigation?: boolean;
    retry?: number;
  } = {}) {
    const maxRetries = options.retry || 3;
    const selectorList = selectors.split(', ');
    
    for (let i = 0; i < maxRetries; i++) {
      for (const selector of selectorList) {
        try {
          // Wait for element to be clickable
          await this.page.waitForSelector(selector.trim(), { state: 'visible', timeout: 2000 });
          
          if (options.waitForResponse) {
            const [response] = await Promise.all([
              this.page.waitForResponse(options.waitForResponse),
              this.page.click(selector.trim())
            ]);
            return response;
          } else if (options.waitForNavigation) {
            await Promise.all([
              this.page.waitForNavigation({ timeout: 10000 }),
              this.page.click(selector.trim())
            ]);
          } else {
            await this.page.click(selector.trim());
          }
          return;
        } catch (error) {
          // Try next selector if current one fails
          continue;
        }
      }
      
      // If all selectors failed, wait and retry
      if (i < maxRetries - 1) {
        await this.page.waitForTimeout(1000);
      }
    }
    
    throw new Error(`Failed to click with any of these selectors: ${selectors}`);
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get text content with fallback selectors
   */
  async getTextWithFallback(selectors: string[]): Promise<string | null> {
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          return await element.textContent();
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  /**
   * Wait for loading states to complete with enhanced detection
   */
  async waitForLoadingComplete() {
    // Wait for common loading indicators to disappear
    const loadingSelectors = [
      '[data-testid="loading"]',
      '.loading',
      '.spinner',
      '[role="progressbar"]',
      '.animate-spin',
      '[class*="loading"]'
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout: 2000 });
      } catch {
        // Loading indicator might not exist, continue
      }
    }

    // Wait for network to be idle
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      // Fallback to domcontentloaded if networkidle fails
      await this.page.waitForLoadState('domcontentloaded');
    }
    
    // Additional wait for React hydration
    await this.page.waitForTimeout(500);
  }

  /**
   * Setup database with test data
   */
  async setupTestData() {
    // This would typically make API calls to set up test data
    // For now, we'll assume data exists or create minimal setup
    console.log('Setting up test data...');
  }

  /**
   * Clean up test data
   */
  async cleanupTestData() {
    // Clean up any test-specific data
    console.log('Cleaning up test data...');
  }
}