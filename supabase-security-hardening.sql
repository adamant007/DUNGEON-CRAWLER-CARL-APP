-- Security hardening applied to the live Crawler Companion database.
-- Keep privileged work out of the exposed public schema and grant only the API operations the app needs.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.join_campaign_by_code_secure(p_invite_code text)
returns table(id uuid, name text, invite_code text, owner_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare v_campaign public.campaigns%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_campaign from public.campaigns c where upper(c.invite_code)=upper(trim(p_invite_code)) limit 1;
  if v_campaign.id is null then raise exception 'Campaign code not found'; end if;
  insert into public.campaign_members(campaign_id,user_id,role)
  values(v_campaign.id,auth.uid(),'player')
  on conflict(campaign_id,user_id) do nothing;
  return query select v_campaign.id,v_campaign.name,v_campaign.invite_code,v_campaign.owner_id;
end $$;
revoke all on function private.join_campaign_by_code_secure(text) from public, anon;
grant execute on function private.join_campaign_by_code_secure(text) to authenticated;

create or replace function public.join_campaign_by_code(p_invite_code text)
returns table(id uuid, name text, invite_code text, owner_id uuid)
language sql
security invoker
set search_path = ''
as $$ select * from private.join_campaign_by_code_secure(p_invite_code) $$;
revoke all on function public.join_campaign_by_code(text) from public, anon;
grant execute on function public.join_campaign_by_code(text) to authenticated;

create or replace function private.owner_analytics_secure()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists(select 1 from public.studio_admins a where a.user_id=auth.uid()) then raise exception 'Not authorized'; end if;
  return jsonb_build_object(
    'total_accounts',(select count(*) from auth.users),
    'unique_app_openers',(select count(*) from public.app_visits),
    'active_users_today',(select count(*) from public.app_visits where last_seen>=date_trunc('day',now())),
    'characters_created',(select count(*) from public.crawler_characters),
    'active_campaigns',(select count(*) from public.campaigns),
    'campaign_events',(select count(*) from public.campaign_events),
    'activity_events',(select count(*) from public.app_activity),
    'published_leaderboard_crawlers',(select count(*) from public.leaderboard_entries where is_public=true)
  );
end $$;
revoke all on function private.owner_analytics_secure() from public, anon;
grant execute on function private.owner_analytics_secure() to authenticated;

create or replace function public.owner_analytics()
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.owner_analytics_secure() $$;
revoke all on function public.owner_analytics() from public, anon;
grant execute on function public.owner_analytics() to authenticated;

create or replace function private.owner_activity_log_secure(p_limit integer default 200)
returns table(id bigint, display_name text, event_type text, payload jsonb, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists(select 1 from public.studio_admins a where a.user_id=auth.uid()) then raise exception 'Not authorized'; end if;
  return query
  select a.id,
    coalesce(p.display_name, u.raw_user_meta_data->>'display_name', case when a.user_id is null then 'Guest / anonymous device' else 'Registered crawler' end),
    a.event_type,a.payload,a.created_at
  from public.app_activity a
  left join public.profiles p on p.user_id=a.user_id
  left join auth.users u on u.id=a.user_id
  order by a.created_at desc
  limit greatest(1,least(coalesce(p_limit,200),1000));
end $$;
revoke all on function private.owner_activity_log_secure(integer) from public, anon;
grant execute on function private.owner_activity_log_secure(integer) to authenticated;

create or replace function public.owner_activity_log(p_limit integer default 200)
returns table(id bigint, display_name text, event_type text, payload jsonb, created_at timestamptz)
language sql
security invoker
set search_path = ''
as $$ select * from private.owner_activity_log_secure(p_limit) $$;
revoke all on function public.owner_activity_log(integer) from public, anon;
grant execute on function public.owner_activity_log(integer) to authenticated;

create or replace function private.public_account_count_secure()
returns bigint
language sql
security definer
set search_path = ''
as $$ select count(*) from auth.users $$;
revoke all on function private.public_account_count_secure() from public;
grant execute on function private.public_account_count_secure() to anon, authenticated;

create or replace function public.public_account_count()
returns bigint
language sql
security invoker
set search_path = ''
as $$ select private.public_account_count_secure() $$;
revoke all on function public.public_account_count() from public;
grant execute on function public.public_account_count() to anon, authenticated;

drop policy if exists "studio admins can view own admin flag" on public.studio_admins;
create policy "studio admins can view own admin flag" on public.studio_admins for select to authenticated using ((select auth.uid())=user_id);

-- Least-privilege Data API grants.
revoke all on table public.campaigns, public.campaign_members, public.campaign_events, public.campaign_characters, public.crawler_characters, public.characters, public.leaderboard_entries, public.profiles, public.studio_admins from anon;
revoke all on table public.app_activity, public.app_visits from anon;
grant insert on table public.app_activity to anon;
grant insert, update on table public.app_visits to anon;

revoke all on table public.campaigns, public.campaign_members, public.campaign_events, public.campaign_characters, public.crawler_characters, public.characters, public.leaderboard_entries, public.profiles, public.studio_admins, public.app_activity, public.app_visits from authenticated;
grant select, insert, update, delete on table public.campaigns to authenticated;
grant select, insert, delete on table public.campaign_members to authenticated;
grant select, insert on table public.campaign_events to authenticated;
grant select, insert, delete on table public.campaign_characters to authenticated;
grant select, insert, update, delete on table public.crawler_characters to authenticated;
grant select, insert, update, delete on table public.leaderboard_entries to authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select on table public.studio_admins to authenticated;
grant insert on table public.app_activity to authenticated;
grant insert, update on table public.app_visits to authenticated;
