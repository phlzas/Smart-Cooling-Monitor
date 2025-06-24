import { test, expect } from '@playwright/test';

test.describe('Diagnostics', () => {
  test('shows debug electricity rate', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Look for the debug rate (if visible)
    await expect(page.getByText(/@ \$/)).toBeVisible();
  });
});
