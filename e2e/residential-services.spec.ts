import { test, expect } from '@playwright/test';

const BASE_URL = 'https://app-qa.casella.com/customerengagement/';

test.describe('Customer Engagement - Residential Services', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should load the customer engagement page', async ({ page }) => {
    await expect(page).toHaveURL(/customerengagement/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to Residential Services', async ({ page }) => {
    // Click on the Residential Services section using its test-id
    const residentialOption = page.getByTestId('page-residential-services-section');

    await expect(residentialOption).toBeVisible();
    await residentialOption.click();

    // Verify navigation to residential services section
    await expect(page).toHaveURL(/residential/i);
  });

  test('should display address entry form for residential services', async ({ page }) => {
    // Navigate to Residential Services
    const residentialOption = page.getByTestId('page-residential-services-section');
    await residentialOption.click();

    // Verify address form fields are present
    const addressField = page.getByLabel(/address/i)
      .or(page.getByPlaceholder(/address/i));
    await expect(addressField).toBeVisible();

    const cityField = page.getByLabel(/city/i)
      .or(page.getByPlaceholder(/city/i));
    await expect(cityField).toBeVisible();

    const stateField = page.getByLabel(/state/i)
      .or(page.getByPlaceholder(/state/i));
    await expect(stateField).toBeVisible();

    const zipField = page.getByLabel(/zip/i)
      .or(page.getByPlaceholder(/zip/i));
    await expect(zipField).toBeVisible();
  });

  test('should fill in address and verify service availability', async ({ page }) => {
    // Navigate to Residential Services
    const residentialOption = page.getByTestId('page-residential-services-section');
    await residentialOption.click();

    // Fill in a test address within Casella's service area (Vermont)
    const addressField = page.getByLabel(/address/i)
      .or(page.getByPlaceholder(/address/i));
    await addressField.fill('123 Main Street');

    const cityField = page.getByLabel(/city/i)
      .or(page.getByPlaceholder(/city/i));
    await cityField.fill('Rutland');

    const stateField = page.getByLabel(/state/i)
      .or(page.getByPlaceholder(/state/i));
    await stateField.fill('VT');

    const zipField = page.getByLabel(/zip/i)
      .or(page.getByPlaceholder(/zip/i));
    await zipField.fill('05701');

    // Submit the address / check availability
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await submitButton.click();

    // Wait for response - expect either service options or a message
    const serviceSection = page.getByText(/service/i);
    await expect(serviceSection).toBeVisible({ timeout: 10000 });
  });

  test('should select residential service options', async ({ page }) => {
    // Navigate to Residential Services
    const residentialOption = page.getByTestId('page-residential-services-section');
    await residentialOption.click();

    // Fill in address
    const addressField = page.getByLabel(/address/i)
      .or(page.getByPlaceholder(/address/i));
    await addressField.fill('123 Main Street');

    const cityField = page.getByLabel(/city/i)
      .or(page.getByPlaceholder(/city/i));
    await cityField.fill('Rutland');

    const stateField = page.getByLabel(/state/i)
      .or(page.getByPlaceholder(/state/i));
    await stateField.fill('VT');

    const zipField = page.getByLabel(/zip/i)
      .or(page.getByPlaceholder(/zip/i));
    await zipField.fill('05701');

    // Submit address
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await submitButton.click();

    // Wait for service selection options to load
    await page.waitForLoadState('networkidle');

    // Select trash service
    const trashService = page.getByText(/trash/i)
      .or(page.getByLabel(/trash/i));
    await expect(trashService).toBeVisible({ timeout: 10000 });

    // Select recycling service if available
    const recyclingService = page.getByText(/recycling/i)
      .or(page.getByLabel(/recycling/i));
    if (await recyclingService.isVisible()) {
      await recyclingService.click();
    }

    // Select container size if dropdown is present
    const containerSize = page.getByLabel(/container|cart|size/i)
      .or(page.getByRole('combobox', { name: /size|container|cart/i }));
    if (await containerSize.isVisible()) {
      await containerSize.selectOption({ index: 1 });
    }

    // Select service frequency if available
    const frequency = page.getByLabel(/frequency/i)
      .or(page.getByRole('combobox', { name: /frequency/i }));
    if (await frequency.isVisible()) {
      await frequency.selectOption({ index: 0 });
    }
  });

  test('should complete contact information form', async ({ page }) => {
    // Navigate to Residential Services
    const residentialOption = page.getByTestId('page-residential-services-section');
    await residentialOption.click();

    // Fill in address
    const addressField = page.getByLabel(/address/i)
      .or(page.getByPlaceholder(/address/i));
    await addressField.fill('123 Main Street');

    const cityField = page.getByLabel(/city/i)
      .or(page.getByPlaceholder(/city/i));
    await cityField.fill('Rutland');

    const stateField = page.getByLabel(/state/i)
      .or(page.getByPlaceholder(/state/i));
    await stateField.fill('VT');

    const zipField = page.getByLabel(/zip/i)
      .or(page.getByPlaceholder(/zip/i));
    await zipField.fill('05701');

    // Submit address
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await submitButton.click();
    await page.waitForLoadState('networkidle');

    // Select a service and proceed
    const trashService = page.getByText(/trash/i)
      .or(page.getByLabel(/trash/i));
    await expect(trashService).toBeVisible({ timeout: 10000 });

    // Look for and click next/continue to proceed to contact info
    const nextButton = page.getByRole('button', { name: /next|continue|proceed/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }

    // Fill in contact information
    const firstNameField = page.getByLabel(/first name/i)
      .or(page.getByPlaceholder(/first name/i));
    if (await firstNameField.isVisible()) {
      await firstNameField.fill('Test');
    }

    const lastNameField = page.getByLabel(/last name/i)
      .or(page.getByPlaceholder(/last name/i));
    if (await lastNameField.isVisible()) {
      await lastNameField.fill('User');
    }

    const emailField = page.getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i));
    if (await emailField.isVisible()) {
      await emailField.fill('testuser@example.com');
    }

    const phoneField = page.getByLabel(/phone/i)
      .or(page.getByPlaceholder(/phone/i));
    if (await phoneField.isVisible()) {
      await phoneField.fill('8025551234');
    }
  });

  test('should display order summary before submission', async ({ page }) => {
    // Navigate to Residential Services
    const residentialOption = page.getByTestId('page-residential-services-section');
    await residentialOption.click();

    // Fill in address
    const addressField = page.getByLabel(/address/i)
      .or(page.getByPlaceholder(/address/i));
    await addressField.fill('123 Main Street');

    const cityField = page.getByLabel(/city/i)
      .or(page.getByPlaceholder(/city/i));
    await cityField.fill('Rutland');

    const stateField = page.getByLabel(/state/i)
      .or(page.getByPlaceholder(/state/i));
    await stateField.fill('VT');

    const zipField = page.getByLabel(/zip/i)
      .or(page.getByPlaceholder(/zip/i));
    await zipField.fill('05701');

    // Submit address
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
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
    await expect(summarySection).toBeVisible({ timeout: 10000 });
  });

  test('should validate required fields show error messages', async ({ page }) => {
    // Navigate to Residential Services
    const residentialOption = page.getByTestId('page-residential-services-section');
    await residentialOption.click();

    // Try to submit without filling in required fields
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Verify validation error messages appear
      const errorMessage = page.getByText(/required|please enter|invalid|cannot be empty/i);
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle invalid address gracefully', async ({ page }) => {
    // Navigate to Residential Services
    const residentialOption = page.getByTestId('page-residential-services-section');
    await residentialOption.click();

    // Fill in an invalid/non-serviceable address
    const addressField = page.getByLabel(/address/i)
      .or(page.getByPlaceholder(/address/i));
    await addressField.fill('99999 Nonexistent Road');

    const cityField = page.getByLabel(/city/i)
      .or(page.getByPlaceholder(/city/i));
    await cityField.fill('FakeCity');

    const stateField = page.getByLabel(/state/i)
      .or(page.getByPlaceholder(/state/i));
    await stateField.fill('XX');

    const zipField = page.getByLabel(/zip/i)
      .or(page.getByPlaceholder(/zip/i));
    await zipField.fill('00000');

    // Submit the invalid address
    const submitButton = page.getByRole('button', { name: /check|submit|next|continue|verify/i });
    await submitButton.click();

    // Expect an error or "not serviceable" message
    const errorMessage = page.getByText(/not available|not serviceable|invalid|error|not found|outside/i);
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });
});

