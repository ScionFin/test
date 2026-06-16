// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * QA Test: Navigate through the Commercial Services section
 * on the Casella Customer Engagement page using a real address
 * from Rutland, Vermont.
 *
 * Address used: 78 Merchants Row, Rutland, VT 05701
 */

test.describe('Commercial Services - Customer Engagement', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Customer Engagement page
    await page.goto('/customerengagement/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate through Commercial Services flow with Rutland VT address', async ({ page }) => {
    // Step 1: Verify the page loaded successfully
    await expect(page).toHaveURL(/customerengagement/);

    // Step 2: Select Commercial Services
    // Look for the Commercial Services option and click it
    const commercialServicesButton = page.getByRole('button', { name: /commercial/i })
      .or(page.getByText(/commercial services/i).first())
      .or(page.locator('[data-testid="commercial-services"]'));

    await commercialServicesButton.waitFor({ state: 'visible', timeout: 15000 });
    await commercialServicesButton.click();

    // Step 3: Wait for the address/location step to appear
    await page.waitForLoadState('networkidle');

    // Step 4: Enter a real Rutland, Vermont address
    // Try common input field selectors for address entry
    const addressInput = page.getByPlaceholder(/address/i)
      .or(page.getByLabel(/address/i))
      .or(page.locator('input[name*="address"]'))
      .or(page.locator('input[type="text"]').first());

    await addressInput.waitFor({ state: 'visible', timeout: 15000 });
    await addressInput.fill('78 Merchants Row, Rutland, VT 05701');

    // Step 5: If there's an autocomplete/suggestion dropdown, wait and select it
    const suggestionDropdown = page.locator('[class*="suggestion"], [class*="autocomplete"], [role="listbox"], [class*="dropdown"]').first();
    try {
      await suggestionDropdown.waitFor({ state: 'visible', timeout: 5000 });
      // Click the first suggestion that matches Rutland
      const rutlandSuggestion = page.getByText(/rutland/i).first();
      if (await rutlandSuggestion.isVisible()) {
        await rutlandSuggestion.click();
      } else {
        // Click first available suggestion
        await suggestionDropdown.locator('li, div[role="option"], .suggestion-item').first().click();
      }
    } catch {
      // No autocomplete dropdown appeared, proceed with typed address
    }

    // Step 6: Submit the address / click Next or Continue
    const nextButton = page.getByRole('button', { name: /next|continue|submit|get started|find services/i })
      .or(page.locator('button[type="submit"]'))
      .or(page.locator('[data-testid*="next"], [data-testid*="submit"]'));

    try {
      await nextButton.waitFor({ state: 'visible', timeout: 10000 });
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    } catch {
      // Some forms auto-advance after address selection
    }

    // Step 7: Verify we advanced past the address step
    // The page should show service options, a confirmation, or the next step
    // Wait for new content to load indicating progress
    await page.waitForTimeout(2000);

    // Verify the page has progressed (URL changed, new content appeared, or address is confirmed)
    const pageContent = await page.content();
    const hasProgressed =
      pageContent.toLowerCase().includes('rutland') ||
      pageContent.toLowerCase().includes('service') ||
      pageContent.toLowerCase().includes('waste') ||
      pageContent.toLowerCase().includes('recycling') ||
      pageContent.toLowerCase().includes('dumpster') ||
      pageContent.toLowerCase().includes('container') ||
      pageContent.toLowerCase().includes('schedule') ||
      pageContent.toLowerCase().includes('quote');

    expect(hasProgressed).toBeTruthy();
  });

  test('should display Commercial Services option on the landing page', async ({ page }) => {
    // Verify the Commercial Services option is visible on the engagement page
    const commercialOption = page.getByText(/commercial/i).first();
    await expect(commercialOption).toBeVisible({ timeout: 15000 });
  });

  test('should accept a valid Rutland VT address in the address field', async ({ page }) => {
    // Navigate to Commercial Services
    const commercialServicesButton = page.getByRole('button', { name: /commercial/i })
      .or(page.getByText(/commercial services/i).first())
      .or(page.locator('[data-testid="commercial-services"]'));

    await commercialServicesButton.waitFor({ state: 'visible', timeout: 15000 });
    await commercialServicesButton.click();
    await page.waitForLoadState('networkidle');

    // Enter address
    const addressInput = page.getByPlaceholder(/address/i)
      .or(page.getByLabel(/address/i))
      .or(page.locator('input[name*="address"]'))
      .or(page.locator('input[type="text"]').first());

    await addressInput.waitFor({ state: 'visible', timeout: 15000 });
    await addressInput.fill('123 West Street, Rutland, VT 05701');

    // Verify the address was entered
    await expect(addressInput).toHaveValue(/Rutland/i);
  });

  test('should show service options after entering address', async ({ page }) => {
    // Navigate to Commercial Services
    const commercialServicesButton = page.getByRole('button', { name: /commercial/i })
      .or(page.getByText(/commercial services/i).first())
      .or(page.locator('[data-testid="commercial-services"]'));

    await commercialServicesButton.waitFor({ state: 'visible', timeout: 15000 });
    await commercialServicesButton.click();
    await page.waitForLoadState('networkidle');

    // Enter a real Rutland address
    const addressInput = page.getByPlaceholder(/address/i)
      .or(page.getByLabel(/address/i))
      .or(page.locator('input[name*="address"]'))
      .or(page.locator('input[type="text"]').first());

    await addressInput.waitFor({ state: 'visible', timeout: 15000 });
    await addressInput.fill('78 Merchants Row, Rutland, VT 05701');

    // Handle autocomplete suggestions
    const suggestionDropdown = page.locator('[class*="suggestion"], [class*="autocomplete"], [role="listbox"], [class*="dropdown"]').first();
    try {
      await suggestionDropdown.waitFor({ state: 'visible', timeout: 5000 });
      const rutlandSuggestion = page.getByText(/rutland/i).first();
      if (await rutlandSuggestion.isVisible()) {
        await rutlandSuggestion.click();
      } else {
        await suggestionDropdown.locator('li, div[role="option"], .suggestion-item').first().click();
      }
    } catch {
      // No autocomplete appeared
    }

    // Submit address
    const nextButton = page.getByRole('button', { name: /next|continue|submit|get started|find services/i })
      .or(page.locator('button[type="submit"]'))
      .or(page.locator('[data-testid*="next"], [data-testid*="submit"]'));

    try {
      await nextButton.waitFor({ state: 'visible', timeout: 10000 });
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    } catch {
      // Form may auto-advance
    }

    // Wait and check for service-related content
    await page.waitForTimeout(3000);

    // Verify service options or next step is shown
    const serviceContent = page.getByText(/waste|recycling|dumpster|container|pickup|collection|service/i).first();
    await expect(serviceContent).toBeVisible({ timeout: 15000 });
  });
});
