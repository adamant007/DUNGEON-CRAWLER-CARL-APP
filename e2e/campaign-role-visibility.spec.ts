import { test, expect } from '@playwright/test';

test('campaign role visibility module is wired and loot guard uses explicit role', async ({ page }) => {
  await page.goto('/crawler-companion');
  const html=await page.content();
  expect(html).toContain('campaign-role-visibility');

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-cc-campaign-role','player');
    const panel=document.createElement('section');
    panel.id='cc-runtime-gm-tools';
    document.body.appendChild(panel);
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
  await page.waitForTimeout(100);
  await expect(page.locator('#cc-loot-box-reveal')).toHaveCount(0);
});
