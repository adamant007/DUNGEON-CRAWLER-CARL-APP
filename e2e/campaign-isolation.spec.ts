import { expect, test } from '@playwright/test';
import fs from 'node:fs';

function navButton(nav:any,label:string){
  return nav.locator('button').filter({hasText:new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`)}).first();
}

test('cloud client requires campaign-scoped crawlers and leaderboard', async () => {
  const cloud=fs.readFileSync('src/cloud.ts','utf8');
  expect(cloud).toContain("from('campaign_characters')");
  expect(cloud).toContain('cloudAssignCharacterToCampaign');
  expect(cloud).toContain('cloudCampaignCharacters');
  expect(cloud).toContain("onConflict:'campaign_id,character_id'");
  expect(cloud).toContain("if(!campaignId) throw new Error('Choose a campaign to view its leaderboard.')");
  expect(cloud).toContain("rpc('join_campaign_by_code'");
});

test('campaign context UI persists active campaign and uses scoped cloud APIs', async () => {
  const ui=fs.readFileSync('src/campaign-context.ts','utf8');
  const index=fs.readFileSync('index.html','utf8');
  expect(index).toContain('/src/campaign-context.ts');
  expect(ui).toContain("const ACTIVE_KEY='cc-active-campaign-id'");
  expect(ui).toContain('cloudCampaignCharacters(campaign.id)');
  expect(ui).toContain("cloudLeaderboard(campaign.id,'score')");
  expect(ui).toContain('cloudListEvents(campaign.id,25)');
  expect(ui).toContain('cloudAssignCharacterToCampaign(select.value,character.id)');
  expect(ui).toContain('cloudRemoveCharacterFromCampaign(select.value,character.id)');
  expect(ui).toContain("new CustomEvent('cc:campaign-changed'");
});

test('tutorial tab explains campaign privacy and opens features', async ({page}) => {
  await page.goto('/');
  const link=page.getByRole('link',{name:/Crawler Companion/i});
  if(await link.count()) await link.first().click();
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await expect(navButton(nav,'Tutorial')).toBeVisible();
  await navButton(nav,'Tutorial').click();
  await expect(page.getByText('🎓 Crawler Companion Tutorial',{exact:true})).toBeVisible();
  await expect(page.getByText(/GM only sees crawler sheets assigned to that GM’s campaign/i)).toBeVisible();
  await expect(page.getByText(/each campaign has its own leaderboard/i).first()).toBeVisible();
  await page.getByRole('button',{name:'Show me →'}).first().click();
  await expect(navButton(nav,'Character')).toHaveClass(/active/);
});
