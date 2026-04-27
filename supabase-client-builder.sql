-- Zentrixa Client Builder admin workspace storage.
-- Run once in Supabase SQL Editor.

create table if not exists public.zentrixa_client_builder_workspaces (
  owner_email text primary key,
  clients jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists zentrixa_client_builder_workspaces_updated_at_idx
  on public.zentrixa_client_builder_workspaces (updated_at desc);

alter table public.zentrixa_client_builder_workspaces enable row level security;

-- This app reads/writes through server routes using SUPABASE_SERVICE_ROLE_KEY.
-- Service-role requests bypass RLS, so no anon policy is required.
