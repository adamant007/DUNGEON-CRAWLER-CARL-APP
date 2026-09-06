import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const textFiles=['index.html','README.md','src/runtime-fixes.ts','src/spell-system.ts','src/custom-spells.ts'];

test('app-facing source does not use the DCC shorthand', async()=>{
  for(const file of textFiles){
    const full=path.join(root,file);if(!fs.existsSync(full))continue;
    const text=fs.readFileSync(full,'utf8');
    expect(text,`${file} must not use DCC as app shorthand`).not.toMatch(/\bDCC\b/);
  }
});

test('original spell lab is wired and clearly labeled custom', async()=>{
  const html=fs.readFileSync('index.html','utf8');
  const custom=fs.readFileSync('src/custom-spells.ts','utf8');
  expect(html).toContain('/src/custom-spells.ts');
  expect(custom).toContain('Original Spell Lab');
  expect(custom).toContain('CUSTOM ·');
  expect(custom).toContain('Invent Scroll');
  expect(custom).toContain('Invent Spellbook');
  expect(custom).toContain('No Mana cost when used');
  expect(custom).toContain('turns to dust after casting');
});

test('GM can generate an original scroll', async({page})=>{
  await page.goto('/');
  const link=page.getByRole('link',{name:/Crawler Companion/i});
  if(await link.count())await link.first().click();
  await page.getByRole('button',{name:'GM Tools',exact:true}).click();
  await expect(page.getByText('✨ Original Spell Lab',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'📜 Invent Scroll'}).click();
  await expect(page.locator('#cc-custom-spells [data-custom-output]')).toContainText('CUSTOM ·');
  await expect(page.locator('#cc-custom-spells [data-custom-output]')).toContainText('No Mana cost when used');
});
