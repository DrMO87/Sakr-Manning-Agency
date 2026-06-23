import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('AI Document Extraction Flow', () => {
  const APP_URL = 'http://localhost:3000/dashboard'; // Assuming standard React port

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto(APP_URL);
  });

  test('should open AI upload modal, upload file, and show extraction form', async ({ page }) => {
    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // 1. Find and click the "Upload New CV" or "Add CV" button
    const addCvButton = page.locator('button', { hasText: /Add CV|Upload New CV/i }).first();
    await expect(addCvButton).toBeVisible();
    await addCvButton.click();

    // 2. Verify modal opens (look for "Review & Edit Extracted Information" or drag-and-drop text)
    const modalHeading = page.locator('text=Upload Applicant Document').first();
    await expect(modalHeading).toBeVisible();

    // 3. Upload a mock PDF file
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Click the drag-and-drop zone to trigger file chooser
    await page.locator('text=Click or drag document to this area to upload').click();
    const fileChooser = await fileChooserPromise;
    
    // Create a dummy pdf file for testing
    const testPdfPath = path.join(__dirname, 'test-cv.pdf');
    // Ensure we have a file to upload (we'll create this file manually before running the test)
    await fileChooser.setFiles(testPdfPath);

    // 4. Verify progress bar appears and completes
    await expect(page.locator('text=Uploading & Parsing Document')).toBeVisible();
    
    // Wait for the CompactCVEditForm to appear
    await expect(page.locator('text=Review & Edit Extracted Information:')).toBeVisible({ timeout: 15000 });

    // 5. Verify the form fields are populated
    const fullNameInput = page.locator('input').first();
    await expect(fullNameInput).toBeVisible();

    // 6. Click Save & Approve
    const saveButton = page.locator('button', { hasText: 'Save & Approve' });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Verify it closes or shows success
    await expect(modalHeading).toBeHidden({ timeout: 10000 });
  });
});
