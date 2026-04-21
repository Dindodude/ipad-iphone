create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.dashboards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  source text default 'Manual',
  description text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.dashboards(id) on delete cascade,
  name text not null,
  niche text not null default 'Other',
  phone text default '',
  email text default '',
  address text default '',
  city text default '',
  status text not null default 'Not Contacted',
  priority text not null default 'warm',
  whatsapp_status text not null default 'unknown',
  source text not null default 'Manual',
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.script_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  stage text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.instant_form_events (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.dashboards(id) on delete cascade,
  payload jsonb not null,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.dashboards enable row level security;
alter table public.leads enable row level security;
alter table public.script_templates enable row level security;
alter table public.instant_form_events enable row level security;

create policy "Owners can view their dashboards"
on public.dashboards for select
using (owner_id = auth.uid());

create policy "Owners can manage their dashboards"
on public.dashboards for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owners can view leads through dashboards"
on public.leads for select
using (
  exists (
    select 1
    from public.dashboards
    where dashboards.id = leads.dashboard_id
      and dashboards.owner_id = auth.uid()
  )
);

create policy "Owners can manage leads through dashboards"
on public.leads for all
using (
  exists (
    select 1
    from public.dashboards
    where dashboards.id = leads.dashboard_id
      and dashboards.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.dashboards
    where dashboards.id = leads.dashboard_id
      and dashboards.owner_id = auth.uid()
  )
);

create policy "Owners can manage script templates"
on public.script_templates for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owners can manage instant form events"
on public.instant_form_events for all
using (
  exists (
    select 1
    from public.dashboards
    where dashboards.id = instant_form_events.dashboard_id
      and dashboards.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.dashboards
    where dashboards.id = instant_form_events.dashboard_id
      and dashboards.owner_id = auth.uid()
  )
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche text not null default '',
  notes text default '',
  contact_person text default '',
  phone text default '',
  email text default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clients_name_unique_idx
on public.clients (lower(name));

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  source text not null default 'Other',
  description text default '',
  niche_context text default '',
  default_stage text not null default 'New',
  default_script_id uuid,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists campaigns_client_name_unique_idx
on public.campaigns (client_id, lower(name));

alter table public.leads
  add column if not exists client_id uuid references public.clients(id) on delete cascade,
  add column if not exists campaign_id uuid references public.campaigns(id) on delete cascade;
