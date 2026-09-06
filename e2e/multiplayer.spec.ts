import { expect, test } from '@playwright/test';

const gmEmail = process.env.E2E_GM_EMAIL;
const gmPassword = process.env.E2E_GM_PASSWORD;
const playerEmail = process.env.E2E_PLAYER_EMAIL;
const playerPassword = process.env.E2E_PLAYER_PASSWORD;

async function openApp(page:any){
  await page.goto('/crawler-companion');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
}

async function login(page:any,email:string,password:string){
  await openApp(page);
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log In to Cloud' }).click();
  await expect(page.getByText('Real cloud account connected.', { exact: false })).toBeVisible({ timeout: 15_000 });
}

test('separate browser contexts isolate local state', async ({ browser }) => {
  const a = await browser.newContext();
  const b = await browser.newContext();
  const pa = await a.newPage();
  const pb = await b.newPage();
  await openApp(pa); await openApp(pb);
  await pa.evaluate(() => localStorage.setItem('e2e-isolation','gm'));
  await pb.evaluate(() => localStorage.setItem('e2e-isolation','player'));
  expect(await pa.evaluate(() => localStorage.getItem('e2e-isolation'))).toBe('gm');
  expect(await pb.evaluate(() => localStorage.getItem('e2e-isolation'))).toBe('player');
  await a.close(); await b.close();
});

test('cloud multi-login and campaign smoke', async ({ browser }) => {
  test.skip(!gmEmail || !gmPassword || !playerEmail || !playerPassword, 'Set E2E_GM_* and E2E_PLAYER_* secrets to run cloud multiplayer tests.');
  const gm = await browser.newContext();
  const player = await browser.newContext();
  const gp = await gm.newPage();
  const pp = await player.newPage();
  await login(gp, gmEmail!, gmPassword!);
  await login(pp, playerEmail!, playerPassword!);

  await gp.getByRole('button', { name: 'Campaign', exact: true }).click();
  const campaignName = `E2E ${Date.now()}`;
  await gp.getByLabel('Campaign Name').fill(campaignName);
  await gp.getByRole('button', { name: 'Create Campaign + Invite Code' }).click();
  await expect(gp.getByText(/Campaign created\. Invite code:/)).toBeVisible({ timeout: 15_000 });
  const msg = await gp.getByText(/Campaign created\. Invite code:/).textContent();
  const code = msg?.split('Invite code:')[1]?.trim();
  expect(code).toBeTruthy();

  await pp.getByRole('button', { name: 'Campaign', exact: true }).click();
  await pp.getByLabel('Invite Code').fill(code!);
  await pp.getByRole('button', { name: 'Join Campaign' }).click();
  await expect(pp.getByText(/Joined /)).toBeVisible({ timeout: 15_000 });

  await gm.close(); await player.close();
});
