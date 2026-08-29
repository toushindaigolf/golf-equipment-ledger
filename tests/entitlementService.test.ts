import { describe, expect, it } from 'vitest';
import { isActiveProEntitlement } from '../src/services/entitlementService';
import type { Entitlement } from '../src/types/entitlement';

const now = new Date('2026-08-29T00:00:00.000Z');
const entitlement = (overrides: Partial<Entitlement> = {}): Entitlement => ({
  id: 'entitlement-1',
  userId: 'user-a',
  plan: 'pro',
  status: 'active',
  source: 'manual',
  expiresAt: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  ...overrides,
});

describe('Pro entitlement decision', () => {
  it('treats an active Pro with no expiry as indefinite Pro', () => {
    expect(isActiveProEntitlement(entitlement(), now)).toBe(true);
  });

  it('accepts only a future expiry', () => {
    expect(isActiveProEntitlement(entitlement({ expiresAt: '2026-08-30T00:00:00.000Z' }), now)).toBe(true);
    expect(isActiveProEntitlement(entitlement({ expiresAt: '2026-08-28T23:59:59.000Z' }), now)).toBe(false);
    expect(isActiveProEntitlement(entitlement({ expiresAt: 'invalid' }), now)).toBe(false);
  });

  it.each(['inactive', 'canceled', 'expired'] as const)('treats %s as Free', status => {
    expect(isActiveProEntitlement(entitlement({ status }), now)).toBe(false);
  });

  it('treats a Free row or missing row as Free', () => {
    expect(isActiveProEntitlement(entitlement({ plan: 'free' }), now)).toBe(false);
    expect(isActiveProEntitlement(null, now)).toBe(false);
  });
});
