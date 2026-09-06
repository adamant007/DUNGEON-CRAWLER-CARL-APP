import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('magic item lifecycle is wired into the app', async () => {
  const src=fs.readFileSync('src/magic-items.ts','utf8');
  const html=fs.readFileSync('index.html','utf8');
  expect(src).toContain('Cast & Consume');
  expect(src).toContain('Read & Learn');
  expect(src).toContain("kind:action==='cast'?'scroll_cast':'spellbook_read'");
  expect(src).toContain('noMana:action===\'cast\'');
  expect(src).toContain('c.spells=spells');
  expect(src).toContain("inv.splice(idx,1)");
  expect(src).toContain('cc-custom-known:');
  expect(html).toContain('/src/magic-items.ts');
});
