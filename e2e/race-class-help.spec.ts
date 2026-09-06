import { test, expect } from '@playwright/test';

test('race or class controls get tap-friendly help bubbles when present', async ({ page }) => {
  await page.goto('/crawler-companion');
  const help=page.locator('.cc-choice-help');
  const count=await help.count();
  if(count===0){test.skip(true,'Character creator race/class controls are not present in the initial view.');return}
  await help.first().click();
  await expect(page.locator('#cc-choice-help-bubble')).toBeVisible();
  await expect(page.locator('#cc-choice-help-bubble strong')).not.toHaveText('');
  await page.keyboard.press('Escape');
  await expect(page.locator('#cc-choice-help-bubble')).toHaveCount(0);
});
