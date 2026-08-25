-- Phase 3-1: database schema and owner-only access control.
-- This migration does not move data from localStorage or change the Free app.

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.equipment (
  id text primary key default (gen_random_uuid()::text),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  category_id text not null default 'other',
  manufacturer text not null default '',
  purchase_date date not null,
  purchase_price bigint not null default 0 check (purchase_price >= 0),
  purchase_place text not null default '',
  purchase_reason text not null default '',
  sale_price bigint not null default 0 check (sale_price >= 0),
  sale_date date,
  status text not null default 'in_use'
    check (status in ('in_use', 'stored', 'sold')),
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index equipment_user_id_idx
  on public.equipment (user_id);

create index equipment_user_purchase_date_idx
  on public.equipment (user_id, purchase_date desc);

create index equipment_user_status_idx
  on public.equipment (user_id, status);

create index equipment_user_category_idx
  on public.equipment (user_id, category_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger equipment_set_updated_at
before update on public.equipment
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Add profiles for users created during Phase 2 before this migration exists.
insert into public.profiles (user_id, created_at, updated_at)
select id, created_at, now()
from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.equipment enable row level security;

-- Policies and grants are both required. Signed-out clients receive no table access.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.equipment from anon, authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.equipment to authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "equipment_select_own"
on public.equipment
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "equipment_insert_own"
on public.equipment
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "equipment_update_own"
on public.equipment
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "equipment_delete_own"
on public.equipment
for delete
to authenticated
using ((select auth.uid()) = user_id);
