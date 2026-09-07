import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('resource, brand, and final release modules are loaded', async () => {
  const html=fs.readFileSync('index.html','utf8');
  expect(html).toContain('/src/mobile-resource-hud.ts');
  expect(html).toContain('/src/mobile-brand.ts');
  expect(html).toContain('/src/final-beta-stabilizer.ts');
  expect(html).toContain('/src/final-release-fix.ts');
  expect(html).toContain('/src/exact-brand-banner.ts');
});

test('resource HUD contains both health and mana with ten-section tracks', async () => {
  const src=fs.readFileSync('src/mobile-resource-hud.ts','utf8');
  expect(src).toContain('❤️ HEALTH');
  expect(src).toContain('✨ MANA');
  expect(src).toContain('data-hp-track');
  expect(src).toContain('data-mp-track');
  expect(src).toContain('Array.from({length:10}');
  expect(src).toContain('cc:character-updated');
  expect(src).toContain('cc-resource-change');
});

test('health and mana stay stacked, full width, and chunky', async () => {
  const src=fs.readFileSync('src/mobile-resource-hud.ts','utf8');
  expect(src).toContain('grid-template-columns:minmax(0,1fr)');
  expect(src).toContain('.cc-hud-resource{min-width:0;width:100%}');
  expect(src).toContain('.cc-hud-track{height:22px;width:100%');
  expect(src).toContain('grid-template-columns:repeat(10,minmax(0,1fr))');
  expect(src).not.toContain('grid-template-columns:1fr 1fr');
});

test('approved Ginger Dragon hero uses the canonical brand asset without embedded banner data', async () => {
  const release=fs.readFileSync('src/final-release-fix.ts','utf8');
  const exact=fs.readFileSync('src/exact-brand-banner.ts','utf8');
  expect(fs.existsSync('public/brand/ginger-dragon-fire-full.webp')).toBeTruthy();
  expect(release).toContain("const APPROVED_HERO='/brand/ginger-dragon-fire-full.webp'");
  expect(release).toContain("img.alt='Ginger Dragon Studios approved dragon artwork'");
  expect(exact).toContain('object-fit:contain!important');
  expect(exact).not.toContain('data:image/webp;base64,');
});
