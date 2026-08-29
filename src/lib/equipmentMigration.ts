import { EQUIPMENT_SCHEMA_VERSION, migratableEquipment, parseEquipmentData } from './equipmentData';
import { EQUIPMENT_STORAGE_KEY } from '../repositories/equipmentRepository';
import type { GolfEquipment } from '../types/equipment';
import type {
  CloudMigrationEquipment,
  EquipmentMigrationBackup,
  EquipmentMigrationPreview,
  EquipmentMigrationProgress,
} from '../types/equipmentMigration';

type ReadableStorage = Pick<Storage, 'getItem'>;

export class LocalMigrationDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocalMigrationDataError';
  }
}

export const readLocalMigrationItems = (storage: ReadableStorage): GolfEquipment[] => {
  const raw = storage.getItem(EQUIPMENT_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = parseEquipmentData(JSON.parse(raw));
    if (!parsed.ok) {
      throw new LocalMigrationDataError('端末内データの形式を確認できないため、移行を開始できません。JSONバックアップを確認してください。');
    }
    return migratableEquipment(parsed.items);
  } catch (caught) {
    if (caught instanceof LocalMigrationDataError) throw caught;
    throw new LocalMigrationDataError('端末内データが壊れているため、移行を開始できません。データは変更されていません。');
  }
};

const comparable = (item: GolfEquipment) => ({
  name: item.name,
  categoryId: item.categoryId,
  manufacturer: item.manufacturer,
  purchaseDate: item.purchaseDate,
  purchasePrice: item.purchasePrice,
  purchasePlace: item.purchasePlace,
  purchaseReason: item.purchaseReason,
  salePrice: item.salePrice,
  saleDate: item.saleDate,
  status: item.status,
  memo: item.memo,
});

export const sameMigrationContent = (local: GolfEquipment, cloud: GolfEquipment) =>
  JSON.stringify(comparable(local)) === JSON.stringify(comparable(cloud));

export const createMigrationPreview = (
  localItems: GolfEquipment[],
  cloudItems: CloudMigrationEquipment[],
): EquipmentMigrationPreview => {
  const migratedBySource = new Map(
    cloudItems.filter(item => item.sourceId).map(item => [item.sourceId as string, item.item]),
  );
  let addCount = 0;
  let updateCount = 0;
  let unchangedCount = 0;

  localItems.forEach(item => {
    const existing = migratedBySource.get(item.id);
    if (!existing) addCount += 1;
    else if (sameMigrationContent(item, existing)) unchangedCount += 1;
    else updateCount += 1;
  });

  return {
    localCount: localItems.length,
    cloudCount: cloudItems.length,
    addCount,
    updateCount,
    unchangedCount,
    unrelatedCloudCount: cloudItems.filter(item => !item.sourceId).length,
  };
};

export const createMigrationBackup = (
  items: GolfEquipment[],
  createdAt = new Date().toISOString(),
): EquipmentMigrationBackup => ({
  schemaVersion: EQUIPMENT_SCHEMA_VERSION,
  metadata: {
    backupVersion: 1,
    createdAt,
    appName: 'ゴルフ用品購入記録',
    itemCount: items.length,
    sourceStorageKey: EQUIPMENT_STORAGE_KEY,
    purpose: 'pre-cloud-migration',
  },
  items,
});

export const migrationBackupFilename = (createdAt = new Date().toISOString()) =>
  `golf-equipment-ledger-backup-${createdAt.slice(0, 10)}.json`;

export type MigrationCloudWriter = {
  insertIfMissing(item: GolfEquipment): Promise<'inserted' | 'skipped'>;
  overwriteMigrated(item: GolfEquipment): Promise<void>;
};

export type RunMigrationOptions = {
  localItems: GolfEquipment[];
  cloudItems: CloudMigrationEquipment[];
  strategy: 'append' | 'local_priority';
  cloud: MigrationCloudWriter;
  createBackup: () => Promise<string>;
  onProgress?: (progress: EquipmentMigrationProgress) => void;
};

export type RunMigrationResult = EquipmentMigrationProgress & {
  backupCreatedAt: string;
  failedSourceIds: string[];
};

export const runEquipmentMigration = async ({
  localItems,
  cloudItems,
  strategy,
  cloud,
  createBackup,
  onProgress,
}: RunMigrationOptions): Promise<RunMigrationResult> => {
  if (localItems.length === 0) throw new Error('移行する端末内データはありません。');
  const backupCreatedAt = await createBackup();
  const cloudBySource = new Map(
    cloudItems.filter(item => item.sourceId).map(item => [item.sourceId as string, item.item]),
  );
  const progress: EquipmentMigrationProgress = {
    total: localItems.length,
    processed: 0,
    success: 0,
    skipped: 0,
    failed: 0,
  };
  const failedSourceIds: string[] = [];

  onProgress?.({ ...progress });
  for (const item of localItems) {
    try {
      const existing = cloudBySource.get(item.id);
      if (existing && sameMigrationContent(item, existing)) {
        progress.skipped += 1;
      } else if (existing && strategy === 'local_priority') {
        await cloud.overwriteMigrated(item);
        progress.success += 1;
      } else if (existing) {
        progress.skipped += 1;
      } else {
        const result = await cloud.insertIfMissing(item);
        if (result === 'inserted') progress.success += 1;
        else progress.skipped += 1;
      }
    } catch {
      progress.failed += 1;
      failedSourceIds.push(item.id);
    } finally {
      progress.processed += 1;
      onProgress?.({ ...progress });
    }
  }

  return { ...progress, backupCreatedAt, failedSourceIds };
};
