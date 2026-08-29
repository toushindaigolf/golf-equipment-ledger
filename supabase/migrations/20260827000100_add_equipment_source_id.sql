-- Phase 3-3: identify equipment imported from a user's localStorage.
-- NULL keeps ordinary cloud-created equipment outside the migration identity.

alter table public.equipment
  add column source_id text
  check (source_id is null or length(btrim(source_id)) > 0);

alter table public.equipment
  add constraint equipment_user_source_id_key unique (user_id, source_id);

comment on column public.equipment.source_id is
  'Original localStorage equipment ID. NULL for equipment created directly in the cloud.';
