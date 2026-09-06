import { test, expect } from '@playwright/test';

test('smart loot count can be cleared and retyped', async ({ page }) => {
  await page.goto('/crawler-companion');
  const input=page.getByLabel('Smart loot count');
  await expect(input).toBeVisible();
  await input.fill('');
  await expect(input).toHaveValue('');
  await input.fill('13');
  await expect(input).toHaveValue('13');
});

test('smart loot preview contains no duplicate item names', async ({ page }) => {
  await page.goto('/crawler-companion');
  const input=page.getByLabel('Smart loot count');
  await input.fill('13');
  await page.getByRole('button',{name:/Generate Preview/}).click();
  const output=page.locator('[data-smart-out]');
  await expect(output).toBeVisible();
  const text=(await output.textContent())||'';
  const names=text.split('\n').filter(line=>/^\d+\. /.test(line)).map(line=>line.replace(/^\d+\.\s+\S+\s+/,'').split(' [')[0].trim());
  expect(names.length).toBeGreaterThan(0);
  expect(new Set(names).size).toBe(names.length);
});
