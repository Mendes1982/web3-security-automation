import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - Base class for all page objects
 * 
 * Provides common functionality and utilities that all page objects can inherit.
 * Implements the Page Object Model pattern for maintainable tests.
 * 
 * @author Ricardo Silva
 */
export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page, baseUrl: string = '/') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  /**
   * Navigate to the page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.baseUrl);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get page URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click element with retry logic
   */
  async clickWithRetry(locator: Locator, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input and verify value
   */
  async fillAndVerify(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
    const actualValue = await locator.inputValue();
    expect(actualValue).toBe(value);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if element exists
   */
  async elementExists(locator: Locator): Promise<boolean> {
    return await locator.count() > 0;
  }

  /**
   * Get text content safely
   */
  async getTextContent(locator: Locator): Promise<string | null> {
    try {
      return await locator.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Handle alert dialog
   */
  async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
    this.page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt' && promptText) {
        await dialog.accept(promptText);
      } else if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp): Promise<any> {
    const response = await this.page.waitForResponse(urlPattern);
    return await response.json();
  }

  /**
   * Mock API response
   */
  async mockApiResponse(url: string, mockData: any, status: number = 200): Promise<void> {
    await this.page.route(url, async route => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });
  }

  /**
   * Clear cookies
   */
  async clearCookies(): Promise<void> {
    await this.page.context().clearCookies();
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
  }

  /**
   * Check if page has error message
   */
  async hasError(): Promise<boolean> {
    const errorSelectors = [
      '[data-testid="error-message"]',
      '.error',
      '.alert-error',
      '[role="alert"]',
    ];

    for (const selector of errorSelectors) {
      if (await this.elementExists(this.page.locator(selector))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string | null> {
    const errorSelectors = [
      '[data-testid="error-message"]',
      '.error',
      '.alert-error',
      '[role="alert"]',
    ];

    for (const selector of errorSelectors) {
      const text = await this.getTextContent(this.page.locator(selector));
      if (text) return text;
    }
    return null;
  }

  /**
   * Abstract method to verify page is loaded
   * Must be implemented by child classes
   */
  abstract isPageLoaded(): Promise<boolean>;
}
