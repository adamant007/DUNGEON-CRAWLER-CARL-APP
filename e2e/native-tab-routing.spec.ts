import { expect, test } from '@playwright/test';

test('runtime panels follow original primary tabs without duplicate workspace nav', async ({ page }) => {
  await page.goto('/crawler-companion');
  await expect(page.locator('#cc-workspace-tabs')).toHaveCount(0);
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await expect(nav).toBeVisible();
  await nav.getByRole('button',{name:'Combat',exact:true}).click();
  await expect(page.locator('#cc-combat-damage')).toBeVisible();
  await expect(page.locator('#cc-runtime-gm-tools')).toBeHidden();
  await nav.getByRole('button',{name:'Dice',exact:true}).click();
  await expect(nav.getByRole('button',{name:'Dice',exact:true})).toHaveClass(/active/);
  await nav.getByRole('button',{name:'GM Tools',exact:true}).click();
  await expect(page.locator('#cc-runtime-gm-tools')).toBeVisible();
});
