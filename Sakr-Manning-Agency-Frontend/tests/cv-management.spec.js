import { test, expect } from '@playwright/test';

test.describe('CV Management Flow', () => {
  const APP_URL = 'http://localhost:3000/dashboard'; // Assuming standard React port

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto(APP_URL);
  });

  test('should display CVs and open preview modal', async ({ page }) => {
    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // 1. Verify that CV cards are rendering in the main grid
    const cvCard = page.locator('div[class*="MuiCard-root"]').first();
    // Assuming the cards have some text like "Rank" or "Experience"
    await expect(cvCard).toBeVisible({ timeout: 15000 });

    // 2. Click on a CV card or "View Details" button to open the preview modal
    const viewButton = cvCard.locator('button', { hasText: /View|Details|Preview/i }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
    } else {
      await cvCard.click();
    }

    // 3. Verify the CV Preview Modal opens
    const previewModal = page.locator('text=Applicant Details').first(); // Or whatever the header is
    await expect(previewModal).toBeVisible();

    // 4. Verify some details exist in the modal
    const closeButton = page.locator('button', { hasText: 'Close' }).first();
    await expect(closeButton).toBeVisible();

    // 5. Close the modal
    await closeButton.click();
    await expect(previewModal).toBeHidden();
  });
});
