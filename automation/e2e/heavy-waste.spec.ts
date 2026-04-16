import { test, expect } from '@playwright/test';
import { POSTCODES, EXPECTED_VALUES, SKIP_SIZES } from '../fixtures/test-data';

test.describe('Heavy Waste Booking Flow - Disabled Skips', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to booking page with clean state
    await page.goto('/booking');
  });

  test('complete heavy waste booking with disabled skips validation', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Step 1: Enter postcode and select address (condensed - same as general waste)
    const postcodeInput = page.getByTestId('postcode-input');
    await postcodeInput.fill(POSTCODES.VALID_WITH_ADDRESSES);

    const findAddressBtn = page.getByTestId('find-address-btn');
    await expect(findAddressBtn).toBeEnabled();
    await findAddressBtn.click();
    
    const addressSelect = page.getByTestId('address-select');
    await expect(addressSelect).toBeVisible();
    await addressSelect.selectOption({ index: 1 });
    
    await page.getByTestId('next-btn').click();
    
    // Step 2: Select Heavy Waste
    // Assert: Step 2 is active
    await expect(page.locator('nav[aria-label="Booking progress"]')).toContainText('Waste Type');
    
    // Click Heavy Waste card
    const heavyWasteCard = page.getByTestId('waste-type-heavy');
    await heavyWasteCard.click();
    
    // Assert: Plasterboard options are NOT visible (no branching for heavy waste)
    const plasterboardOptions = page.getByTestId('plasterboard-option-bag_it');
    await expect(plasterboardOptions).not.toBeVisible();
    
    // Click Next to proceed to Step 3
    await page.getByTestId('next-btn').click();
    
    // Step 3: Skip selection with disabled skips
    // Assert: Step 3 is active
    await expect(page.locator('nav[aria-label="Booking progress"]')).toContainText('Skip');
    
    // Assert: Skip grid is visible
    const skipCards = page.locator('[data-testid^="skip-card-"]');
    await expect(skipCards).toHaveCount(EXPECTED_VALUES.TOTAL_SKIP_COUNT);
    
    // Assert: At least 2 skips are disabled for heavy waste
    const disabledSkips = page.locator('[data-testid^="skip-card-"][aria-disabled="true"]');
    const disabledCount = await disabledSkips.count();
    expect(disabledCount).toBeGreaterThanOrEqual(EXPECTED_VALUES.MIN_DISABLED_SKIPS_HEAVY_WASTE);
    
    // Assert: Disabled skip cards show "not available" or similar text
    const firstDisabledSkip = disabledSkips.first();
    await expect(firstDisabledSkip).toContainText(/not available|unavailable/i);
    
    // Attempt to select a disabled skip - should not change selection state
    const disabledSkipTestId = await firstDisabledSkip.getAttribute('data-testid');
    await firstDisabledSkip.click({ force: true });
    
    // Assert: Disabled skip is still not selected (aria-checked should be false or not present)
    const isChecked = await firstDisabledSkip.getAttribute('aria-checked');
    expect(isChecked).not.toBe('true');
    
    // Select an enabled skip (find first enabled skip)
    const enabledSkip = page.locator('[data-testid^="skip-card-"][aria-disabled="false"]').first();
    await enabledSkip.click();
    
    // Assert: Enabled skip is now selected
    await expect(enabledSkip).toHaveAttribute('aria-checked', 'true');
    
    // Click Next to proceed to Step 4
    await page.getByTestId('next-btn').click();
    
    // Step 4: Review and confirm
    // Assert: Review step is active
    await expect(page.locator('nav[aria-label="Booking progress"]')).toContainText('Review');
    
    // Assert: Waste type shows "Heavy"
    const reviewWasteType = page.getByTestId('review-waste-type');
    await expect(reviewWasteType).toContainText('Heavy');
    
    // Click Confirm Booking
    const confirmBtn = page.getByTestId('confirm-btn');
    await confirmBtn.click();
    
    // Assert: Confirm button is disabled immediately
    await expect(confirmBtn).toBeDisabled();
    
    // Assert: Success confirmation is visible
    const bookingConfirmation = page.getByTestId('booking-confirmation');
    await expect(bookingConfirmation).toBeVisible({ timeout: 10000 });
    
    // Assert: Booking ID matches expected pattern
    const bookingId = page.getByTestId('booking-id');
    const bookingIdText = await bookingId.textContent();
    expect(bookingIdText).toMatch(EXPECTED_VALUES.BOOKING_ID_PATTERN);
  });
});
