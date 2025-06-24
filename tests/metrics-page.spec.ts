import { test, expect } from '@playwright/test';

// Test the metrics page dropdown and diagnostics

test.describe('Metrics Page', () => {
  test('rate type dropdown changes electricity rate', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for dropdown to be enabled
    const dropdown = page.getByRole('combobox', { name: /rate type/i });
    await expect(dropdown).toBeEnabled();
    // Get current value
    const before = await page.locator('text=Current Rate:').textContent();
    // Change dropdown value
    await dropdown.selectOption('COM');
    // Wait for rate to update
    await expect(page.locator('text=Current Rate:')).not.toHaveText(before!);
  });

  test('shows loading overlay when fetching rates', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Simulate slow network or reload
    // Should see loading overlay at least briefly
    await expect(page.getByText('Loading electricity rates…')).toBeVisible();
  });
});
