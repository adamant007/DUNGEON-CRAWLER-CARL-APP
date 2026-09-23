-- Campaign-scoped private mob stat blocks for GM Tools.
-- Only the campaign owner/GM can read or mutate these rows.

create table if not exists public.campaign_mobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaign_mobs_campaign_name_idx
  on public.campaign_mobs (campaign_id, lower(name));

alter table public.campaign_mobs enable row level security;

drop policy if exists "campaign_mobs_select_gm" on public.campaign_mobs;
create policy "campaign_mobs_select_gm"
on public.campaign_mobs
for select
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_mobs.campaign_id
      and c.owner_id = auth.uid()
  )
);

drop policy if exists "campaign_mobs_insert_gm" on public.campaign_mobs;
create policy "campaign_mobs_insert_gm"
on public.campaign_mobs
for insert
with check (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_mobs.campaign_id
      and c.owner_id = auth.uid()
  )
);

drop policy if exists "campaign_mobs_update_gm" on public.campaign_mobs;
create policy "campaign_mobs_update_gm"
on public.campaign_mobs
for update
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_mobs.campaign_id
      and c.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_mobs.campaign_id
      and c.owner_id = auth.uid()
  )
);

drop policy if exists "campaign_mobs_delete_gm" on public.campaign_mobs;
create policy "campaign_mobs_delete_gm"
on public.campaign_mobs
for delete
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_mobs.campaign_id
      and c.owner_id = auth.uid()
  )
);
