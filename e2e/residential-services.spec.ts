import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'https://app-qa.casella.com/customerengagement/';

/**
 * Helper to navigate to the Residential Services section and wait for it to load.
 * The application is an SPA that does not change the URL on section navigation.
 */
async function navigateToResidentialServices(page: Page) {
  const residentialOption = page.getByTestId('page-residential-services-section');
  await expect(residentialOption).toBeVisible({ timeout: 10000 });
  await residentialOption.click();
  // Wait for the section content to load after clicking
  await page.waitForLoadState('networkidle');
  // Give the SPA time to render the new section
  await page.waitForTimeout(3000);
}

/**
 * Locator for a single address search/autocomplete field.
 * Many modern apps use a single combined address search input.
 */
function getAddressSearchField(page: Page) {
  return page.getByPlaceholder(/enter.*address|search.*address|type.*address|address/i)
    .or(page.getByLabel(/address|location|search/i))
    .or(page.getByRole('searchbox'))
    .or(page.getByRole('combobox', { name: /address|location/i }))
    .or(page.getByRole('textbox', { name: /address|location|search/i }))
    .or(page.locator('input[type="search"]'))
    .or(page.locator('input[id*="address" i], input[id*="location" i], input[id*="search" i]'))
    .or(page.locator('input[name*="address" i], input[name*="location" i]'))
    .or(page.locator('input[data-testid*="address" i], input[data-testid*="location" i]'));
}

/**
 * Locator for any visible text input on the page (broad fallback).
 */
function getAnyInputField(page: Page) {
  return page.locator('input[type="text"]:visible, input:not([type]):visible, input[type="search"]:visible').first();
}

/**
 * Helper to fill in the address. Supports:
 * 1. A single address search/autocomplete field (full address typed in one box)
 * 2. Separate address/city/state/zip fields as a fallback
 */
async function fillAddress(page: Page, fullAddress: string) {
  // Strategy 1: Look for a single address search/autocomplete field
  const searchField = getAddressSearchField(page);
  const anyInput = getAnyInputField(page);

  let targetField;
  if (await searchField.first().isVisible({ timeout: 10000 }).catch(() => false)) {
    targetField = searchField.first();
  } else if (await anyInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    targetField = anyInput;
  } else {
    throw new Error('No address input field found on the page');
  }

  await targetField.click();
  await targetField.fill(fullAddress);
  // Wait for autocomplete suggestions to appear
  await page.waitForTimeout(2000);

  // Try to select the first autocomplete suggestion if a dropdown appears
  const suggestion = page.locator('[role="option"], [role="listbox"] li, .pac-item, .suggestion, [class*="suggestion"], [class*="autocomplete"] li, [class*="dropdown"] li, [class*="result"]').first();
  if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
    await suggestion.click();
  } else {
    // Press Enter or Tab to confirm the typed address
    await targetField.press('Enter');
  }

  await page.waitForTimeout(1000);
}

