import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  createEntitlementRepository,
  createSupabaseEntitlementGateway,
} from '../repositories/entitlementRepository';
import { entitlementRowToDomain, isActiveProEntitlement } from '../services/entitlementService';
import type { Entitlement, EntitlementAccessStatus } from '../types/entitlement';

type UseEntitlementOptions = {
  userId?: string;
  configured: boolean;
  authLoading: boolean;
};

const errorMessage = (caught: unknown) => caught instanceof Error
  ? caught.message
  : 'Pro権限を確認できませんでした。現在はFreeとして利用できます。';

export function useEntitlement({ userId, configured, authLoading }: UseEntitlementOptions) {
  const requestId = useRef(0);
  const [status, setStatus] = useState<EntitlementAccessStatus>(authLoading ? 'loading' : 'free');
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const activeRequest = ++requestId.current;
    setEntitlement(null);
    setError('');

    if (authLoading) {
      setStatus('loading');
      return;
    }
    if (!userId) {
      setStatus('free');
      return;
    }
    if (!configured || !supabase) {
      setStatus('free');
      setError('Supabaseが未設定のため、Free機能をこの端末で利用できます。');
      return;
    }

    setStatus('loading');
    const repository = createEntitlementRepository(
      createSupabaseEntitlementGateway(supabase),
      userId,
    );
    void repository.get()
      .then(row => {
        if (requestId.current !== activeRequest) return;
        const next = row ? entitlementRowToDomain(row) : null;
        setEntitlement(next);
        setStatus(isActiveProEntitlement(next) ? 'pro' : 'free');
      })
      .catch(caught => {
        if (requestId.current !== activeRequest) return;
        setStatus('error');
        setError(errorMessage(caught));
      });
  }, [authLoading, configured, reloadCount, userId]);

  const refresh = useCallback(() => setReloadCount(current => current + 1), []);

  return {
    status,
    entitlement,
    isPro: status === 'pro',
    loading: status === 'loading',
    error,
    refresh,
  };
}

export type EntitlementState = ReturnType<typeof useEntitlement>;
