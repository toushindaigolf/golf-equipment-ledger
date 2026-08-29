import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  createMigrationBackup,
  createMigrationPreview,
  migrationBackupFilename,
  readLocalMigrationItems,
  runEquipmentMigration,
} from '../lib/equipmentMigration';
import {
  createEquipmentMigrationCloudRepository,
  createEquipmentMigrationStateRepository,
  downloadMigrationBackup,
} from '../repositories/equipmentMigrationRepository';
import type { GolfEquipment } from '../types/equipment';
import type {
  CloudMigrationEquipment,
  EquipmentMigrationPreview,
  EquipmentMigrationProgress,
  EquipmentMigrationRecord,
  EquipmentMigrationStatus,
} from '../types/equipmentMigration';

type UseEquipmentMigrationOptions = {
  userId?: string;
  configured: boolean;
  authLoading: boolean;
  onMigrated: () => void;
};

const emptyPreview: EquipmentMigrationPreview = {
  localCount: 0,
  cloudCount: 0,
  addCount: 0,
  updateCount: 0,
  unchangedCount: 0,
  unrelatedCloudCount: 0,
};

const messageOf = (caught: unknown) => caught instanceof Error
  ? caught.message
  : 'データ移行の処理に失敗しました。端末内データは保持されています。';

export function useEquipmentMigration({ userId, configured, authLoading, onMigrated }: UseEquipmentMigrationOptions) {
  const requestId = useRef(0);
  const inspectedUser = useRef(userId);
  const stateRepository = useMemo(() => createEquipmentMigrationStateRepository(localStorage), []);
  const cloudRepository = useMemo(
    () => userId && supabase ? createEquipmentMigrationCloudRepository(supabase, userId) : null,
    [userId],
  );
  const [localItems, setLocalItems] = useState<GolfEquipment[]>([]);
  const [cloudItems, setCloudItems] = useState<CloudMigrationEquipment[]>([]);
  const [preview, setPreview] = useState<EquipmentMigrationPreview>(emptyPreview);
  const [record, setRecord] = useState<EquipmentMigrationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState<EquipmentMigrationProgress | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const inspect = useCallback(async () => {
    const activeRequest = ++requestId.current;
    setError('');
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!userId) {
      setLoading(false);
      setLocalItems([]);
      setCloudItems([]);
      setPreview(emptyPreview);
      setRecord(null);
      setDialogOpen(false);
      return;
    }
    if (!configured || !cloudRepository) {
      setLoading(false);
      setError('クラウド移行にはSupabaseの設定が必要です。端末内データはそのまま利用できます。');
      return;
    }

    setLoading(true);
    try {
      const nextLocalItems = readLocalMigrationItems(localStorage);
      const nextCloudItems = await cloudRepository.getAll();
      if (requestId.current !== activeRequest) return;
      setLocalItems(nextLocalItems);
      setCloudItems(nextCloudItems);
      setPreview(createMigrationPreview(nextLocalItems, nextCloudItems));
      setRecord(stateRepository.get(userId));
    } catch (caught) {
      if (requestId.current === activeRequest) setError(messageOf(caught));
    } finally {
      if (requestId.current === activeRequest) setLoading(false);
    }
  }, [authLoading, cloudRepository, configured, stateRepository, userId]);

  useEffect(() => {
    if (inspectedUser.current !== userId) {
      inspectedUser.current = userId;
      setLocalItems([]);
      setCloudItems([]);
      setPreview(emptyPreview);
      setRecord(null);
      setError('');
      setDialogOpen(false);
    }
    setNotice('');
    setProgress(null);
    void inspect();
  }, [inspect, userId]);

  const downloadBackup = useCallback(async () => {
    if (localItems.length === 0) throw new Error('バックアップする端末内データはありません。');
    const createdAt = new Date().toISOString();
    const backup = createMigrationBackup(localItems, createdAt);
    downloadMigrationBackup(JSON.stringify(backup, null, 2), migrationBackupFilename(createdAt));
    return createdAt;
  }, [localItems]);

  const saveRecord = useCallback((next: EquipmentMigrationRecord) => {
    setRecord(next);
    stateRepository.save(next);
  }, [stateRepository]);

  const backupNow = useCallback(async () => {
    setError('');
    try {
      await downloadBackup();
      setNotice('端末内データのJSONバックアップを作成しました。');
      return true;
    } catch (caught) {
      setError(`${messageOf(caught)} 移行は開始されていません。`);
      return false;
    }
  }, [downloadBackup]);

  const migrate = useCallback(async (strategy: 'append' | 'local_priority') => {
    setError('');
    setNotice('');
    if (!userId || !configured || !cloudRepository) {
      setError('ログインとSupabase設定を確認してください。端末内データは変更されていません。');
      return false;
    }
    if (localItems.length === 0) {
      setError('移行する端末内データはありません。');
      return false;
    }

    const startedAt = new Date().toISOString();
    const initialProgress: EquipmentMigrationProgress = {
      total: localItems.length,
      processed: 0,
      success: 0,
      skipped: 0,
      failed: 0,
    };
    setMigrating(true);
    setProgress(initialProgress);
    setDialogOpen(true);
    try {
      saveRecord({
        version: 1,
        userId,
        status: 'in_progress',
        localCount: localItems.length,
        cloudCount: cloudItems.length,
        ...initialProgress,
        lastAttemptAt: startedAt,
        completedAt: null,
        backupCreatedAt: null,
        failedSourceIds: [],
      });

      const result = await runEquipmentMigration({
        localItems,
        cloudItems,
        strategy,
        cloud: cloudRepository,
        createBackup: downloadBackup,
        onProgress: setProgress,
      });
      const status: EquipmentMigrationStatus = result.failed === 0
        ? 'completed'
        : result.success + result.skipped > 0 ? 'partial' : 'failed';
      const completedAt = status === 'completed' ? new Date().toISOString() : null;
      const nextRecord: EquipmentMigrationRecord = {
        version: 1,
        userId,
        status,
        localCount: localItems.length,
        cloudCount: cloudItems.length,
        total: result.total,
        processed: result.processed,
        success: result.success,
        skipped: result.skipped,
        failed: result.failed,
        lastAttemptAt: startedAt,
        completedAt,
        backupCreatedAt: result.backupCreatedAt,
        failedSourceIds: result.failedSourceIds,
      };
      let stateWarning = '';
      try {
        saveRecord(nextRecord);
      } catch {
        stateWarning = '移行結果をこの端末へ記録できませんでしたが、クラウド処理と端末内データには影響ありません。';
      }
      setNotice(status === 'completed'
        ? `移行が完了しました。成功${result.success}件、確認済み${result.skipped}件です。端末内データは保持されています。`
        : `一部の移行に失敗しました。成功${result.success}件、確認済み${result.skipped}件、失敗${result.failed}件です。再試行できます。`);
      onMigrated();
      try {
        const refreshedCloudItems = await cloudRepository.getAll();
        setCloudItems(refreshedCloudItems);
        setPreview(createMigrationPreview(localItems, refreshedCloudItems));
      } catch {
        setError('移行結果の画面更新に失敗しました。ページを再読み込みしてください。端末内データは保持されています。');
      }
      if (stateWarning) setError(stateWarning);
      return status === 'completed';
    } catch (caught) {
      const failedRecord: EquipmentMigrationRecord = {
        version: 1,
        userId,
        status: 'failed',
        localCount: localItems.length,
        cloudCount: cloudItems.length,
        ...(progress ?? initialProgress),
        lastAttemptAt: startedAt,
        completedAt: null,
        backupCreatedAt: null,
        failedSourceIds: [],
      };
      try { saveRecord(failedRecord); } catch { /* The equipment data remains untouched. */ }
      setError(`${messageOf(caught)} 移行は開始または完了していません。端末内データは保持されています。`);
      return false;
    } finally {
      setMigrating(false);
    }
  }, [cloudItems, cloudRepository, configured, downloadBackup, localItems, onMigrated, progress, saveRecord, userId]);

  const defer = useCallback((cloudPreferred = false) => {
    if (!userId) return;
    const now = new Date().toISOString();
    const baseProgress: EquipmentMigrationProgress = progress ?? {
      total: localItems.length,
      processed: 0,
      success: 0,
      skipped: 0,
      failed: 0,
    };
    try {
      saveRecord({
        version: 1,
        userId,
        status: 'deferred',
        localCount: localItems.length,
        cloudCount: cloudItems.length,
        ...baseProgress,
        lastAttemptAt: now,
        completedAt: null,
        backupCreatedAt: record?.backupCreatedAt ?? null,
        failedSourceIds: record?.failedSourceIds ?? [],
      });
    } catch {
      setError('保留状態を保存できませんでしたが、用品データは変更されていません。');
    }
    setNotice(cloudPreferred
      ? 'クラウドデータを優先しました。端末内データは削除されていません。'
      : '移行を保留しました。後からいつでも再開できます。');
    setDialogOpen(false);
  }, [cloudItems.length, localItems.length, progress, record, saveRecord, userId]);

  const pendingCount = preview.addCount + preview.updateCount;
  const effectivelyCompleted = preview.localCount > 0 && pendingCount === 0;

  return {
    configured,
    signedIn: Boolean(userId),
    loading,
    migrating,
    progress,
    preview,
    record,
    error,
    notice,
    dialogOpen,
    effectivelyCompleted,
    pendingCount,
    inspect,
    backupNow,
    migrate,
    defer,
    openDialog: () => setDialogOpen(true),
    closeDialog: () => { if (!migrating) setDialogOpen(false); },
    cancel: () => {
      if (migrating) return;
      setNotice('移行をキャンセルしました。端末内・クラウドのデータは変更されていません。');
      setDialogOpen(false);
    },
  };
}

export type EquipmentMigrationState = ReturnType<typeof useEquipmentMigration>;
