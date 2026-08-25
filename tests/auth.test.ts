import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  AuthUnavailableError,
  authErrorMessage,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '../src/services/authService';

describe('authErrorMessage', () => {
  it('translates invalid credentials without exposing the Supabase message', () => {
    expect(authErrorMessage({ code: 'invalid_credentials', message: 'Invalid login credentials' }))
      .toBe('メールアドレスまたはパスワードが正しくありません。');
  });

  it('guides users who have not confirmed their email', () => {
    expect(authErrorMessage({ code: 'email_not_confirmed', message: 'Email not confirmed' }))
      .toBe('メールアドレスの確認が完了していません。確認メールをご確認ください。');
  });

  it('explains that local features remain available when Supabase is not configured', () => {
    expect(authErrorMessage(new AuthUnavailableError()))
      .toContain('用品記録は引き続きこの端末で利用できます');
  });

  it('uses a safe Japanese fallback for unknown errors', () => {
    expect(authErrorMessage(new Error('unexpected')))
      .toBe('認証処理に失敗しました。しばらくしてからもう一度お試しください。');
  });
});

describe('email authentication operations', () => {
  it('passes email and password to sign in', async () => {
    let received: unknown;
    const client = { auth: { signInWithPassword: async (credentials: unknown) => {
      received = credentials;
      return { data: { user: { id: 'user-1' } }, error: null };
    } } } as unknown as SupabaseClient;

    await signInWithEmail(client, 'golfer@example.com', 'secret12');
    expect(received).toEqual({ email: 'golfer@example.com', password: 'secret12' });
  });

  it('reports when email confirmation is required after sign up', async () => {
    const client = { auth: { signUp: async () => ({
      data: { user: { id: 'user-1' }, session: null },
      error: null,
    }) } } as unknown as SupabaseClient;

    await expect(signUpWithEmail(client, 'golfer@example.com', 'secret12'))
      .resolves.toMatchObject({ needsEmailConfirmation: true });
  });

  it('requests Supabase sign out', async () => {
    let called = false;
    const client = { auth: { signOut: async () => {
      called = true;
      return { error: null };
    } } } as unknown as SupabaseClient;

    await signOut(client);
    expect(called).toBe(true);
  });
});
