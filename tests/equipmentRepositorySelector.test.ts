import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { selectEquipmentRepository } from '../src/repositories/equipmentRepositorySelector';
import type { Database } from '../src/types/database';
import type { EquipmentDataRepository } from '../src/repositories/equipmentDataRepository';

const local: EquipmentDataRepository = {
  source: 'local',
  getAll: async () => [],
  create: async () => { throw new Error('unused'); },
  update: async () => { throw new Error('unused'); },
  remove: async () => undefined,
};

describe('equipment repository selector', () => {
  it('uses localStorage for signed-out users', () => {
    expect(selectEquipmentRepository(undefined, null, local)).toBe(local);
  });

  it('safely falls back to localStorage when Supabase is not configured', () => {
    expect(selectEquipmentRepository('user-a', null, local)).toBe(local);
  });

  it('selects cloud storage only when both user and client exist', () => {
    const client = {} as SupabaseClient<Database>;
    expect(selectEquipmentRepository('user-a', client, local).source).toBe('cloud');
  });
});
