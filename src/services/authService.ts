import type { AuthError, SupabaseClient } from '@supabase/supabase-js';

export class AuthUnavailableError extends Error {
  constructor() {
    super('Supabaseが設定されていません。');
    this.name = 'AuthUnavailableError';
  }
}

export function authErrorMessage(error: unknown) {
  if (error instanceof AuthUnavailableError) {
    return 'アカウント機能は現在準備中です。用品記録は引き続きこの端末で利用できます。';
  }

  const authError = error as Partial<AuthError> | undefined;
  const code = authError?.code?.toLowerCase() ?? '';
  const message = authError?.message?.toLowerCase() ?? '';

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) return 'メールアドレスまたはパスワードが正しくありません。';
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) return 'メールアドレスの確認が完了していません。確認メールをご確認ください。';
  if (code === 'user_already_exists' || message.includes('already registered')) return 'このメールアドレスはすでに登録されています。ログインをお試しください。';
  if (code === 'weak_password' || message.includes('password should be at least')) return 'パスワードは6文字以上で入力してください。';
  if (code.includes('rate_limit') || message.includes('rate limit')) return '試行回数が上限に達しました。しばらく時間を置いてからお試しください。';
  if (code === 'validation_failed' || message.includes('invalid email')) return '有効なメールアドレスを入力してください。';
  if (message.includes('fetch') || message.includes('network')) return '通信に失敗しました。インターネット接続をご確認ください。';
  return '認証処理に失敗しました。しばらくしてからもう一度お試しください。';
}

function requireClient(client: SupabaseClient | null) {
  if (!client) throw new AuthUnavailableError();
  return client;
}

export function authRedirectUrl() {
  if (typeof window === 'undefined') return undefined;
  return new URL(import.meta.env.BASE_URL, window.location.href).href;
}

export async function signUpWithEmail(client: SupabaseClient | null, email: string, password: string) {
  const { data, error } = await requireClient(client).auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authRedirectUrl() },
  });
  if (error) throw error;
  return { user: data.user, needsEmailConfirmation: data.session === null };
}

export async function signInWithEmail(client: SupabaseClient | null, email: string, password: string) {
  const { data, error } = await requireClient(client).auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut(client: SupabaseClient | null) {
  const { error } = await requireClient(client).auth.signOut();
  if (error) throw error;
}
