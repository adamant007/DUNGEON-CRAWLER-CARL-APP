import { expect, test } from '@playwright/test';
import fs from 'node:fs';

test('cloud client requires campaign-scoped crawlers and leaderboard', async () => {
  const cloud=fs.readFileSync('src/cloud.ts','utf8');
  expect(cloud).toContain("from('campaign_characters')");
  expect(cloud).toContain('cloudAssignCharacterToCampaign');
  expect(cloud).toContain('cloudCampaignCharacters');
  expect(cloud).toContain("onConflict:'campaign_id,character_id'");
  expect(cloud).toContain("if(!campaignId) throw new Error('Choose a campaign to view its leaderboard.')");
  expect(cloud).toContain("rpc('join_campaign_by_code'");
});

test('tutorial tab explains campaign privacy and opens features', async ({page}) => {
  await page.goto('/');
  const link=page.getByRole('link',{name:/Crawler Companion/i});
  if(await link.count()) await link.first().click();
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await expect(nav.getByRole('button',{name:'Tutorial',exact:true})).toBeVisible();
  await nav.getByRole('button',{name:'Tutorial',exact:true}).click();
  await expect(page.getByText('🎓 Crawler Companion Tutorial',{exact:true})).toBeVisible();
  await expect(page.getByText(/GM only sees crawler sheets assigned to that GM’s campaign/i)).toBeVisible();
  await expect(page.getByText(/each campaign has its own leaderboard/i).first()).toBeVisible();
  await page.getByRole('button',{name:'Show me →'}).first().click();
  await expect(nav.getByRole('button',{name:'Character',exact:true})).toHaveClass(/active/);
});