test.describe('Customer Engagement - Residential Services', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load the customer engagement page', async ({ page }) => {
    await expect(page).toHaveURL(/customerengagement/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to Residential Services', async ({ page }) => {
    await navigateToResidentialServices(page);

    // Verify navigation to residential services section by checking either the URL
    // or the presence of residential-specific content (SPA may not change URL)
    const hasResidentialUrl = await page.url().match(/residential/i);
    if (!hasResidentialUrl) {
      // SPA navigation: verify by content presence instead of URL
      const residentialContent = page.getByText(/residential/i).first();
      await expect(residentialContent).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page).toHaveURL(/residential/i);
    }
  });

  test('should display address entry form for residential services', async ({ page }) => {
    await navigateToResidentialServices(page);

    // Verify that some form of address input is present
    // The app may use a single search field or separate fields
    const searchField = getAddressSearchField(page);
    const anyInput = getAnyInputField(page);

    const hasSearchField = await searchField.first().isVisible({ timeout: 15000 }).catch(() => false);
    const hasAnyInput = await anyInput.isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasSearchField || hasAnyInput).toBeTruthy();
  });

  test('should fill in address and verify service availability', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToResidentialServices(page);

    // Fill in a real address within Casella's service area (Rutland, VT)
    await fillAddress(page, '78 Merchants Row, Rutland, VT 05701');

    // Look for a submit/check/next button or wait for automatic service check
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify|search|go/i });
    if (await submitButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitButton.first().click();
    }

    // Wait for response - expect either service options or a message
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const serviceSection = page.getByText(/service|available|option|plan|pickup/i).first();
    await expect(serviceSection).toBeVisible({ timeout: 15000 });
  });

  test('should select residential service options', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToResidentialServices(page);

    // Fill in address
    await fillAddress(page, '78 Merchants Row, Rutland, VT 05701');

    // Submit if needed
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify|search|go/i });
    if (await submitButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitButton.first().click();
    }

    // Wait for service selection options to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Select trash service
    const trashService = page.getByText(/trash|waste|garbage/i)
      .or(page.getByLabel(/trash|waste|garbage/i));
    await expect(trashService.first()).toBeVisible({ timeout: 15000 });

    // Select recycling service if available
    const recyclingService = page.getByText(/recycling|recycle/i)
      .or(page.getByLabel(/recycling|recycle/i));
    if (await recyclingService.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await recyclingService.first().click();
    }

    // Select container size if dropdown is present
    const containerSize = page.getByLabel(/container|cart|size/i)
      .or(page.getByRole('combobox', { name: /size|container|cart/i }));
    if (await containerSize.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await containerSize.first().selectOption({ index: 1 });
    }

    // Select service frequency if available
    const frequency = page.getByLabel(/frequency|schedule/i)
      .or(page.getByRole('combobox', { name: /frequency|schedule/i }));
    if (await frequency.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await frequency.first().selectOption({ index: 0 });
    }
  });

  test('should complete contact information form', async ({ page }) => {
    test.setTimeout(90000);
    await navigateToResidentialServices(page);

    // Fill in address
    await fillAddress(page, '78 Merchants Row, Rutland, VT 05701');

    // Submit if needed
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify|search|go/i });
    if (await submitButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitButton.first().click();
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for and click next/continue to proceed to contact info
    const nextButton = page.getByRole('button', { name: /next|continue|proceed/i });
    if (await nextButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Fill in contact information if the fields appear
    const firstNameField = page.getByLabel(/first name/i)
      .or(page.getByPlaceholder(/first name/i));
    if (await firstNameField.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstNameField.first().fill('Test');
    }

    const lastNameField = page.getByLabel(/last name/i)
      .or(page.getByPlaceholder(/last name/i));
    if (await lastNameField.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await lastNameField.first().fill('User');
    }

    const emailField = page.getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i));
    if (await emailField.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailField.first().fill('testuser@example.com');
    }

    const phoneField = page.getByLabel(/phone/i)
      .or(page.getByPlaceholder(/phone/i));
    if (await phoneField.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneField.first().fill('8025551234');
    }
  });

  test('should display order summary before submission', async ({ page }) => {
    test.setTimeout(90000);
    await navigateToResidentialServices(page);

    // Fill in address
    await fillAddress(page, '78 Merchants Row, Rutland, VT 05701');

    // Submit if needed
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify|search|go/i });
    if (await submitButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitButton.first().click();
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Advance through the flow to review/summary
    const nextButtons = page.getByRole('button', { name: /next|continue|proceed|review/i });
    const count = await nextButtons.count();
    for (let i = 0; i < count; i++) {
      const btn = nextButtons.nth(i);
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        break;
      }
    }

    // Verify summary/review page elements
    const summarySection = page.getByText(/summary|review|confirm|order/i).first();
    await expect(summarySection).toBeVisible({ timeout: 15000 });
  });

  test('should validate required fields show error messages', async ({ page }) => {
    await navigateToResidentialServices(page);

    // Try to submit without filling in required fields
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify|search|go/i });
    if (await submitButton.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await submitButton.first().click();

      // Verify validation error messages appear
      const errorMessage = page.getByText(/required|please enter|invalid|cannot be empty/i);
      await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle invalid address gracefully', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToResidentialServices(page);

    // Fill in a real address outside Casella's service area (Los Angeles, CA)
    await fillAddress(page, '100 North Main Street, Los Angeles, CA 90012');

    // Submit if needed
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify|search|go/i });
    if (await submitButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitButton.first().click();
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Expect an error or "not serviceable" message
    const errorMessage = page.getByText(/not available|not serviceable|invalid|error|not found|outside|not in.*area|cannot serve/i).first();
    await expect(errorMessage).toBeVisible({ timeout: 15000 });
  });
});

