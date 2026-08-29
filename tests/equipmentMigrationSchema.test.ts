import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../supabase/migrations/20260827000100_add_equipment_source_id.sql', import.meta.url),
  'utf8',
);

describe('Phase 3-3 migration identity schema', () => {
  it('adds a nullable source id without replacing the equipment primary key', () => {
    expect(migration).toContain('add column source_id text');
    expect(migration).not.toMatch(/drop\s+(column|constraint|table)/i);
  });

  it('prevents duplicate local ids per user', () => {
    expect(migration).toContain('unique (user_id, source_id)');
  });

  it('does not add Pro, payment, or entitlement fields', () => {
    expect(migration).not.toMatch(/\b(is_pro|entitlements?|payments?|stripe)\b/i);
  });
});
