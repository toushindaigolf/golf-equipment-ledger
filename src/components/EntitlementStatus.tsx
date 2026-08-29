import type { EntitlementState } from '../hooks/useEntitlement';

export function EntitlementStatus({ entitlement, signedIn }: {
  entitlement: EntitlementState;
  signedIn: boolean;
}) {
  if (entitlement.loading) {
    return <section className="entitlement-status" aria-live="polite">
      <span className="auth-spinner" aria-hidden="true" />プランを確認中…
    </section>;
  }

  if (entitlement.status === 'error') {
    return <section className="entitlement-status error" role="alert">
      <div><strong>Freeとして利用中</strong><span>{entitlement.error}</span></div>
      <button type="button" className="secondary" onClick={entitlement.refresh}>再確認</button>
    </section>;
  }

  if (entitlement.isPro) {
    return <section className="entitlement-status pro" aria-label="利用プラン">
      <div><strong>Proプラン</strong><span>クラウド保存、詳細分析、CSV出力などを利用できます。</span></div>
    </section>;
  }

  return <section className="entitlement-status" aria-label="利用プラン">
    <div>
      <strong>Freeプラン</strong>
      <span>{signedIn
        ? 'クラウド保存は移行期間中のため利用できます。Pro機能は案内表示になります。'
        : '用品の登録・編集・削除、基本検索、データの保存を利用できます。'}</span>
    </div>
  </section>;
}
