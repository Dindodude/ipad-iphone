-- LeadOS cloud workspace storage for Zentrixa.
-- Run this in Supabase SQL Editor once.

create table if not exists public.leados_workspaces (
  owner_email text primary key,
  leads jsonb not null default '[]'::jsonb,
  settings jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leados_workspaces_updated_at_idx
  on public.leados_workspaces (updated_at desc);

alter table public.leados_workspaces enable row level security;

-- This app reads/writes through the server using SUPABASE_SERVICE_ROLE_KEY.
-- Service-role requests bypass RLS, so no public anon policy is needed.
