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
  expect(schema).toContain('create index if not exists campaign_events_target_idx');
});

test('GM pushes are authoritative and targeted events stay private', async () => {
  const schema = read('supabase-schema.sql');
  expect(schema).toContain('create policy "events gm insert"');
  expect(schema).toContain('c.owner_id=auth.uid()');
  expect(schema).toContain('ch.id=campaign_events.target_character_id and ch.user_id=auth.uid()');
  expect(schema).toContain('join public.campaign_members m on m.user_id=ch.user_id');
  expect(schema).not.toContain('create policy "events member insert"');
});

test('privileged RPCs are hidden behind invoker wrappers', async () => {
  const hardening = read('supabase-security-hardening.sql');
  expect(hardening).toContain('create schema if not exists private;');
  expect(hardening).toContain('private.join_campaign_by_code_secure');
  expect(hardening).toContain('private.owner_analytics_secure');
  expect(hardening).toContain('private.owner_activity_log_secure');
  expect(hardening).toContain('private.public_account_count_secure');
  for (const name of ['join_campaign_by_code','owner_analytics','owner_activity_log','public_account_count']) {
    const wrapper = new RegExp(`create or replace function public\\.${name}[\\s\\S]*?security invoker`, 'i');
    expect(hardening).toMatch(wrapper);
  }
  expect(hardening).toContain("set search_path = ''");
});

test('anonymous Data API access follows least privilege', async () => {
  const hardening = read('supabase-security-hardening.sql');
  expect(hardening).toContain('revoke all on table public.campaigns, public.campaign_members, public.campaign_events, public.campaign_characters, public.crawler_characters, public.characters, public.leaderboard_entries, public.profiles, public.studio_admins from anon;');
  expect(hardening).toContain('grant insert on table public.app_activity to anon;');
  expect(hardening).toContain('grant insert, update on table public.app_visits to anon;');
  expect(hardening).not.toContain('grant select on table public.campaigns to anon');
  expect(hardening).not.toContain('grant select on table public.crawler_characters to anon');
});
