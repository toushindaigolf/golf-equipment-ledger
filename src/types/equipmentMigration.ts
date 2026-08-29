import type { GolfEquipment } from './equipment';

export type EquipmentMigrationStatus =
  | 'candidate'
  | 'in_progress'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'deferred';

export type CloudMigrationEquipment = {
  sourceId: string | null;
  item: GolfEquipment;
};

export type EquipmentMigrationPreview = {
  localCount: number;
  cloudCount: number;
  addCount: number;
  updateCount: number;
  unchangedCount: number;
  unrelatedCloudCount: number;
};

export type EquipmentMigrationProgress = {
  total: number;
  processed: number;
  success: number;
  skipped: number;
  failed: number;
};

export type EquipmentMigrationRecord = EquipmentMigrationProgress & {
  version: 1;
  userId: string;
  status: EquipmentMigrationStatus;
  localCount: number;
  cloudCount: number;
  lastAttemptAt: string;
  completedAt: string | null;
  backupCreatedAt: string | null;
  failedSourceIds: string[];
};

export type EquipmentMigrationBackup = {
  schemaVersion: 2;
  metadata: {
    backupVersion: 1;
    createdAt: string;
    appName: 'ゴルフ用品購入記録';
    itemCount: number;
    sourceStorageKey: 'golf-equipment-ledger-v1';
    purpose: 'pre-cloud-migration';
  };
  items: GolfEquipment[];
};
