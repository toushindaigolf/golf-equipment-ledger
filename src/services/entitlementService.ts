import type { EntitlementRow } from '../repositories/entitlementRepository';
import type { Entitlement } from '../types/entitlement';

export const entitlementRowToDomain = (row: EntitlementRow): Entitlement => ({
  id: row.id,
  userId: row.user_id,
  plan: row.plan,
  status: row.status,
  source: row.source,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function isActiveProEntitlement(
  entitlement: Pick<Entitlement, 'plan' | 'status' | 'expiresAt'> | null,
  now = new Date(),
) {
  if (!entitlement || entitlement.plan !== 'pro' || entitlement.status !== 'active') return false;
  if (entitlement.expiresAt === null) return true;
  const expiresAt = new Date(entitlement.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > now.getTime();
}
