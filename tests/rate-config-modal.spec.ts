import { test, expect } from '@playwright/test';

// Test the manual rate config modal

test.describe('RateConfigModal', () => {
  test('can open, set, and save a manual rate', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Open the modal (assume a button exists to open it)
    const openBtn = page.getByRole('button', { name: /electricity rate/i });
    await openBtn.click();
    // Enter a new rate
    const input = page.getByLabel('Rate ($ per kWh)');
    await input.fill('0.222');
    // Save
    await page.getByRole('button', { name: /save rate/i }).click();
    // Modal should close and rate should update
    await expect(page.getByText('Current Rate: $0.2220/ kWh')).toBeVisible();
  });
});
