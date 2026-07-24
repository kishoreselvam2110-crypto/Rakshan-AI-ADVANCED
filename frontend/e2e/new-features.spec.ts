import { test, expect } from '@playwright/test';

test('AI Scam Check Verification', async ({ page }) => {
  await page.goto('/scam-check', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Scam Detection Assistant')).toBeVisible();

  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();
  await textarea.fill('Taxi driver asking ₹1500 for a 5 km ride.');

  const submitButton = page.locator('button:has-text("Verify Scam Risk")');
  await expect(submitButton).toBeVisible();
  await submitButton.click();

  // Result card should appear with risk percentage and action suggestions
  await expect(page.locator('text=AI SCAM ANALYSIS')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('text=RECOMMENDED TRAVEL SECURITY ACTION')).toBeVisible();
});

test('Connectivity Prediction Verification', async ({ page }) => {
  await page.goto('/connectivity', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Connectivity Prediction')).toBeVisible();

  // Should display the status widgets
  await expect(page.locator('text=Network Protocol')).toBeVisible();
  await expect(page.locator('text=Signal Health')).toBeVisible();
  await expect(page.locator('text=Suggested Actions')).toBeVisible();
});

test('Lost Item Assistant Verification', async ({ page }) => {
  await page.goto('/lost-item', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Lost Item Assistant')).toBeVisible();

  // Click on Lost Passport card
  const passportCard = page.locator('h3:has-text("Lost Passport")');
  await expect(passportCard).toBeVisible();
  await passportCard.click();

  // Steps checklist and secure vault should be visible
  await expect(page.locator('text=Recovery Progress')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('text=Secure Document Vault')).toBeVisible();
  await expect(page.locator('text=Step 1:')).toBeVisible();
});
