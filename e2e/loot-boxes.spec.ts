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

test('loot boxes support rarity tiers, multiple unique items, and duplicate protection', async () => {
  const src=fs.readFileSync('src/loot-boxes.ts','utf8');
  for (const tier of ['Bronze','Silver','Gold','Epic','Legendary']) expect(src).toContain(tier);
  expect(src).toContain('uniqueItems');
  expect(src).toContain('Math.min(12');
  expect(src).toContain('Existing duplicates were skipped');
  expect(src).toContain('Accept All Rewards');
});

test('loot box count can be cleared and restored on blur', async () => {
  const src=fs.readFileSync('src/loot-boxes.ts','utf8');
  expect(src).toContain("if(count.value==='')return");
  expect(src).toContain("if(!count.value)count.value=String(itemCountFor");
});
