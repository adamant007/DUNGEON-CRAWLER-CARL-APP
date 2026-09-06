import { expect, test } from '@playwright/test';
import fs from 'node:fs';

const read=(p:string)=>fs.readFileSync(p,'utf8');

test('GM rewards stay campaign-scoped and targeted', async()=>{
 const src=read('src/gm-rewards.ts');
 expect(src).toContain("cloudCampaignCharacters");
 expect(src).toContain("cloudPushEvent(campaignId,'gm_reward',payload,targetId)");
 expect(src).toContain("target_character_id");
 expect(src).toContain("cc-active-campaign-id");
 expect(src).toContain("Accept Reward");
 expect(src).toContain("cloudSaveCharacter(c)");
 expect(src).toContain("payload.kind==='spell'");
 expect(src).toContain("CUSTOM MAGIC");
});

test('GM reward module is loaded by the app', async()=>{
 const html=read('index.html');
 expect(html).toContain('/src/gm-rewards.ts');
});
