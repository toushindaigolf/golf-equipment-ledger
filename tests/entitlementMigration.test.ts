import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../supabase/migrations/20260829000100_create_entitlements.sql', import.meta.url),
  'utf8',
);

describe('Phase 4 entitlements migration', () => {
  it('creates the constrained one-row-per-user entitlement schema', () => {
    for (const column of ['id', 'user_id', 'plan', 'status', 'source', 'expires_at', 'created_at', 'updated_at']) {
      expect(migration).toMatch(new RegExp(`\\b${column}\\b`));
    }
    expect(migration).toContain('user_id uuid not null unique references auth.users');
    expect(migration).toContain("plan in ('free', 'pro')");
    expect(migration).toContain("status in ('active', 'inactive', 'canceled', 'expired')");
    expect(migration).toContain("source in ('manual', 'stripe', 'other')");
  });

  it('allows clients to select only and defines no mutation policy', () => {
    expect(migration).toContain('alter table public.entitlements enable row level security');
    expect(migration).toContain('revoke all on table public.entitlements from anon, authenticated');
    expect(migration).toContain('grant select on table public.entitlements to authenticated');
    expect(migration).toContain('create policy "entitlements_select_own"');
    expect(migration).not.toMatch(/for (insert|update|delete)/i);
    expect(migration).not.toMatch(/grant (insert|update|delete)/i);
  });

  it('does not modify existing equipment or profiles data', () => {
    expect(migration).not.toMatch(/(drop|truncate|delete from|alter table public\.(equipment|profiles))/i);
  });
});
