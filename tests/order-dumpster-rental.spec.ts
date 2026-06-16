import { test, expect } from '@playwright/test';

test.describe('Customer Engagement Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customerengagement/');
  });

  test('Order Dumpster Rental button is visible and clickable', async ({ page }) => {
    // Locate the Order Dumpster Rental button
    const orderDumpsterRentalButton = page.getByRole('button', { name: /order dumpster rental/i });

    // Verify the button is visible
    await expect(orderDumpsterRentalButton).toBeVisible();

    // Click the button
    await orderDumpsterRentalButton.click();

    // Verify navigation or action occurred after clicking
    await expect(page).not.toHaveURL('/customerengagement/');
  });

  test('Order Dumpster Rental button has correct text', async ({ page }) => {
    const orderDumpsterRentalButton = page.getByRole('button', { name: /order dumpster rental/i });

    await expect(orderDumpsterRentalButton).toBeVisible();
    await expect(orderDumpsterRentalButton).toBeEnabled();
  });
});
