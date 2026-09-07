import { expect, test } from '@playwright/test';

test('clean app shell launches standalone without the legacy wrapper', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Crawler Companion/i }).click();

  const shell = page.getByTestId('clean-app-shell');
  await expect(shell).toBeVisible();
  await expect(shell.getByRole('heading', { name: 'Crawler Companion', exact: true })).toBeVisible();
  await expect(shell.getByRole('heading', { name: 'Character', exact: true })).toBeVisible();

  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toHaveCount(0);
  await expect(page.getByText('Character Wizard', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Account', exact: true })).toHaveCount(0);
  await expect(shell.locator('#cc-runtime-gm-tools')).toHaveCount(0);
  await expect(shell.locator('#cc-character-dashboard-v2')).toHaveCount(0);

  await page.screenshot({ path: 'test-results/clean-app-shell-main.png', fullPage: true });

  const cleanNav = shell.getByRole('navigation', { name: 'Clean app navigation' });
  await cleanNav.getByRole('button', { name: 'GM Tools', exact: true }).click();
  await expect(shell.getByRole('heading', { name: 'GM Tools', exact: true })).toBeVisible();
  await expect(shell.getByText('Nothing legacy is mounted here.')).toBeVisible();
});
