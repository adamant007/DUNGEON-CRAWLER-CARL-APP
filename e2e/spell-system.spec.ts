import { expect, test } from '@playwright/test';
import fs from 'node:fs';

test('spell system is wired and follows starter rules', async () => {
  const html=fs.readFileSync('index.html','utf8');
  const spells=fs.readFileSync('src/spell-system.ts','utf8');
  expect(html).toContain('/src/spell-system.ts');
  expect(spells).toContain('const HEAL_MANA_COST=2');
  expect(spells).toContain('const HEAL_BAR_SLOTS=2');
  expect(spells).toContain("defaultKnown(){return isAnimalCrawler()?[]:['Heal']}");
  expect(spells).toContain('Animal crawler: no automatic starter Heal spell.');
});

test('rulebook spell library and floor choices are present', async () => {
  const spells=fs.readFileSync('src/spell-system.ts','utf8');
  for(const name of ['Heal','Fire Fingers','Frost Scar','Magic Missile','Drain Life','Heal Others','Heal Critter','Heal Self','Holy Aura','Hot Stuff Aura','Ice Blast','Icicles','Intimate Touches','Lightning Bolt','Hole']){
    expect(spells).toContain(`name:'${name}'`);
  }
  expect(spells).toContain('Floor ${floor} Spell Choice');
  expect(spells).toContain('Class-favored spells are offered first.');
  expect(spells).toContain('claimedFloors');
});

test('mana bar and spell library render in crawler UI', async ({page}) => {
  await page.goto('/');
  const link=page.getByRole('link',{name:/Crawler Companion/i});
  if(await link.count()) await link.first().click();
  await expect(page.getByText('✨ Spells & Mana',{exact:true})).toBeVisible();
  await expect(page.getByLabel('Max MP')).toBeVisible();
  await expect(page.getByLabel('Current MP')).toBeVisible();
  await expect(page.getByRole('button',{name:'Restore Mana'})).toBeVisible();
  await expect(page.getByText('📚 Rulebook Spell Library',{exact:true})).toBeVisible();
});
