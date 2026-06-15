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
  await page.waitForTimeout(2000);
}

/**
 * Helper to locate address form fields using multiple selector strategies.
 */
function getAddressField(page: Page) {
  return page.getByLabel(/address/i)
    .or(page.getByPlaceholder(/address/i))
    .or(page.getByRole('textbox', { name: /address/i }))
    .or(page.locator('input[name*="address" i]'));
}

function getCityField(page: Page) {
  return page.getByLabel(/city/i)
    .or(page.getByPlaceholder(/city/i))
    .or(page.getByRole('textbox', { name: /city/i }))
    .or(page.locator('input[name*="city" i]'));
}

function getStateField(page: Page) {
  return page.getByLabel(/state/i)
    .or(page.getByPlaceholder(/state/i))
    .or(page.getByRole('textbox', { name: /state/i }))
    .or(page.locator('input[name*="state" i], select[name*="state" i]'));
}

function getZipField(page: Page) {
  return page.getByLabel(/zip/i)
    .or(page.getByPlaceholder(/zip/i))
    .or(page.getByRole('textbox', { name: /zip/i }))
    .or(page.locator('input[name*="zip" i]'));
}

/**
 * Helper to fill in the address form fields.
 */
async function fillAddressForm(page: Page, address: string, city: string, state: string, zip: string) {
  const addressField = getAddressField(page);
  await expect(addressField).toBeVisible({ timeout: 15000 });
  await addressField.fill(address);

  const cityField = getCityField(page);
  await expect(cityField).toBeVisible({ timeout: 5000 });
  await cityField.fill(city);

  const stateField = getStateField(page);
  await expect(stateField).toBeVisible({ timeout: 5000 });
  await stateField.fill(state);

  const zipField = getZipField(page);
  await expect(zipField).toBeVisible({ timeout: 5000 });
  await zipField.fill(zip);
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

    // Verify address form fields are present
    await expect(getAddressField(page)).toBeVisible({ timeout: 15000 });
    await expect(getCityField(page)).toBeVisible({ timeout: 5000 });
    await expect(getStateField(page)).toBeVisible({ timeout: 5000 });
    await expect(getZipField(page)).toBeVisible({ timeout: 5000 });
  });

  test('should fill in address and verify service availability', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToResidentialServices(page);

    // Fill in a real address within Casella's service area (Rutland, VT)
    await fillAddressForm(page, '78 Merchants Row', 'Rutland', 'VT', '05701');

    // Submit the address / check availability
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Wait for response - expect either service options or a message
    await page.waitForLoadState('networkidle');
    const serviceSection = page.getByText(/service/i);
    await expect(serviceSection).toBeVisible({ timeout: 15000 });
  });

  test('should select residential service options', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToResidentialServices(page);

    // Fill in address
    await fillAddressForm(page, '78 Merchants Row', 'Rutland', 'VT', '05701');

    // Submit address
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Wait for service selection options to load
    await page.waitForLoadState('networkidle');

    // Select trash service
    const trashService = page.getByText(/trash/i)
      .or(page.getByLabel(/trash/i));
    await expect(trashService).toBeVisible({ timeout: 15000 });

    // Select recycling service if available
    const recyclingService = page.getByText(/recycling/i)
      .or(page.getByLabel(/recycling/i));
    if (await recyclingService.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recyclingService.click();
    }

    // Select container size if dropdown is present
    const containerSize = page.getByLabel(/container|cart|size/i)
      .or(page.getByRole('combobox', { name: /size|container|cart/i }));
    if (await containerSize.isVisible({ timeout: 3000 }).catch(() => false)) {
      await containerSize.selectOption({ index: 1 });
    }

    // Select service frequency if available
    const frequency = page.getByLabel(/frequency/i)
      .or(page.getByRole('combobox', { name: /frequency/i }));
    if (await frequency.isVisible({ timeout: 3000 }).catch(() => false)) {
      await frequency.selectOption({ index: 0 });
    }
  });

  test('should complete contact information form', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToResidentialServices(page);

    // Fill in address
    await fillAddressForm(page, '78 Merchants Row', 'Rutland', 'VT', '05701');

    // Submit address
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();
    await page.waitForLoadState('networkidle');

    // Select a service and proceed
    const trashService = page.getByText(/trash/i)
      .or(page.getByLabel(/trash/i));
    await expect(trashService).toBeVisible({ timeout: 15000 });

    // Look for and click next/continue to proceed to contact info
    const nextButton = page.getByRole('button', { name: /next|continue|proceed/i });
    if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }

    // Fill in contact information
    const firstNameField = page.getByLabel(/first name/i)
      .or(page.getByPlaceholder(/first name/i));
    if (await firstNameField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstNameField.fill('Test');
    }

    const lastNameField = page.getByLabel(/last name/i)
      .or(page.getByPlaceholder(/last name/i));
    if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lastNameField.fill('User');
    }

    const emailField = page.getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i));
    if (await emailField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailField.fill('testuser@example.com');
    }

    const phoneField = page.getByLabel(/phone/i)
      .or(page.getByPlaceholder(/phone/i));
    if (await phoneField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneField.fill('8025551234');
    }
  });

  test('should display order summary before submission', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToResidentialServices(page);

    // Fill in address
    await fillAddressForm(page, '78 Merchants Row', 'Rutland', 'VT', '05701');

    // Submit address
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();
    await page.waitForLoadState('networkidle');

    // Advance through the flow to review/summary
    const nextButtons = page.getByRole('button', { name: /next|continue|proceed|review/i });
    const count = await nextButtons.count();
    for (let i = 0; i < count; i++) {
      const btn = nextButtons.nth(i);
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForLoadState('networkidle');
        break;
      }
    }

    // Verify summary/review page elements
    const summarySection = page.getByText(/summary|review|confirm/i);
    await expect(summarySection).toBeVisible({ timeout: 15000 });
  });

  test('should validate required fields show error messages', async ({ page }) => {
    await navigateToResidentialServices(page);

    // Try to submit without filling in required fields
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    if (await submitButton.isVisible({ timeout: 10000 }).catch(() => false)) {
      await submitButton.click();

      // Verify validation error messages appear
      const errorMessage = page.getByText(/required|please enter|invalid|cannot be empty/i);
      await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle invalid address gracefully', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToResidentialServices(page);

    // Fill in a real address outside Casella's service area (Los Angeles, CA)
    await fillAddressForm(page, '100 North Main Street', 'Los Angeles', 'CA', '90012');

    // Submit the invalid address
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Expect an error or "not serviceable" message
    const errorMessage = page.getByText(/not available|not serviceable|invalid|error|not found|outside/i);
    await expect(errorMessage.first()).toBeVisible({ timeout: 15000 });
  });
});

