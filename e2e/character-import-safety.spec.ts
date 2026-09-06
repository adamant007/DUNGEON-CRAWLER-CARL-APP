import { test, expect } from '@playwright/test';

test('character import creates a safe rollback without auth data', async ({ page }) => {
  await page.goto('/crawler-companion');
  await page.evaluate(() => {
    localStorage.setItem('cc-character-test','{"name":"Before Import","hp":10}');
    localStorage.setItem('supabase.auth.token','secret-should-not-be-backed-up');
    const input=document.createElement('input');
    input.type='file';
    input.id='character-import-test';
    input.accept='.json,application/json';
    input.setAttribute('aria-label','Import Character');
    document.body.appendChild(input);
  });
  const input=page.locator('#character-import-test');
  await input.setInputFiles({name:'crawler.json',mimeType:'application/json',buffer:Buffer.from('{"name":"Imported"}')});
  await expect(page.locator('#cc-import-safety-notice')).toBeVisible();
  const backup=await page.evaluate(() => sessionStorage.getItem('cc-import-safety-backup'));
  expect(backup).toContain('cc-character-test');
  expect(backup).toContain('Before Import');
  expect(backup).not.toContain('secret-should-not-be-backed-up');
});
