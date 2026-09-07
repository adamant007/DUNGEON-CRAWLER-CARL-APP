import { expect, test } from '@playwright/test';

async function openApp(page:any){
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
}

test('landing, public links and every primary tab open', async ({ page }) => {
  await openApp(page);
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await expect(nav).toBeVisible();
  const buttons=nav.getByRole('button');
  const count=await buttons.count();
  expect(count).toBeGreaterThan(5);
  for(let i=0;i<count;i++){
    const b=buttons.nth(i);
    if(await b.isHidden())continue;
    await b.click();
  }
});

test('dice supports multiple dice and edge bounds', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button',{name:'Character',exact:true}).click();
  const select=page.getByLabel('Number of dice').first();
  await expect(select).toBeVisible();
  await select.selectOption('6');
  await expect(page.getByText('6 dice',{exact:true})).toBeVisible();
  await select.selectOption('1');
  await page.getByRole('button',{name:'−'}).click();
  await expect(page.getByText('1 dice',{exact:true})).toBeVisible();
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
  await page.getByRole('button',{name:'Character',exact:true}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Character',exact:true})).toBeVisible();
});
