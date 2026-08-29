import { describe, expect, it, vi } from 'vitest';
import {
  createMigrationBackup,
  createMigrationPreview,
  readLocalMigrationItems,
  runEquipmentMigration,
} from '../src/lib/equipmentMigration';
import {
  createEquipmentMigrationCloudRepository,
  createEquipmentMigrationStateRepository,
} from '../src/repositories/equipmentMigrationRepository';
import { EQUIPMENT_STORAGE_KEY } from '../src/repositories/equipmentRepository';
import { parseEquipmentData } from '../src/lib/equipmentData';
import { currentEquipment } from './fixtures/equipment';
import type { EquipmentMigrationRecord } from '../src/types/equipmentMigration';

const secondEquipment = {
  ...currentEquipment,
  id: 'fixture-current-2',
  name: 'テストパター',
  categoryId: 'putter',
};

const storage = (raw: string | null) => {
  let value = raw;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => { value = next; }),
    value: () => value,
  };
};

describe('equipment migration', () => {
  it('detects migratable localStorage data without changing the source', () => {
    const raw = JSON.stringify([{ ...currentEquipment }, { ...currentEquipment, id: 'demo-1' }]);
    const local = storage(raw);

    expect(readLocalMigrationItems(local)).toEqual([currentEquipment]);
    expect(local.value()).toBe(raw);
    expect(local.setItem).not.toHaveBeenCalled();
  });

  it('treats missing localStorage data as an empty migration', () => {
    expect(readLocalMigrationItems(storage(null))).toEqual([]);
  });

  it('rejects broken localStorage JSON without overwriting it', () => {
    const local = storage('{broken');
    expect(() => readLocalMigrationItems(local)).toThrow('端末内データが壊れている');
    expect(local.value()).toBe('{broken');
    expect(local.setItem).not.toHaveBeenCalled();
  });

  it('creates a restorable metadata backup before migration', () => {
    const backup = createMigrationBackup([currentEquipment], '2026-08-27T00:00:00.000Z');
    expect(backup.metadata).toEqual(expect.objectContaining({
      itemCount: 1,
      sourceStorageKey: EQUIPMENT_STORAGE_KEY,
      purpose: 'pre-cloud-migration',
    }));
    expect(parseEquipmentData(backup)).toMatchObject({ ok: true, items: [currentEquipment] });
  });

  it('does not start cloud writes when backup creation fails', async () => {
    const insertIfMissing = vi.fn();
    await expect(runEquipmentMigration({
      localItems: [currentEquipment],
      cloudItems: [],
      strategy: 'append',
      cloud: { insertIfMissing, overwriteMigrated: vi.fn() },
      createBackup: async () => { throw new Error('download blocked'); },
    })).rejects.toThrow('download blocked');
    expect(insertIfMissing).not.toHaveBeenCalled();
  });

  it('migrates new rows and leaves the localStorage source intact', async () => {
    const raw = JSON.stringify([currentEquipment]);
    const local = storage(raw);
    const items = readLocalMigrationItems(local);
    const insertIfMissing = vi.fn(async () => 'inserted' as const);
    const result = await runEquipmentMigration({
      localItems: items,
      cloudItems: [],
      strategy: 'append',
      cloud: { insertIfMissing, overwriteMigrated: vi.fn() },
      createBackup: async () => '2026-08-27T00:00:00.000Z',
    });

    expect(result).toMatchObject({ success: 1, skipped: 0, failed: 0 });
    expect(insertIfMissing).toHaveBeenCalledWith(currentEquipment);
    expect(local.value()).toBe(raw);
    expect(local.setItem).not.toHaveBeenCalled();
  });

  it('does not overwrite an existing migrated row in append mode', async () => {
    const overwriteMigrated = vi.fn();
    const changedCloud = { ...currentEquipment, name: 'クラウド側の名称' };
    const result = await runEquipmentMigration({
      localItems: [currentEquipment],
      cloudItems: [{ sourceId: currentEquipment.id, item: changedCloud }],
      strategy: 'append',
      cloud: { insertIfMissing: vi.fn(), overwriteMigrated },
      createBackup: async () => '2026-08-27T00:00:00.000Z',
    });

    expect(result).toMatchObject({ success: 0, skipped: 1, failed: 0 });
    expect(overwriteMigrated).not.toHaveBeenCalled();
  });

  it('updates only the same source id after local priority is explicitly selected', async () => {
    const overwriteMigrated = vi.fn(async () => undefined);
    const unrelated = { ...secondEquipment, id: 'cloud-only' };
    const changedCloud = { ...currentEquipment, name: 'クラウド側の名称' };
    const cloudItems = [
      { sourceId: currentEquipment.id, item: changedCloud },
      { sourceId: null, item: unrelated },
    ];
    const preview = createMigrationPreview([currentEquipment], cloudItems);
    const result = await runEquipmentMigration({
      localItems: [currentEquipment],
      cloudItems,
      strategy: 'local_priority',
      cloud: { insertIfMissing: vi.fn(), overwriteMigrated },
      createBackup: async () => '2026-08-27T00:00:00.000Z',
    });

    expect(preview).toMatchObject({ updateCount: 1, unrelatedCloudCount: 1 });
    expect(overwriteMigrated).toHaveBeenCalledWith(currentEquipment);
    expect(result.success).toBe(1);
  });

  it('handles partial failures and reports retryable source ids', async () => {
    const insertIfMissing = vi.fn(async (item: typeof currentEquipment) => {
      if (item.id === secondEquipment.id) throw new Error('network');
      return 'inserted' as const;
    });
    const result = await runEquipmentMigration({
      localItems: [currentEquipment, secondEquipment],
      cloudItems: [],
      strategy: 'append',
      cloud: { insertIfMissing, overwriteMigrated: vi.fn() },
      createBackup: async () => '2026-08-27T00:00:00.000Z',
    });

    expect(result).toMatchObject({ processed: 2, success: 1, failed: 1 });
    expect(result.failedSourceIds).toEqual([secondEquipment.id]);
  });

  it('persists migration state separately for each authenticated user', () => {
    const values = new Map<string, string>();
    const repository = createEquipmentMigrationStateRepository({
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); },
    });
    const record: EquipmentMigrationRecord = {
      version: 1,
      userId: 'user-a',
      status: 'completed',
      localCount: 1,
      cloudCount: 0,
      total: 1,
      processed: 1,
      success: 1,
      skipped: 0,
      failed: 0,
      lastAttemptAt: '2026-08-27T00:00:00.000Z',
      completedAt: '2026-08-27T00:00:01.000Z',
      backupCreatedAt: '2026-08-27T00:00:00.000Z',
      failedSourceIds: [],
    };
    repository.save(record);

    expect(repository.get('user-a')).toEqual(record);
    expect(repository.get('user-b')).toBeNull();
  });

  it('requires an authenticated user before creating the cloud migration repository', () => {
    expect(() => createEquipmentMigrationCloudRepository({} as never, '')).toThrow('ログインが必要');
  });
});
