import { test, expect } from '@playwright/test';

test('app uses one primary navigation without duplicate workspace tabs', async ({ page }) => {
  await page.goto('/crawler-companion');
  await expect(page.getByRole('navigation',{name:'Primary navigation'})).toBeVisible();
  await expect(page.locator('#cc-workspace-tabs')).toHaveCount(0);
  await expect(page.locator('#cc-workspace-dice')).toHaveCount(0);
});

test('injected panels follow the selected primary tab', async ({ page }) => {
  await page.goto('/crawler-companion');
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await nav.getByRole('button',{name:'Combat',exact:true}).click();
  await expect(page.locator('#cc-combat-damage')).toBeVisible();
  await expect(page.locator('#cc-runtime-gm-tools')).toBeHidden();
  await nav.getByRole('button',{name:'GM Tools',exact:true}).click();
  await expect(page.locator('#cc-runtime-gm-tools')).toBeVisible();
  await expect(page.locator('#cc-combat-damage')).toBeHidden();
  await nav.getByRole('button',{name:'Campaign',exact:true}).click();
  await expect(page.locator('#cc-campaign-context')).toBeVisible();
  await expect(page.locator('#cc-runtime-gm-tools')).toBeHidden();
});
