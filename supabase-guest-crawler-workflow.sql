-- Guest crawler + GM character editing workflow.
-- Production was migrated on 2026-09-22 through Supabase migrations:
-- guest_crawlers_claim_and_gm_edit
-- lock_guest_crawler_rpcs_to_authenticated
-- optimize_guest_crawler_policy

alter table public.campaign_characters
  alter column user_id drop not null;

alter table public.crawler_characters
  add column if not exists guest_created_by uuid references auth.users(id) on delete set null,
  add column if not exists claim_token_hash text,
  add column if not exists claimed_at timestamptz;

create unique index if not exists crawler_characters_claim_token_hash_uidx
  on public.crawler_characters(claim_token_hash)
  where claim_token_hash is not null;

create index if not exists crawler_characters_guest_created_by_idx
  on public.crawler_characters(guest_created_by);

drop policy if exists "campaign owner reads assigned crawler" on public.crawler_characters;
create policy "campaign owner reads assigned crawler"
on public.crawler_characters
for select
to authenticated
using (
  exists (
    select 1
    from public.campaign_characters cc
    join public.campaigns c on c.id = cc.campaign_id
    where cc.character_id = crawler_characters.id
      and c.owner_id = (select auth.uid())
  )
);

create or replace function public.create_guest_crawler(
  p_campaign_id uuid,
  p_name text,
  p_data jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_name text;
  v_token text;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.campaigns c
    where c.id = p_campaign_id and c.owner_id = v_uid
  ) then
    raise exception 'Only the campaign GM can create guest crawlers';
  end if;

  v_name := coalesce(nullif(btrim(p_name), ''), 'Guest Crawler');
  v_token := encode(gen_random_bytes(24), 'hex');

  insert into public.crawler_characters (
    user_id, name, data, guest_created_by, claim_token_hash, updated_at, created_at
  )
  values (
    null,
    v_name,
    coalesce(p_data, '{}'::jsonb) || jsonb_build_object('name', v_name),
    v_uid,
    encode(digest(v_token, 'sha256'), 'hex'),
    now(),
    now()
  )
  returning id into v_id;

  insert into public.campaign_characters (campaign_id, character_id, user_id)
  values (p_campaign_id, v_id, null);

  return jsonb_build_object('character_id', v_id, 'claim_token', v_token);
end;
$$;

create or replace function public.claim_guest_crawler(p_claim_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if nullif(btrim(p_claim_token), '') is null then
    raise exception 'Claim token required';
  end if;

  select ch.id
  into v_id
  from public.crawler_characters ch
  where ch.user_id is null
    and ch.claim_token_hash = encode(digest(btrim(p_claim_token), 'sha256'), 'hex')
  for update;

  if v_id is null then
    raise exception 'This claim link is invalid or has already been used';
  end if;

  update public.crawler_characters
  set user_id = v_uid,
      claim_token_hash = null,
      claimed_at = now(),
      updated_at = now()
  where id = v_id;

  update public.campaign_characters
  set user_id = v_uid
  where character_id = v_id;

  insert into public.campaign_members (campaign_id, user_id, role)
  select distinct cc.campaign_id, v_uid, 'player'
  from public.campaign_characters cc
  where cc.character_id = v_id
  on conflict (campaign_id, user_id) do nothing;

  return jsonb_build_object('character_id', v_id);
end;
$$;

create or replace function public.gm_update_campaign_character(
  p_campaign_id uuid,
  p_character_id uuid,
  p_data jsonb,
  p_record_event boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.crawler_characters%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.campaigns c
    join public.campaign_characters cc on cc.campaign_id = c.id
    where c.id = p_campaign_id
      and c.owner_id = v_uid
      and cc.character_id = p_character_id
  ) then
    raise exception 'Only the campaign GM can edit an assigned crawler';
  end if;

  update public.crawler_characters ch
  set name = coalesce(nullif(btrim(p_data->>'name'), ''), ch.name),
      data = coalesce(p_data, '{}'::jsonb),
      updated_at = now()
  where ch.id = p_character_id
  returning ch.* into v_row;

  if v_row.id is null then
    raise exception 'Crawler not found';
  end if;

  if p_record_event then
    insert into public.campaign_events (
      campaign_id, sender_id, event_type, payload, target_character_id
    )
    values (
      p_campaign_id,
      v_uid,
      'gm_character_edit',
      jsonb_build_object('message', 'GM saved character changes', 'name', v_row.name),
      p_character_id
    );
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'user_id', v_row.user_id,
    'name', v_row.name,
    'data', v_row.data,
    'updated_at', v_row.updated_at,
    'created_at', v_row.created_at
  );
end;
$$;

revoke all on function public.create_guest_crawler(uuid,text,jsonb) from public;
revoke all on function public.claim_guest_crawler(text) from public;
revoke all on function public.gm_update_campaign_character(uuid,uuid,jsonb,boolean) from public;
revoke execute on function public.create_guest_crawler(uuid,text,jsonb) from anon;
revoke execute on function public.claim_guest_crawler(text) from anon;
revoke execute on function public.gm_update_campaign_character(uuid,uuid,jsonb,boolean) from anon;
grant execute on function public.create_guest_crawler(uuid,text,jsonb) to authenticated;
grant execute on function public.claim_guest_crawler(text) to authenticated;
grant execute on function public.gm_update_campaign_character(uuid,uuid,jsonb,boolean) to authenticated;
