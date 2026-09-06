import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file:string) => fs.readFileSync(path.join(root, file), 'utf8');

test('campaign schema matches cloud client contract', async () => {
  const cloud = read('src/cloud.ts');
  const schema = read('supabase-schema.sql');

  expect(cloud).toContain("from('campaigns').insert({owner_id:user.id,name:");
  expect(cloud).toContain("select('campaign_id,role,campaigns(id,name,invite_code,owner_id,created_at)')");

  expect(schema).toMatch(/create table if not exists public\.campaigns[\s\S]*?\bname text not null default 'My Crawler Campaign'/);
  expect(schema).toContain("alter table public.campaigns add column if not exists name text not null default 'My Crawler Campaign';");
});

test('realtime campaign event transport remains configured', async () => {
  const cloud = read('src/cloud.ts');
  const schema = read('supabase-schema.sql');

  expect(cloud).toContain("from('campaign_events').insert");
  expect(cloud).toContain("table:'campaign_events'");
  expect(schema).toContain('alter publication supabase_realtime add table public.campaign_events;');
  expect(schema).toContain('create index if not exists campaign_events_campaign_idx');
});
