import { test, expect } from '@playwright/test';

async function openSmartLoot(page:any){
  await page.goto('/crawler-companion');
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await expect(nav).toBeVisible();
  await nav.getByRole('button',{name:'GM Tools',exact:true}).click();
  const input=page.getByLabel('Smart loot count');
  await expect(input).toBeVisible();
  return input;
}

test('smart loot count can be cleared and retyped', async ({ page }) => {
  const input=await openSmartLoot(page);
  await input.fill('');
  await expect(input).toHaveValue('');
  await input.fill('13');
  await expect(input).toHaveValue('13');
});

test('smart loot preview contains no duplicate item names', async ({ page }) => {
  const input=await openSmartLoot(page);
  await input.fill('13');
  await page.getByRole('button',{name:/Generate Preview/}).click();
  const output=page.locator('[data-smart-out]');
  await expect(output).toBeVisible();
  const text=(await output.textContent())||'';
  const names=text.split('\n').filter(line=>/^\d+\. /.test(line)).map(line=>line.replace(/^\d+\.\s+\S+\s+/,'').split(' [')[0].trim());
  expect(names.length).toBeGreaterThan(0);
  expect(new Set(names).size).toBe(names.length);
});
