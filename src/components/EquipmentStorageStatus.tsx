import type { EquipmentStorageSource } from '../repositories/equipmentDataRepository';

export function EquipmentStorageStatus({ source, loading, saving, error, onRetry }: {
  source: EquipmentStorageSource;
  loading: boolean;
  saving: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (error) {
    return <section className="storage-status error" role="alert"><div><strong>用品データを保存できませんでした</strong><span>{error}</span></div><button type="button" className="secondary" onClick={onRetry}>再読み込み</button></section>;
  }
  if (loading || saving) {
    return <section className="storage-status" aria-live="polite"><span className="auth-spinner" aria-hidden="true" />{loading ? '用品データを読み込み中…' : '用品データを保存中…'}</section>;
  }
  if (source === 'cloud') {
    return <section className="storage-status cloud" aria-label="用品データの保存先"><div><strong>クラウド保存</strong><span>端末内の用品データは自動移行されていません。</span></div></section>;
  }
  return null;
}
