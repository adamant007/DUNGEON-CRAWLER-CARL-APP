import { test, expect } from '@playwright/test';

test('workspace tabs isolate panels and dice rolls', async ({ page }) => {
  await page.goto('/crawler-companion');
  await expect(page.locator('#cc-workspace-tabs')).toBeVisible();
  await expect(page.getByRole('button',{name:/Dice/})).toBeVisible();
  await page.getByRole('button',{name:/Dice/}).click();
  await expect(page.locator('#cc-workspace-dice')).toBeVisible();
  await page.locator('[data-dice-count]').fill('3');
  await page.locator('[data-dice-sides]').selectOption('20');
  await page.locator('[data-roll]').click();
  await expect(page.locator('[data-total]')).toContainText('3d20 =');
  await page.getByRole('button',{name:/Sheet/}).click();
  await expect(page.locator('#cc-workspace-dice')).toBeHidden();
});

test('only selected injected workspace panel is shown', async ({ page }) => {
  await page.goto('/crawler-companion');
  await page.getByRole('button',{name:/Combat/}).click();
  const visibleInjected=page.locator('#cc-spell-system:visible,#cc-equipment-stats:visible,#cc-combat-damage:visible,#cc-workspace-dice:visible,#cc-campaign-context:visible,#cc-runtime-gm-tools:visible');
  await expect(visibleInjected).toHaveCount(1);
});
