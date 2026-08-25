import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../supabase/migrations/20260826000100_create_profiles_and_equipment.sql', import.meta.url),
  'utf8',
);

describe('Phase 3-1 Supabase migration', () => {
  it('keeps every current GolfEquipment field in the database schema', () => {
    const columns = [
      'id', 'user_id', 'name', 'category_id', 'manufacturer', 'purchase_date',
      'purchase_price', 'purchase_place', 'purchase_reason', 'sale_price',
      'sale_date', 'status', 'memo', 'created_at', 'updated_at',
    ];
    columns.forEach(column => expect(migration).toMatch(new RegExp(`\\b${column}\\b`)));
  });

  it('enables RLS and removes anonymous table access', () => {
    expect(migration).toContain('alter table public.profiles enable row level security');
    expect(migration).toContain('alter table public.equipment enable row level security');
    expect(migration).toContain('revoke all on table public.profiles from anon, authenticated');
    expect(migration).toContain('revoke all on table public.equipment from anon, authenticated');
  });

  it('defines separate owner-only policies for every operation on both tables', () => {
    const policies = ['select', 'insert', 'update', 'delete'];
    for (const table of ['profiles', 'equipment']) {
      for (const operation of policies) {
        expect(migration).toContain(`create policy "${table}_${operation}_own"`);
      }
    }
    expect(migration.match(/\(select auth\.uid\(\)\) = user_id/g)).toHaveLength(10);
  });

  it('does not introduce Pro, entitlement, payment, or Stripe schema', () => {
    expect(migration).not.toMatch(/\b(is_pro|entitlements?|payments?|stripe)\b/i);
  });
});
