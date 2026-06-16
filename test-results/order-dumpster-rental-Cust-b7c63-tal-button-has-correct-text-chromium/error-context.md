# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-dumpster-rental.spec.ts >> Customer Engagement Page >> Order Dumpster Rental button has correct text
- Location: tests/order-dumpster-rental.spec.ts:22:7

# Error details

```
Error: page.goto: net::ERR_NAME_NOT_RESOLVED at https://app-qa.casella.com/customerengagement/
Call log:
  - navigating to "https://app-qa.casella.com/customerengagement/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Customer Engagement Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/customerengagement/');
     |                ^ Error: page.goto: net::ERR_NAME_NOT_RESOLVED at https://app-qa.casella.com/customerengagement/
  6  |   });
  7  | 
  8  |   test('Order Dumpster Rental button is visible and clickable', async ({ page }) => {
  9  |     // Locate the Order Dumpster Rental button
  10 |     const orderDumpsterRentalButton = page.getByRole('button', { name: /order dumpster rental/i });
  11 | 
  12 |     // Verify the button is visible
  13 |     await expect(orderDumpsterRentalButton).toBeVisible();
  14 | 
  15 |     // Click the button
  16 |     await orderDumpsterRentalButton.click();
  17 | 
  18 |     // Verify navigation or action occurred after clicking
  19 |     await expect(page).not.toHaveURL('/customerengagement/');
  20 |   });
  21 | 
  22 |   test('Order Dumpster Rental button has correct text', async ({ page }) => {
  23 |     const orderDumpsterRentalButton = page.getByRole('button', { name: /order dumpster rental/i });
  24 | 
  25 |     await expect(orderDumpsterRentalButton).toBeVisible();
  26 |     await expect(orderDumpsterRentalButton).toBeEnabled();
  27 |   });
  28 | });
  29 | 
```