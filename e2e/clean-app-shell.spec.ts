import { expect, test } from '@playwright/test';

test('clean app shell is isolated and navigates without legacy panels', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Crawler Companion/i }).click();

  const primary = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(primary).toBeVisible();
  await primary.getByRole('button', { name: 'TEST APP', exact: true }).click();

  const shell = page.getByTestId('clean-app-shell');
  await expect(shell).toBeVisible();
  await expect(shell.getByRole('heading', { name: 'Crawler Companion', exact: true })).toBeVisible();
  await expect(shell.getByRole('heading', { name: 'Character', exact: true })).toBeVisible();

  await page.screenshot({ path: 'test-results/clean-app-shell-main.png', fullPage: true });

  const cleanNav = shell.getByRole('navigation', { name: 'Clean app navigation' });
  await cleanNav.getByRole('button', { name: 'GM Tools', exact: true }).click();
  await expect(shell.getByRole('heading', { name: 'GM Tools', exact: true })).toBeVisible();
  await expect(shell.getByText('Nothing legacy is mounted here.')).toBeVisible();

  await expect(shell.locator('#cc-runtime-gm-tools')).toHaveCount(0);
  await expect(shell.locator('#cc-character-dashboard-v2')).toHaveCount(0);
});
