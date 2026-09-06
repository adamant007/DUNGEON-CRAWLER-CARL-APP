-- Crawler Companion cloud schema (roadmap build)
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.crawler_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Unnamed Crawler',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists crawler_characters_user_id_idx on public.crawler_characters(user_id);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My Crawler Campaign',
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_members (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'player' check(role in ('gm','player')),
  joined_at timestamptz not null default now(),
  primary key(campaign_id,user_id)
);

create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  target_character_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists campaign_events_campaign_idx on public.campaign_events(campaign_id,created_at desc);

create table if not exists public.app_visits (
  device_id uuid primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

-- Admins are intentionally not readable/writable from the client. Add the studio owner's
-- auth user UUID here from the Supabase SQL editor before using owner analytics:
-- insert into public.studio_admins(user_id) values ('YOUR-AUTH-USER-UUID');
create table if not exists public.studio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.crawler_characters enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.campaign_events enable row level security;
alter table public.app_visits enable row level security;
alter table public.studio_admins enable row level security;

drop policy if exists "profiles own" on public.profiles;
create policy "profiles own" on public.profiles for all using(auth.uid()=id) with check(auth.uid()=id);
drop policy if exists "characters own" on public.crawler_characters;
create policy "characters own" on public.crawler_characters for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "campaign members read" on public.campaigns;
create policy "campaign members read" on public.campaigns for select using(owner_id=auth.uid() or exists(select 1 from public.campaign_members m where m.campaign_id=id and m.user_id=auth.uid()));
drop policy if exists "campaign owner write" on public.campaigns;
create policy "campaign owner write" on public.campaigns for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "member read" on public.campaign_members;
create policy "member read" on public.campaign_members for select using(user_id=auth.uid() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.owner_id=auth.uid()));
drop policy if exists "member join" on public.campaign_members;
create policy "member join" on public.campaign_members for insert with check(user_id=auth.uid());
drop policy if exists "member owner manage" on public.campaign_members;
create policy "member owner manage" on public.campaign_members for all using(exists(select 1 from public.campaigns c where c.id=campaign_id and c.owner_id=auth.uid()));
drop policy if exists "events member read" on public.campaign_events;
create policy "events member read" on public.campaign_events for select using(exists(select 1 from public.campaign_members m where m.campaign_id=campaign_id and m.user_id=auth.uid()));
drop policy if exists "events member insert" on public.campaign_events;
create policy "events member insert" on public.campaign_events for insert with check(sender_id=auth.uid() and exists(select 1 from public.campaign_members m where m.campaign_id=campaign_id and m.user_id=auth.uid()));
drop policy if exists "visits insert" on public.app_visits;
create policy "visits insert" on public.app_visits for insert with check(true);
drop policy if exists "visits update" on public.app_visits;
create policy "visits update" on public.app_visits for update using(true) with check(true);

create or replace function public.public_account_count() returns bigint language sql security definer set search_path=public as $$ select count(*) from auth.users $$;
revoke all on function public.public_account_count() from public;
grant execute on function public.public_account_count() to anon,authenticated;

create or replace function public.owner_analytics() returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or not exists(select 1 from public.studio_admins a where a.user_id=auth.uid()) then
    raise exception 'Not authorized';
  end if;
  return jsonb_build_object(
    'total_accounts',(select count(*) from auth.users),
    'unique_app_openers',(select count(*) from public.app_visits),
    'active_users_today',(select count(*) from public.app_visits where last_seen>=date_trunc('day',now())),
    'characters_created',(select count(*) from public.crawler_characters),
    'active_campaigns',(select count(*) from public.campaigns),
    'campaign_events',(select count(*) from public.campaign_events)
  );
end $$;
revoke all on function public.owner_analytics() from public;
grant execute on function public.owner_analytics() to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.campaign_events;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.crawler_characters;
exception when duplicate_object then null;
end $$;
