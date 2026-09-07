import { expect, test } from '@playwright/test';
import fs from 'node:fs';

test('loot box runtime is loaded and campaign scoped', async () => {
  const html=fs.readFileSync('index.html','utf8');
  const src=fs.readFileSync('src/loot-boxes.ts','utf8');
  expect(html).toContain('/src/loot-boxes.ts');
  expect(src).toContain("cloudCampaignCharacters");
  expect(src).toContain("cloudPushEvent(campaignId,'gm_loot_box'");
  expect(src).toContain("cloudSubscribeCampaign");
  expect(src).toContain("cc-active-campaign-id");
});

test('loot boxes support rarity tiers, unique generated rewards, and inventory-aware sorting', async () => {
  const src=fs.readFileSync('src/loot-boxes.ts','utf8');
  for (const tier of ['Bronze','Silver','Gold','Epic','Legendary']) expect(src).toContain(tier);
  expect(src).toContain('uniqueItems');
  expect(src).toContain('Math.min(12');
  expect(src).toContain('stackInto(inventory,item)');
  expect(src).toContain("item.category==='weapon'||item.category==='equipment'");
  expect(src).toContain("item.category==='currency'");
  expect(src).toContain("cc:inventory-changed");
  expect(src).toContain("cc:equipment-changed");
  expect(src).toContain('Accept All Rewards');
});

test('loot box count supports temporary clearing and clamps entered values', async () => {
  const src=fs.readFileSync('src/loot-boxes.ts','utf8');
  expect(src).toContain("if(count.value==='')return");
  expect(src).toContain('Math.max(1,Math.min(12,Number(count.value)||1))');
  expect(src).toContain('Number(count.value)||itemCountFor(t)');
});
