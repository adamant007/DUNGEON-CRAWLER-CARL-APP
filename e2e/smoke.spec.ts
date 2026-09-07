import { expect, test } from '@playwright/test';

function navButton(nav:any,label:string){
  return nav.locator('button').filter({hasText:new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`)}).first();
}

async function openApp(page:any){
  await page.goto('/');
  await expect(page.getByText('Ginger Dragon', { exact: false }).first()).toBeVisible();
  await page.getByRole('link', { name: /Crawler Companion/i }).click();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
}

test('landing, public links and every primary tab open', async ({ page, request }) => {
  await openApp(page);
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  for (const tab of ['Dashboard','Character','Combat','Inventory','Equipment','Progression','Dice','Party','Leaderboard','GM Tools','Rulebook','Campaign','Account','Tutorial']) {
    const b=navButton(nav,tab);
    if(await b.isHidden())continue;
    await b.click();
    if(tab!=='Tutorial') await expect(b).toHaveClass(/active/);
  }
  for (const path of ['/privacy.html','/support.html','/manifest.webmanifest']) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should load`).toBeTruthy();
  }
});

test('dice supports multiple dice and edge bounds', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Dice', exact: true }).click();
  const select = page.getByLabel('Number of dice').first();
  await expect(select).toBeVisible();
  await select.selectOption('6');
  await expect(page.getByText('6 dice', { exact: true })).toBeVisible();
  await select.selectOption('1');
  await page.getByRole('button', { name: '−' }).click();
  await expect(page.getByText('1 dice', { exact: true })).toBeVisible();
});

test('party and GM local flows survive rapid interaction', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Party', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Party Board' })).toBeVisible();
  await page.getByRole('button', { name: 'Side-by-Side' }).click();
  await expect(page.getByRole('button', { name: 'Party Board' })).toBeVisible();

  await page.getByRole('button', { name: 'GM Tools', exact: true }).click();
  const count = page.getByLabel('Loot item count');
  await expect(count).toBeVisible();
  await count.fill('12');
  await page.getByRole('button', { name: /Preview Box/i }).click();
  await expect(page.locator('#cc-loot-boxes [data-preview]')).toContainText('12.');
  await count.fill('');
  await count.blur();
  await expect(count).not.toHaveValue('');
});

test('refresh keeps local character data available', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Character', exact: true }).click();
  const name = page.locator('main label').filter({hasText:/^Name\s*$/}).locator('input').first();
  await expect(name).toBeVisible();
  await name.fill('E2E Persistence Crawler');
  await page.reload();
  await page.getByRole('button', { name: 'Character', exact: true }).click();
  await expect(page.locator('main label').filter({hasText:/^Name\s*$/}).locator('input').first()).toHaveValue('E2E Persistence Crawler');
});
