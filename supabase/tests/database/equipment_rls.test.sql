begin;

create extension if not exists pgtap with schema extensions;
select plan(13);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'equipment', 'equipment table exists');
select col_is_pk('public', 'profiles', 'user_id', 'profiles.user_id is the primary key');
select col_is_pk('public', 'equipment', 'id', 'equipment.id is the primary key');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'RLS is enabled on profiles'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.equipment'::regclass),
  'RLS is enabled on equipment'
);

select policies_are(
  'public',
  'profiles',
  array['profiles_delete_own', 'profiles_insert_own', 'profiles_select_own', 'profiles_update_own'],
  'profiles has only owner policies'
);
select policies_are(
  'public',
  'equipment',
  array['equipment_delete_own', 'equipment_insert_own', 'equipment_select_own', 'equipment_update_own'],
  'equipment has only owner policies'
);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'other@example.com');

insert into public.equipment (id, user_id, name, purchase_date)
values
  ('owner-item', '11111111-1111-1111-1111-111111111111', 'Owner item', '2026-08-26'),
  ('other-item', '22222222-2222-2222-2222-222222222222', 'Other item', '2026-08-26');

set local role anon;
select throws_ok(
  $$select * from public.equipment$$,
  '42501',
  null,
  'anon cannot select equipment'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$select id from public.equipment order by id$$,
  $$values ('owner-item'::text)$$,
  'authenticated users see only their own equipment'
);

select throws_ok(
  $$insert into public.equipment (id, user_id, name, purchase_date) values ('forbidden-item', '22222222-2222-2222-2222-222222222222', 'Forbidden', '2026-08-26')$$,
  '42501',
  null,
  'authenticated users cannot insert equipment for another user'
);

select results_eq(
  $$update public.equipment set memo = 'changed' where id = 'owner-item' returning memo$$,
  $$values ('changed'::text)$$,
  'authenticated users can update their own equipment'
);

select results_eq(
  $$delete from public.equipment where id = 'other-item' returning id$$,
  $$select null::text where false$$,
  'another user equipment is invisible to delete'
);

select * from finish();
rollback;
