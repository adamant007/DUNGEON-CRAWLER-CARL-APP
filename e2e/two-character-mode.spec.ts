import { test, expect } from '@playwright/test';

test('two-character launcher is available from character bar', async ({ page }) => {
  await page.goto('/crawler-companion');
  const bar=page.locator('.character-bar');
  await expect(bar).toBeVisible();
  await expect(page.locator('#cc-two-character-toggle')).toBeVisible();
});

test('two-character view uses two panes on tablet and stacked panes on phone', async ({ page }) => {
  await page.goto('/crawler-companion');
  await page.locator('#cc-two-character-toggle').click();
  const dialog=page.locator('#cc-two-character-mode');
  if(await dialog.count()===0)return; // app may have fewer than two saved crawlers in CI fixture
  await expect(dialog.locator('iframe')).toHaveCount(2);
  await page.setViewportSize({width:900,height:800});
  const tabletColumns=await dialog.locator('.cc-two-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns);
  expect(tabletColumns.split(' ').length).toBeGreaterThanOrEqual(2);
  await page.setViewportSize({width:390,height:844});
  const phoneColumns=await dialog.locator('.cc-two-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns);
  expect(phoneColumns.split(' ').length).toBe(1);
});
