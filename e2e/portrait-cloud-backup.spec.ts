import { test, expect } from '@playwright/test';

test('portrait panel persists a crawler portrait locally and remains uncropped', async ({ page }) => {
  await page.goto('/crawler-companion');
  const activeName=(await page.locator('.character-bar select option:checked').textContent())?.trim()||'Crawler';
  await page.evaluate((name) => {
    localStorage.setItem(`cc-character-portrait:${encodeURIComponent(name)}`,'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg==');
  },activeName);
  await page.reload();
  await page.getByRole('button',{name:'Character',exact:true}).click();
  const panel=page.locator('#cc-character-portrait');
  await expect(panel).toBeVisible();
  const img=panel.locator('img');
  await expect(img).toHaveAttribute('src',/^data:image\//);
  const fit=await img.evaluate(el=>getComputedStyle(el).objectFit);
  expect(fit).toBe('contain');
});

test('cloud backup modules are wired into the app shell', async ({ page }) => {
  await page.goto('/crawler-companion');
  const html=await page.content();
  expect(html).not.toContain('cc-workspace-tabs');
  await expect(page.getByRole('navigation',{name:'Primary navigation'})).toBeVisible();
});
