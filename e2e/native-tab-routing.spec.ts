import { expect, test } from '@playwright/test';

function navButton(nav:any,label:string){
  return nav.locator('button').filter({hasText:new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`)}).first();
}

test('runtime panels follow original primary tabs without duplicate workspace nav', async ({ page }) => {
  await page.goto('/crawler-companion');
  await expect(page.locator('#cc-workspace-tabs')).toHaveCount(0);
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await expect(nav).toBeVisible();
  await navButton(nav,'Combat').click();
  await expect(page.locator('#cc-combat-damage')).toBeVisible();
  await expect(page.locator('#cc-runtime-gm-tools')).toBeHidden();
  await navButton(nav,'Dice').click();
  await expect(navButton(nav,'Dice')).toHaveClass(/active/);
  await navButton(nav,'GM Tools').click();
  await expect(page.locator('#cc-runtime-gm-tools')).toBeVisible();
});
