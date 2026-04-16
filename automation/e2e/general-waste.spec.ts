import { test, expect } from '@playwright/test';
import { POSTCODES, EXPECTED_VALUES, SKIP_SIZES } from '../fixtures/test-data';

test.describe('General Waste Booking Flow - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to booking page with clean state
    await page.goto('/booking');
  });

  test('complete general waste booking from postcode to confirmation', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Step 1: Enter postcode and find address
    // Assert: Postcode input is visible
    const postcodeInput = page.getByTestId('postcode-input');
    await expect(postcodeInput).toBeVisible();
    
    // Enter valid postcode with addresses
    await postcodeInput.fill(POSTCODES.VALID_WITH_ADDRESSES);

    // Click find address button - wait for it to be enabled
    const findAddressBtn = page.getByTestId('find-address-btn');
    await expect(findAddressBtn).toBeEnabled();
    await findAddressBtn.click();
    
    // Assert: Address dropdown appears with minimum expected addresses
    const addressSelect = page.getByTestId('address-select');
    await expect(addressSelect).toBeVisible();
    
    // Count options (excluding placeholder)
    const options = await addressSelect.locator('option').count();
    expect(options).toBeGreaterThanOrEqual(EXPECTED_VALUES.MIN_ADDRESSES_FOR_VALID + 1); // +1 for placeholder
    
    // Select first real address (index 1, skipping placeholder)
    await addressSelect.selectOption({ index: 1 });
    
    // Click Next to proceed to Step 2
    const nextBtn = page.getByTestId('next-btn');
    await nextBtn.click();
    
    // Step 2: Select waste type
    // Assert: Step 2 is active in step indicator
    await expect(page.locator('nav[aria-label="Booking progress"]')).toContainText('Waste Type');
    
    // Click General Waste card
    const generalWasteCard = page.getByTestId('waste-type-general');
    await generalWasteCard.click();
    
    // Assert: Plasterboard options are NOT visible (no branching for general waste)
    const plasterboardOptions = page.getByTestId('plasterboard-option-bag_it');
    await expect(plasterboardOptions).not.toBeVisible();
    
    // Click Next to proceed to Step 3
    await page.getByTestId('next-btn').click();
    
    // Step 3: Select skip
    // Assert: Step 3 is active
    await expect(page.locator('nav[aria-label="Booking progress"]')).toContainText('Skip');
    
    // Assert: Skip grid is visible with all 8 cards
    const skipCards = page.locator('[data-testid^="skip-card-"]');
    await expect(skipCards).toHaveCount(EXPECTED_VALUES.TOTAL_SKIP_COUNT);
    
    // Assert: No skips are disabled for general waste
    const disabledSkips = page.locator('[data-testid^="skip-card-"][aria-disabled="true"]');
    await expect(disabledSkips).toHaveCount(0);
    
    // Select the 4-yard skip
    const fourYardSkip = page.getByTestId(`skip-card-${SKIP_SIZES.FOUR_YARD}`);
    await fourYardSkip.click();
    
    // Assert: Selected skip has selected state (check for selected class or aria-checked)
    await expect(fourYardSkip).toHaveAttribute('aria-checked', 'true');
    
    // Click Next to proceed to Step 4
    await page.getByTestId('next-btn').click();
    
    // Step 4: Review and confirm
    // Assert: Review step is active
    await expect(page.locator('nav[aria-label="Booking progress"]')).toContainText('Review');
    
    // Assert: All booking details are shown correctly
    const reviewPostcode = page.getByTestId('review-postcode');
    await expect(reviewPostcode).toContainText(POSTCODES.VALID_WITH_ADDRESSES);
    
    const reviewWasteType = page.getByTestId('review-waste-type');
    await expect(reviewWasteType).toContainText('General');
    
    const reviewSkipSize = page.getByTestId('review-skip-size');
    await expect(reviewSkipSize).toContainText(SKIP_SIZES.FOUR_YARD);
    
    const reviewPrice = page.getByTestId('review-price');
    await expect(reviewPrice).toBeVisible();
    
    // Click Confirm Booking
    const confirmBtn = page.getByTestId('confirm-btn');
    await confirmBtn.click();
    
    // Assert: Confirm button is disabled immediately after click (prevents double-submit)
    await expect(confirmBtn).toBeDisabled();
    
    // Assert: Success confirmation is visible
    const bookingConfirmation = page.getByTestId('booking-confirmation');
    await expect(bookingConfirmation).toBeVisible({ timeout: 10000 });
    
    // Assert: Booking ID is displayed and matches expected pattern
    const bookingId = page.getByTestId('booking-id');
    await expect(bookingId).toBeVisible();
    const bookingIdText = await bookingId.textContent();
    expect(bookingIdText).toMatch(EXPECTED_VALUES.BOOKING_ID_PATTERN);
  });
});
