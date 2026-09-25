-- Ginger Dragon: Dungeon in a Box cloud persistence.
-- Floors are private GM-owned projects. Templates may be campaign-independent.

create table if not exists public.gm_floor_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  name text not null default 'Untitled Floor',
  project_type text not null default 'floor' check (project_type in ('floor','template')),
  scope text not null default 'Dungeon Floor',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gm_floor_projects_owner_updated_idx
  on public.gm_floor_projects(owner_id, updated_at desc);
create index if not exists gm_floor_projects_campaign_updated_idx
  on public.gm_floor_projects(campaign_id, updated_at desc)
  where campaign_id is not null;
create index if not exists gm_floor_projects_template_idx
  on public.gm_floor_projects(owner_id, project_type, updated_at desc);

alter table public.gm_floor_projects enable row level security;

grant select, insert, update, delete on public.gm_floor_projects to authenticated;

drop policy if exists "gm_floor_projects_select_owner" on public.gm_floor_projects;
create policy "gm_floor_projects_select_owner"
on public.gm_floor_projects for select to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "gm_floor_projects_insert_owner" on public.gm_floor_projects;
create policy "gm_floor_projects_insert_owner"
on public.gm_floor_projects for insert to authenticated
with check (
  (select auth.uid()) = owner_id
  and (
    campaign_id is null
    or exists (
      select 1 from public.campaigns c
      where c.id = gm_floor_projects.campaign_id
        and c.owner_id = (select auth.uid())
    )
  )
);

drop policy if exists "gm_floor_projects_update_owner" on public.gm_floor_projects;
create policy "gm_floor_projects_update_owner"
on public.gm_floor_projects for update to authenticated
using ((select auth.uid()) = owner_id)
with check (
  (select auth.uid()) = owner_id
  and (
    campaign_id is null
    or exists (
      select 1 from public.campaigns c
      where c.id = gm_floor_projects.campaign_id
        and c.owner_id = (select auth.uid())
    )
  )
);

drop policy if exists "gm_floor_projects_delete_owner" on public.gm_floor_projects;
create policy "gm_floor_projects_delete_owner"
on public.gm_floor_projects for delete to authenticated
using ((select auth.uid()) = owner_id);
