import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('restore script permanently injects HP damage resist into core', async () => {
  const restore = fs.readFileSync('scripts/restore-source.mjs','utf8');
  const bridge = fs.readFileSync('src/core-hp-integration.ts','utf8');
  const damage = fs.readFileSync('src/combat-damage.ts','utf8');
  expect(restore).toContain("import './core-hp-integration';");
  expect(restore).toContain('injectCoreIntegration("src/main.tsx")');
  expect(bridge).toContain("document.addEventListener('click',handleClick,true)");
  expect(bridge).toContain('applyDamage(amount,damageType(context))');
  expect(bridge).toContain('ccApplyDamage');
  expect(damage).toContain('incoming-resist.total');
  expect(damage).toContain("kind:'damage'");
});
