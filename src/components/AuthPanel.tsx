import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { AuthState } from '../hooks/useAuth';

type AuthMode = 'sign-in' | 'sign-up';

function AuthDialog({ auth, onClose }: { auth: AuthState; onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const busy = auth.operation !== null;

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    auth.clearMessage();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const success = mode === 'sign-in'
      ? await auth.signIn(email.trim(), password)
      : await auth.signUp(email.trim(), password);
    if (success && mode === 'sign-in') onClose();
  };

  return <div className="overlay auth-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section className="panel auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
      <div className="panel-head">
        <div><p className="eyebrow">アカウント</p><h2 id="auth-dialog-title">{mode === 'sign-in' ? 'ログイン' : 'アカウント作成'}</h2></div>
        <button className="icon-button" type="button" onClick={onClose} disabled={busy} aria-label="閉じる">×</button>
      </div>
      <div className="auth-mode" aria-label="認証方法">
        <button type="button" className={mode === 'sign-in' ? 'active' : ''} onClick={() => changeMode('sign-in')} aria-pressed={mode === 'sign-in'}>ログイン</button>
        <button type="button" className={mode === 'sign-up' ? 'active' : ''} onClick={() => changeMode('sign-up')} aria-pressed={mode === 'sign-up'}>アカウント作成</button>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <label>メールアドレス<input ref={emailRef} type="email" inputMode="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required disabled={busy} /></label>
        <label>パスワード<input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={6} value={password} onChange={event => setPassword(event.target.value)} required disabled={busy} /><small>6文字以上で入力してください。</small></label>
        {auth.error && <p className="auth-message error" role="alert">{auth.error}</p>}
        {auth.notice && <p className="auth-message notice" role="status">{auth.notice}</p>}
        <button className="primary auth-submit" type="submit" disabled={busy}>{busy ? '処理中…' : mode === 'sign-in' ? 'ログインする' : 'アカウントを作成'}</button>
      </form>
      <p className="auth-local-note">Phase 2では、ログイン後も用品データはこの端末のみに保存されます。</p>
    </section>
  </div>;
}

export function AuthPanel({ auth }: { auth: AuthState }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!auth.configured) {
    return <section className="auth-status" aria-label="アカウント状態"><div><strong>アカウント機能は準備中です</strong><span>用品記録はこれまでどおり、この端末に保存されます。</span></div></section>;
  }

  if (auth.loading) {
    return <section className="auth-status is-loading" aria-live="polite"><span className="auth-spinner" aria-hidden="true" />認証状態を確認中…</section>;
  }

  return <>
    <section className="auth-status" aria-label="アカウント状態">
      <div><strong>{auth.user ? 'ログイン中' : '未ログイン'}</strong><span>{auth.user?.email ?? '用品記録はこの端末に保存されています。'}</span></div>
      {auth.user
        ? <button className="secondary auth-action" type="button" onClick={() => void auth.signOut()} disabled={auth.operation === 'sign-out'}>{auth.operation === 'sign-out' ? 'ログアウト中…' : 'ログアウト'}</button>
        : <button className="secondary auth-action" type="button" onClick={() => { auth.clearMessage(); setDialogOpen(true); }}>ログイン / 登録</button>}
    </section>
    {auth.notice && !dialogOpen && <p className="auth-page-message" role="status">{auth.notice}</p>}
    {auth.error && !dialogOpen && <p className="auth-page-message error" role="alert">{auth.error}</p>}
    {dialogOpen && <AuthDialog auth={auth} onClose={() => { auth.clearMessage(); setDialogOpen(false); }} />}
  </>;
}
