import { test, expect } from '@playwright/test';

test('campaign role visibility hides GM UI for players and loot guard uses explicit role', async ({ page }) => {
  await page.goto('/crawler-companion');
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  const gmButton=nav.getByRole('button',{name:'GM Tools',exact:true});
  await expect(gmButton).toBeVisible();

  // Let the app's initial async campaign-role refresh finish before this test
  // deliberately overrides the role. Otherwise that startup refresh can clear
  // the synthetic player role mid-assertion and make this check flaky.
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-cc-campaign-role','player');
    window.dispatchEvent(new CustomEvent('cc:campaign-role-changed',{detail:{role:'player'}}));
  });
  await expect(gmButton).toBeHidden();

  await page.evaluate(() => {
    const reveal=document.createElement('div');
    reveal.id='cc-loot-box-reveal';
    document.body.appendChild(reveal);
    window.dispatchEvent(new CustomEvent('cc:campaign-role-changed',{detail:{role:'player'}}));
  });
  await page.waitForTimeout(100);
  await expect(page.locator('#cc-loot-box-reveal')).toBeAttached();

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-cc-campaign-role','gm');
    window.dispatchEvent(new CustomEvent('cc:campaign-role-changed',{detail:{role:'gm'}}));
  });
  await expect(gmButton).toBeVisible();
  await page.waitForTimeout(100);
  await expect(page.locator('#cc-loot-box-reveal')).toHaveCount(0);
});
