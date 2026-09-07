import { expect, test } from '@playwright/test';

test('landing renders final Ginger Dragon hero and Crawler Companion rook', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('img.studio-hero-art');
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute('src', '/brand/ginger-dragon-studios-hero.webp');
  const heroSize = await hero.evaluate((img: HTMLImageElement) => ({
    width: img.naturalWidth,
    height: img.naturalHeight,
    complete: img.complete,
  }));
  expect(heroSize.complete).toBeTruthy();
  expect(heroSize.width).toBeGreaterThan(400);
  expect(heroSize.height).toBeGreaterThan(400);

  const card = page.getByRole('link', { name: /Crawler Companion/i });
  await expect(card).toBeVisible();
  const rook = card.locator('img.crawler-companion-thumb');
  await expect(rook).toBeVisible();
  await expect(rook).toHaveAttribute('src', '/brand/crawler-companion-rook.webp');
  const rookSize = await rook.evaluate((img: HTMLImageElement) => ({
    width: img.naturalWidth,
    height: img.naturalHeight,
    complete: img.complete,
  }));
  expect(rookSize.complete).toBeTruthy();
  expect(rookSize.width).toBeGreaterThan(500);
  expect(rookSize.height).toBeGreaterThan(500);

  const legacy = card.locator('img[src*="app-icon.svg"], img[src*="ginger-dragon-fire"], img[src*="hero.webp"]');
  await expect(legacy).toHaveCount(0);

  console.log(`BRAND_RENDER_OK hero=${heroSize.width}x${heroSize.height} rook=${rookSize.width}x${rookSize.height}`);
});
