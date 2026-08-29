-- Phase 4: server-managed Free / Pro entitlement state.
-- This migration only adds entitlement data. It does not alter or delete equipment data.

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan text not null default 'free'
    check (plan in ('free', 'pro')),
  status text not null default 'inactive'
    check (status in ('active', 'inactive', 'canceled', 'expired')),
  source text not null default 'other'
    check (source in ('manual', 'stripe', 'other')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.entitlements is
  'Server-managed subscription access. Clients may read only their own row.';

create trigger entitlements_set_updated_at
before update on public.entitlements
for each row execute function public.set_updated_at();

alter table public.entitlements enable row level security;

-- New public-schema tables can receive broad default grants. Keep the browser read-only.
revoke all on table public.entitlements from anon, authenticated;
grant select on table public.entitlements to authenticated;

create policy "entitlements_select_own"
on public.entitlements
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Deliberately no INSERT / UPDATE / DELETE client policies or grants.
-- SQL Editor administrators and a future trusted Stripe Webhook can manage rows.
