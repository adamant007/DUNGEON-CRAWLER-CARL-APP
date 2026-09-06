import { expect, test } from '@playwright/test';
import fs from 'node:fs';

async function openCompanion(page:any){
  await page.goto('/');
  const link=page.getByRole('link',{name:/Crawler Companion/i});
  if(await link.count()) await link.first().click();
  await expect(page.getByRole('navigation',{name:'Primary navigation'})).toBeVisible();
}

test('runtime fixes are wired into the build', async () => {
  const html=fs.readFileSync('index.html','utf8');
  const runtime=fs.readFileSync('src/runtime-fixes.ts','utf8');
  const brand=fs.readFileSync('public/brand/brand.css','utf8');
  expect(html).toContain('/src/runtime-fixes.ts');
  expect(runtime).toContain('© 2026 Ginger Dragon Fire Studios');
  expect(runtime).toContain("cloudPushEvent(select.value,'announcement'");
  expect(runtime).toContain('Generate NPC');
  expect(runtime).toContain('Generate Room');
  expect(runtime).toContain('Generate Quest');
  expect(runtime).toContain('Generate Encounter');
  expect(runtime).toContain('Delete Character');
  expect(runtime).toContain('cc-dice-tray');
  expect(brand).not.toContain("ginger-dragon-fire-full.webp");
});

test('GM quick generators are usable', async ({page}) => {
  await openCompanion(page);
  await page.getByRole('button',{name:'GM Tools',exact:true}).click();
  await expect(page.getByRole('button',{name:'🧑 Generate NPC'})).toBeVisible();
  await page.getByRole('button',{name:'🧑 Generate NPC'}).click();
  await expect(page.locator('.cc-runtime-output')).toContainText('NPC:');
  await page.getByRole('button',{name:'🚪 Generate Room'}).click();
  await expect(page.locator('.cc-runtime-output')).toContainText('ROOM:');
  await page.getByRole('button',{name:'📜 Generate Quest'}).click();
  await expect(page.locator('.cc-runtime-output')).toContainText('QUEST:');
  await page.getByRole('button',{name:'⚔️ Generate Encounter'}).click();
  await expect(page.locator('.cc-runtime-output')).toContainText('ENCOUNTER:');
  await expect(page.getByLabel('Announcement message')).toBeVisible();
});

test('footer has 2026 copyright and roadmap badge is gone', async ({page}) => {
  await openCompanion(page);
  await expect(page.getByText('© 2026 Ginger Dragon Fire Studios',{exact:true})).toBeVisible();
  await expect(page.getByText('Roadmap Build',{exact:true})).toHaveCount(0);
});

test('mobile tab navigation keeps selected section reachable', async ({page},testInfo) => {
  test.skip(!testInfo.project.name.includes('phone'),'Phone-only interaction check');
  await openCompanion(page);
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await nav.getByRole('button',{name:'GM Tools',exact:true}).click();
  await expect(page.getByText('GM Command Center',{exact:false})).toBeVisible();
  const box=await page.locator('.app>main').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeLessThan(page.viewportSize()!.height);
});
