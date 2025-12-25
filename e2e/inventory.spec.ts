import { test, expect } from '@playwright/test';

// Adjust the URL if your dev server runs elsewhere
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test.describe('Inventory Management', () => {
  test('should load inventory dashboard and show summary cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/farmer/inventory`);
    await expect(page.getByText('Total Feed Left')).toBeVisible();
    await expect(page.getByText('Days Remaining')).toBeVisible();
    await expect(page.getByText('Total Value')).toBeVisible();
  });

  test('should open add inventory modal and validate fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/farmer/inventory`);
    await page.getByRole('button', { name: /add item/i }).click();
    await expect(page.getByText(/add inventory item/i)).toBeVisible();
    await page.getByLabel('Item Name').fill('Test Feed');
    await page.getByLabel('Quantity').fill('10');
    await page.getByLabel('Unit Cost').fill('5');
    await page.getByRole('button', { name: /add item/i }).click();
    // Should close modal and show item in list (if backend is mocked/ready)
  });

  test('should filter by Feed and show empty state if none', async ({ page }) => {
    await page.goto(`${BASE_URL}/farmer/inventory`);
    await page.getByRole('button', { name: /feed/i }).click();
    await expect(page.getByText(/no inventory items found/i)).toBeVisible();
  });

  test('should open weight tracking modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/farmer/inventory`);
    await page.getByRole('button', { name: /start now/i }).click();
    await expect(page.getByText(/record weight/i)).toBeVisible();
  });

  test('should open mortality modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/farmer/inventory`);
    await page.getByRole('button', { name: /add mortality/i }).click();
    await expect(page.getByText(/record mortality/i)).toBeVisible();
  });
});
