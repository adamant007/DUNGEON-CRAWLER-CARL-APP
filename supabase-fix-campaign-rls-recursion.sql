-- Fix recursive RLS between campaigns, campaign_members, and profiles.
-- Applied to production Supabase on 2026-09-25.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_campaign_owner(p_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaigns c
    where c.id = p_campaign_id
      and c.owner_id = auth.uid()
  )
$$;

create or replace function private.is_campaign_member(p_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaign_members m
    where m.campaign_id = p_campaign_id
      and m.user_id = auth.uid()
  )
$$;

create or replace function private.can_read_campaign_member_profile(p_profile_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaign_members m
    join public.campaigns c on c.id = m.campaign_id
    where m.user_id = p_profile_user_id
      and c.owner_id = auth.uid()
  )
$$;

revoke all on function private.is_campaign_owner(uuid) from public, anon;
revoke all on function private.is_campaign_member(uuid) from public, anon;
revoke all on function private.can_read_campaign_member_profile(uuid) from public, anon;
grant execute on function private.is_campaign_owner(uuid) to authenticated;
grant execute on function private.is_campaign_member(uuid) to authenticated;
grant execute on function private.can_read_campaign_member_profile(uuid) to authenticated;

drop policy if exists "Owners can view campaigns" on public.campaigns;
create policy "Owners can view campaigns"
on public.campaigns
for select
to authenticated
using (
  auth.uid() = owner_id
  or private.is_campaign_member(id)
);

drop policy if exists "Members can view memberships" on public.campaign_members;
create policy "Members can view memberships"
on public.campaign_members
for select
to authenticated
using (
  auth.uid() = user_id
  or private.is_campaign_owner(campaign_id)
);

drop policy if exists "Campaign owner can add gm membership" on public.campaign_members;
create policy "Campaign owner can add gm membership"
on public.campaign_members
for insert
to authenticated
with check (
  role = 'gm'
  and private.is_campaign_owner(campaign_id)
);

drop policy if exists "Users can leave campaigns" on public.campaign_members;
create policy "Users can leave campaigns"
on public.campaign_members
for delete
to authenticated
using (
  auth.uid() = user_id
  or private.is_campaign_owner(campaign_id)
);

drop policy if exists "campaign owner reads member profiles" on public.profiles;
create policy "campaign owner reads member profiles"
on public.profiles
for select
to authenticated
using (
  private.can_read_campaign_member_profile(user_id)
);
