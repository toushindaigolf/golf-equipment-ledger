import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export type EntitlementRow = Database['public']['Tables']['entitlements']['Row'];

export type EntitlementGateway = {
  findByUserId(userId: string): Promise<EntitlementRow | null>;
};

export class EntitlementRepositoryError extends Error {
  readonly originalError: unknown;

  constructor(originalError?: unknown) {
    super('Pro権限を確認できませんでした。現在はFreeとして利用できます。');
    this.name = 'EntitlementRepositoryError';
    this.originalError = originalError;
  }
}

export function createSupabaseEntitlementGateway(
  client: SupabaseClient<Database>,
): EntitlementGateway {
  return {
    async findByUserId(userId) {
      const { data, error } = await client
        .from('entitlements')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  };
}

export function createEntitlementRepository(
  gateway: EntitlementGateway,
  authenticatedUserId: string,
) {
  if (!authenticatedUserId) throw new Error('権限確認には認証中のユーザーIDが必要です。');

  return {
    async get() {
      try {
        return await gateway.findByUserId(authenticatedUserId);
      } catch (cause) {
        throw new EntitlementRepositoryError(cause);
      }
    },
  };
}
