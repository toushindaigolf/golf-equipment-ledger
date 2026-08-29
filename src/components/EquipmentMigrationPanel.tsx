import type { EquipmentMigrationState } from '../hooks/useEquipmentMigration';

const dateTime = (value: string | null | undefined) => value
  ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '';

export function EquipmentMigrationPanel({ migration }: { migration: EquipmentMigrationState }) {
  if (!migration.signedIn) {
    return migration.configured ? null : <section className="migration-status error" aria-label="クラウド移行の設定">
      <div><strong>クラウドへの移行には接続設定が必要です</strong><span>端末内の用品記録機能はこれまでどおり利用でき、データは削除されません。</span></div>
    </section>;
  }

  const { preview, progress } = migration;
  const startMigration = () => {
    if (preview.cloudCount === 0) {
      if (confirm(`端末内の${preview.localCount}件をクラウドへ移行します。\n移行前に保存データファイルを自動作成し、端末内データは移行後も保持します。`)) {
        void migration.migrate('append');
      }
      return;
    }
    migration.openDialog();
  };
  const useLocalPriority = () => {
    const effect = `端末内${preview.localCount}件のうち、追加${preview.addCount}件・更新候補${preview.updateCount}件を処理します。\n既存クラウド${preview.cloudCount}件は削除しません。同じ移行元IDの${preview.updateCount}件だけ端末内データで更新します。`;
    if (confirm(`${effect}\n\n移行前に保存データファイルを作成して続行しますか？`)) {
      void migration.migrate('local_priority');
    }
  };

  return <>
    <section className={`migration-status${migration.error ? ' error' : ''}`} aria-label="端末データのクラウド移行">
      <div>
        <strong>{migration.loading ? '移行可能なデータを確認中…' : migration.effectivelyCompleted ? '端末データは移行済みです' : preview.localCount === 0 ? '移行するデータはありません' : `端末内に${preview.localCount}件のデータがあります`}</strong>
        {!migration.loading && preview.localCount > 0 && !migration.effectivelyCompleted && <span>クラウドは{preview.cloudCount}件です。明示的に実行するまで移行されません。</span>}
        {migration.effectivelyCompleted && <span>クラウドに同じ移行元データを確認しました。端末内データも保持されています。</span>}
        {migration.record?.completedAt && <small>最終完了：{dateTime(migration.record.completedAt)}</small>}
        {migration.record?.status === 'partial' && <small className="migration-error">前回は一部失敗しました。失敗した用品は再試行できます。</small>}
        {migration.record?.status === 'failed' && <small className="migration-error">前回の移行は完了していません。端末内データを確認して再試行できます。</small>}
        {migration.record?.status === 'in_progress' && !migration.migrating && <small className="migration-error">前回の移行が途中で終了しました。移行済みデータを確認して安全に再試行できます。</small>}
        {migration.record?.status === 'deferred' && <small>移行は保留中です。端末内データは保持されています。</small>}
        {migration.notice && <small className="migration-notice" role="status">{migration.notice}</small>}
        {migration.error && <small className="migration-error" role="alert">{migration.error}</small>}
      </div>
      {!migration.loading && preview.localCount > 0 && <div className="migration-actions">
        <button type="button" className="secondary" disabled={migration.migrating} onClick={() => void migration.backupNow()}>データを保存</button>
        {!migration.effectivelyCompleted && <button type="button" className="primary" disabled={migration.migrating} onClick={startMigration}>クラウドへ移行する</button>}
        {!migration.effectivelyCompleted && <button type="button" className="text-button" disabled={migration.migrating} onClick={() => migration.defer(false)}>あとで</button>}
        <button type="button" className="text-button" disabled={migration.migrating} onClick={migration.openDialog}>移行について確認する</button>
      </div>}
    </section>

    {migration.dialogOpen && <div className="overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) migration.cancel(); }}>
      <section className="panel migration-dialog" role="dialog" aria-modal="true" aria-label="端末データのクラウド移行">
        <div className="panel-head"><div><p className="eyebrow">データ移行</p><h2>端末内データをクラウドへ移行</h2></div><button type="button" className="icon-button" disabled={migration.migrating} onClick={migration.cancel} aria-label="閉じる">×</button></div>
        <p>移行すると、ログインした端末から同じ用品記録を利用できます。開始前に保存データファイルを自動作成し、完了後も端末内データは削除しません。</p>
        <dl className="migration-counts">
          <div><dt>端末内</dt><dd>{preview.localCount}件</dd></div>
          <div><dt>クラウド</dt><dd>{preview.cloudCount}件</dd></div>
          <div><dt>追加候補</dt><dd>{preview.addCount}件</dd></div>
          <div><dt>更新候補</dt><dd>{preview.updateCount}件</dd></div>
          <div><dt>移行済み</dt><dd>{preview.unchangedCount}件</dd></div>
          <div><dt>クラウド固有</dt><dd>{preview.unrelatedCloudCount}件</dd></div>
        </dl>
        {preview.cloudCount > 0 && <p className="migration-warning">クラウドにもデータがあります。自動的な統合・削除は行いません。端末優先を選んでも、クラウド固有データは残ります。</p>}
        {progress && <div className="migration-progress" aria-live="polite">
          <progress max={Math.max(progress.total, 1)} value={progress.processed} />
          <span>{progress.processed}/{progress.total}件　成功 {progress.success}・確認済み {progress.skipped}・失敗 {progress.failed}</span>
        </div>}
        {migration.notice && <p className="auth-message notice" role="status">{migration.notice}</p>}
        {migration.error && <p className="auth-message error" role="alert">{migration.error}</p>}
        <div className="migration-dialog-actions">
          <button type="button" className="secondary" disabled={migration.migrating || preview.localCount === 0} onClick={() => void migration.backupNow()}>保存データをダウンロード</button>
          {preview.cloudCount === 0 && preview.localCount > 0 && <button type="button" className="primary" disabled={migration.migrating} onClick={startMigration}>クラウドへ移行する</button>}
          {preview.cloudCount > 0 && preview.localCount > 0 && <>
            <button type="button" className="primary" disabled={migration.migrating} onClick={useLocalPriority}>端末内データを優先</button>
            <button type="button" className="secondary" disabled={migration.migrating} onClick={() => migration.defer(true)}>クラウドデータを優先</button>
          </>}
          <button type="button" className="text-button" disabled={migration.migrating} onClick={migration.cancel}>移行をキャンセル</button>
        </div>
      </section>
    </div>}
  </>;
}
