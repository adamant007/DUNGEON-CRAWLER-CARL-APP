import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('mobile resource HUD and brand modules are loaded', async () => {
  const html=fs.readFileSync('index.html','utf8');
  expect(html).toContain('/src/mobile-resource-hud.ts');
  expect(html).toContain('/src/mobile-brand.ts');
});

test('resource HUD contains both health and mana bars', async () => {
  const src=fs.readFileSync('src/mobile-resource-hud.ts','utf8');
  expect(src).toContain('❤️ HEALTH');
  expect(src).toContain('✨ MANA');
  expect(src).toContain('data-hp-fill');
  expect(src).toContain('data-mp-fill');
  expect(src).toContain('cc:character-updated');
  expect(src).toContain('cc-resource-change');
});

test('health and mana stay stacked full width', async () => {
  const src=fs.readFileSync('src/mobile-resource-hud.ts','utf8');
  expect(src).toContain('grid-template-columns:minmax(0,1fr)');
  expect(src).toContain('.cc-hud-resource{min-width:0;width:100%}');
  expect(src).toContain('.cc-hud-track{height:14px;width:100%');
  expect(src).not.toContain('grid-template-columns:1fr 1fr');
});

test('mobile branding uses a real image element', async () => {
  const src=fs.readFileSync('src/mobile-brand.ts','utf8');
  expect(src).toContain("img.src='/brand/app-icon.svg'");
  expect(src).toContain("img.alt='Ginger Dragon Fire'");
  expect(src).toContain('@media(max-width:720px)');
});
