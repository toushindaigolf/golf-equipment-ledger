import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { trackGa4Event } from '../lib/ga4';
import { authErrorMessage, signInWithEmail, signOut as requestSignOut, signUpWithEmail } from '../services/authService';

export type AuthOperation = 'sign-in' | 'sign-up' | 'sign-out' | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [operation, setOperation] = useState<AuthOperation>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    void supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(authErrorMessage(sessionError));
        setUser(data.session?.user ?? null);
      })
      .catch(caught => {
        if (active) setError(authErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearMessage = useCallback(() => {
    setError('');
    setNotice('');
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    clearMessage();
    setOperation('sign-in');
    try {
      await signInWithEmail(supabase, email, password);
      trackGa4Event({ name: 'login' });
      setNotice('ログインしました。クラウド上の用品データを読み込みます。端末内データは削除されません。');
      return true;
    } catch (caught) {
      setError(authErrorMessage(caught));
      return false;
    } finally {
      setOperation(null);
    }
  }, [clearMessage]);

  const signUp = useCallback(async (email: string, password: string) => {
    clearMessage();
    setOperation('sign-up');
    try {
      const result = await signUpWithEmail(supabase, email, password);
      trackGa4Event({ name: 'sign_up' });
      setNotice(result.needsEmailConfirmation
        ? '確認メールを送信しました。メール内のリンクを開いた後、ログインしてください。'
        : 'アカウントを作成し、ログインしました。');
      return true;
    } catch (caught) {
      setError(authErrorMessage(caught));
      return false;
    } finally {
      setOperation(null);
    }
  }, [clearMessage]);

  const signOut = useCallback(async () => {
    clearMessage();
    setOperation('sign-out');
    try {
      await requestSignOut(supabase);
      trackGa4Event({ name: 'logout' });
      setNotice('ログアウトしました。端末内の用品データは削除されていません。');
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setOperation(null);
    }
  }, [clearMessage]);

  return { configured: isSupabaseConfigured, user, loading, operation, error, notice, clearMessage, signIn, signUp, signOut };
}

export type AuthState = ReturnType<typeof useAuth>;
