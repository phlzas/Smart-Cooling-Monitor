import { test, expect } from '@playwright/test';

test.describe('RateConfigModal Advanced', () => {
  test('preset buttons fill input and save', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const openBtn = page.getByRole('button', { name: /electricity rate/i });
    await openBtn.click();
    // Click each preset and save, check value
    const presets = [
      { label: /residential/i, value: '0.130' },
      { label: /commercial/i, value: '0.110' },
      { label: /industrial/i, value: '0.070' },
      { label: /data center/i, value: '0.050' },
    ];
    for (const preset of presets) {
      await page.getByRole('button', { name: preset.label }).click();
      const input = page.getByLabel('Rate ($ per kWh)');
      await expect(input).toHaveValue(preset.value);
      await page.getByRole('button', { name: /save rate/i }).click();
      await expect(page.getByText(new RegExp(`Current Rate: \$${preset.value}0/ kWh`))).toBeVisible();
      // Reopen for next preset
      await openBtn.click();
    }
  });

  test('cancel does not change rate', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const openBtn = page.getByRole('button', { name: /electricity rate/i });
    await openBtn.click();
    const input = page.getByLabel('Rate ($ per kWh)');
    await input.fill('0.199');
    await page.getByRole('button', { name: /cancel/i }).click();
    // Should not see 0.199 as current rate
    await expect(page.getByText('Current Rate: $0.1990/ kWh')).not.toBeVisible();
  });

  test('reset to EIA rate button works', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const openBtn = page.getByRole('button', { name: /electricity rate/i });
    await openBtn.click();
    const input = page.getByLabel('Rate ($ per kWh)');
    await input.fill('0.199');
    // Save manual rate
    await page.getByRole('button', { name: /save rate/i }).click();
    await expect(page.getByText('Current Rate: $0.1990/ kWh')).toBeVisible();
    // Reopen and reset
    await openBtn.click();
    await page.getByRole('button', { name: /reset to eia rate/i }).click();
    // Modal should close, and rate should update to EIA (not 0.199)
    await expect(page.getByText('Current Rate: $0.1990/ kWh')).not.toBeVisible();
  });
});
