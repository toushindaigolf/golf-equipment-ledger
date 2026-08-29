begin;

create extension if not exists pgtap with schema extensions;
select plan(16);

select has_table('public', 'entitlements', 'entitlements table exists');
select has_column('public', 'entitlements', 'user_id', 'entitlements.user_id exists');
select has_column('public', 'entitlements', 'plan', 'entitlements.plan exists');
select has_column('public', 'entitlements', 'expires_at', 'entitlements.expires_at exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.entitlements'::regclass),
  'RLS is enabled on entitlements'
);
select policies_are(
  'public',
  'entitlements',
  array['entitlements_select_own'],
  'entitlements has only an owner SELECT policy'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.entitlements'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (user_id)'
  ),
  'entitlements has one row per user'
);

select ok(has_table_privilege('authenticated', 'public.entitlements', 'SELECT'), 'authenticated can SELECT entitlements');
select ok(not has_table_privilege('authenticated', 'public.entitlements', 'INSERT'), 'authenticated cannot INSERT entitlements');
select ok(not has_table_privilege('authenticated', 'public.entitlements', 'UPDATE'), 'authenticated cannot UPDATE entitlements');
select ok(not has_table_privilege('authenticated', 'public.entitlements', 'DELETE'), 'authenticated cannot DELETE entitlements');

insert into auth.users (id, email)
values
  ('33333333-3333-3333-3333-333333333333', 'pro-owner@example.com'),
  ('44444444-4444-4444-4444-444444444444', 'other-pro@example.com');

insert into public.entitlements (user_id, plan, status, source)
values
  ('33333333-3333-3333-3333-333333333333', 'pro', 'active', 'manual'),
  ('44444444-4444-4444-4444-444444444444', 'pro', 'active', 'manual');

set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select results_eq(
  $$select user_id from public.entitlements$$,
  $$values ('33333333-3333-3333-3333-333333333333'::uuid)$$,
  'authenticated users see only their own entitlement'
);
select is_empty(
  $$select user_id from public.entitlements where user_id = '44444444-4444-4444-4444-444444444444'$$,
  'other user entitlements are hidden'
);
select throws_ok(
  $$insert into public.entitlements (user_id, plan, status) values ('33333333-3333-3333-3333-333333333333', 'pro', 'active')$$,
  '42501',
  null,
  'authenticated users cannot insert entitlements'
);
select throws_ok(
  $$update public.entitlements set plan = 'free' where user_id = '33333333-3333-3333-3333-333333333333'$$,
  '42501',
  null,
  'authenticated users cannot update entitlements'
);
select throws_ok(
  $$delete from public.entitlements where user_id = '33333333-3333-3333-3333-333333333333'$$,
  '42501',
  null,
  'authenticated users cannot delete entitlements'
);

select * from finish();
rollback;
