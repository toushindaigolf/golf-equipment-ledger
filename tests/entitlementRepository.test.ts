import { describe, expect, it, vi } from 'vitest';
import {
  createEntitlementRepository,
  type EntitlementGateway,
  type EntitlementRow,
} from '../src/repositories/entitlementRepository';

const row: EntitlementRow = {
  id: 'entitlement-1',
  user_id: 'user-a',
  plan: 'pro',
  status: 'active',
  source: 'manual',
  expires_at: null,
  created_at: '2026-08-29T00:00:00.000Z',
  updated_at: '2026-08-29T00:00:00.000Z',
};

describe('entitlement repository', () => {
  it('always requests the authenticated user row', async () => {
    const gateway: EntitlementGateway = { findByUserId: vi.fn(async () => row) };
    const repository = createEntitlementRepository(gateway, 'user-a');

    expect(await repository.get()).toEqual(row);
    expect(gateway.findByUserId).toHaveBeenCalledWith('user-a');
  });

  it('supports a missing row as Free input', async () => {
    const gateway: EntitlementGateway = { findByUserId: vi.fn(async () => null) };
    expect(await createEntitlementRepository(gateway, 'user-a').get()).toBeNull();
  });

  it('does not expose any client mutation operation', () => {
    const gateway: EntitlementGateway = { findByUserId: vi.fn(async () => row) };
    const repository = createEntitlementRepository(gateway, 'user-a');
    expect(repository).not.toHaveProperty('insert');
    expect(repository).not.toHaveProperty('update');
    expect(repository).not.toHaveProperty('remove');
  });

  it('fails safely when Supabase cannot be reached', async () => {
    const gateway: EntitlementGateway = { findByUserId: vi.fn(async () => { throw new Error('offline'); }) };
    await expect(createEntitlementRepository(gateway, 'user-a').get())
      .rejects.toThrow('現在はFreeとして利用できます');
  });
});
