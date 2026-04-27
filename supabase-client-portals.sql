-- Zentrixa Client Portal storage.
-- Run once in Supabase SQL Editor.

create table if not exists public.zentrixa_client_portals (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  business_name text not null,
  login_identifier text not null unique,
  password_hash text not null,
  password_salt text not null,
  access_status text not null default 'Active',
  portal_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists zentrixa_client_portals_owner_idx
  on public.zentrixa_client_portals (owner_email);

create index if not exists zentrixa_client_portals_login_idx
  on public.zentrixa_client_portals (login_identifier);

alter table public.zentrixa_client_portals enable row level security;

-- This app reads/writes through server routes using SUPABASE_SERVICE_ROLE_KEY.
-- Service-role requests bypass RLS, so no anon policy is required.
