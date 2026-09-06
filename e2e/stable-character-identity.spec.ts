import { test, expect } from '@playwright/test';

test('crawler rename preserves stable identity and portrait alias', async ({ page }) => {
  await page.goto('/crawler-companion');
  await page.waitForFunction(() => Boolean((window as any).__ccCharacterIdentity));
  const result=await page.evaluate(() => {
    const mod=(window as any).__ccCharacterIdentity;
    const oldName='Identity Test Adam';
    const newName='Identity Test Willow';
    const id='11111111-2222-4333-8444-555555555555';
    const portrait='data:image/png;base64,identity-test';
    localStorage.setItem(`cc-character-portrait:${encodeURIComponent(oldName)}`,portrait);
    mod.rememberCharacterIdentity(oldName,id);
    mod.rememberCharacterIdentity(newName,id);
    return {
      oldId:localStorage.getItem(`cc-character-cloud-id:${encodeURIComponent(oldName)}`),
      newId:localStorage.getItem(`cc-character-cloud-id:${encodeURIComponent(newName)}`),
      migratedPortrait:localStorage.getItem(`cc-character-portrait:${encodeURIComponent(newName)}`),
      reverseName:localStorage.getItem(`cc-character-name-by-id:${encodeURIComponent(id)}`),
    };
  });
  expect(result.oldId).toBe('11111111-2222-4333-8444-555555555555');
  expect(result.newId).toBe(result.oldId);
  expect(result.migratedPortrait).toBe('data:image/png;base64,identity-test');
  expect(result.reverseName).toBe('Identity Test Willow');
});

test('stable identity prefers the crawler object id over a display-name lookup', async ({ page }) => {
  await page.goto('/crawler-companion');
  await page.waitForFunction(() => Boolean((window as any).__ccCharacterIdentity));
  const id=await page.evaluate(() => {
    const mod=(window as any).__ccCharacterIdentity;
    return mod.stableCharacterId('Renamed Crawler',{id:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'},true);
  });
  expect(id).toBe('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
});
