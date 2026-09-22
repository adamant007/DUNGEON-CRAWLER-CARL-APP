import { expect, test } from '@playwright/test';
import fs from 'node:fs';

const gmEmail = process.env.E2E_GM_EMAIL;
const gmPassword = process.env.E2E_GM_PASSWORD;

test('current product contracts include guest crawlers, GM editing, and expandable inventory', async () => {
  const app = fs.readFileSync('src/App.jsx', 'utf8');
  const api = fs.readFileSync('src/api/supabaseCompat.js', 'utf8');
  const gm = fs.readFileSync('src/pages/GmTools.jsx', 'utf8');
  const storage = fs.readFileSync('src/components/character/characterStorage.js', 'utf8');

  expect(app).toContain('path="/campaign"');
  expect(app).toContain('path="/gm-tools"');
  expect(app).toContain('path="/claim"');

  expect(api).toContain('/rest/v1/rpc/create_guest_crawler');
  expect(api).toContain('/rest/v1/rpc/claim_guest_crawler');
  expect(api).toContain('/rest/v1/rpc/gm_update_campaign_character');

  expect(gm).toContain('Create Guest Crawler');
  expect(gm).toContain('OPEN / EDIT SHEET');
  expect(gm).toContain('/claim?token=');

  expect(storage).toContain('MIN_INVENTORY_ROWS = 4');
  expect(storage).toContain('padRows(r.inventory, MIN_INVENTORY_ROWS');
});

test('public home, login, register, and claim-link error states render', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Crawler Companion' })).toBeVisible();
  await expect(page.getByText('GINGER DRAGON STUDIOS', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /GET STARTED/i })).toBeVisible();

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();

  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await expect(page.getByLabel('Confirm Password')).toBeVisible();

  await page.goto('/claim');
  await expect(page.getByRole('heading', { name: 'Claim Your Crawler' })).toBeVisible();
  await expect(page.getByText(/missing its token/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'RETURN HOME' })).toBeVisible();
});

test('configured GM account can open the current campaign and GM character viewer', async ({ page }) => {
  test.skip(!gmEmail || !gmPassword, 'Set E2E_GM_EMAIL and E2E_GM_PASSWORD for authenticated production smoke.');

  await page.goto('/login');
  await page.getByLabel('Email').fill(gmEmail!);
  await page.getByLabel('Password').fill(gmPassword!);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 });

  await page.goto('/campaign');
  await expect(page.getByRole('heading', { name: 'Your Dungeon Tables' })).toBeVisible();

  await page.goto('/gm-tools');
  await expect(page.getByRole('heading', { name: 'Campaign Character Viewer' })).toBeVisible();
});
