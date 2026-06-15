# Casella Customer Engagement - QA Tests

Automated QA tests for the Casella Customer Engagement portal, specifically covering the Residential Services flow.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# View the HTML test report
npm run test:report
```

## Test Coverage

The `residential-services.spec.ts` test suite covers:

1. **Page Load** - Verifies the customer engagement page loads successfully
2. **Navigation** - Navigates to the Residential Services section
3. **Address Form** - Validates address entry form fields are displayed
4. **Service Availability** - Fills in a valid address and checks service availability
5. **Service Selection** - Selects residential service options (trash, recycling, container size)
6. **Contact Information** - Fills in customer contact details
7. **Order Summary** - Verifies the review/summary page displays before submission
8. **Validation Errors** - Confirms required field validation messages appear
9. **Invalid Address Handling** - Tests graceful error handling for non-serviceable addresses

## Configuration

Tests are configured in `playwright.config.ts` and target:
- **Base URL**: `https://app-qa.casella.com`
- **Browser**: Chromium
- **Retries**: 2 in CI, 0 locally
