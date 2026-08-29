import type { SupabaseClient } from '@supabase/supabase-js';
import { equipmentRowToDomain } from './supabaseEquipmentRepository';
import type { Database } from '../types/database';
import type { GolfEquipment } from '../types/equipment';
import type { CloudMigrationEquipment, EquipmentMigrationRecord } from '../types/equipmentMigration';
import type { MigrationCloudWriter } from '../lib/equipmentMigration';

type EquipmentRow = Database['public']['Tables']['equipment']['Row'];
type EquipmentInsert = Database['public']['Tables']['equipment']['Insert'];

export const EQUIPMENT_MIGRATION_STATE_KEY_PREFIX = 'golf-equipment-ledger-migration-v1:';

type MigrationStateStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const createEquipmentMigrationStateRepository = (storage: MigrationStateStorage) => ({
  get(userId: string): EquipmentMigrationRecord | null {
    try {
      const raw = storage.getItem(`${EQUIPMENT_MIGRATION_STATE_KEY_PREFIX}${userId}`);
      if (!raw) return null;
      const value = JSON.parse(raw) as Partial<EquipmentMigrationRecord>;
      return value.version === 1 && value.userId === userId && typeof value.status === 'string'
        ? value as EquipmentMigrationRecord
        : null;
    } catch {
      return null;
    }
  },
  save(record: EquipmentMigrationRecord) {
    storage.setItem(`${EQUIPMENT_MIGRATION_STATE_KEY_PREFIX}${record.userId}`, JSON.stringify(record));
  },
});

const itemToMigrationInsert = (item: GolfEquipment, userId: string): EquipmentInsert => ({
  user_id: userId,
  source_id: item.id,
  name: item.name,
  category_id: item.categoryId,
  manufacturer: item.manufacturer,
  purchase_date: item.purchaseDate,
  purchase_price: item.purchasePrice,
  purchase_place: item.purchasePlace,
  purchase_reason: item.purchaseReason,
  sale_price: item.salePrice,
  sale_date: item.saleDate || null,
  status: item.status,
  memo: item.memo,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
});

export type EquipmentMigrationCloudRepository = MigrationCloudWriter & {
  getAll(): Promise<CloudMigrationEquipment[]>;
};

export const createEquipmentMigrationCloudRepository = (
  client: SupabaseClient<Database>,
  authenticatedUserId: string,
): EquipmentMigrationCloudRepository => {
  if (!authenticatedUserId) throw new Error('移行にはログインが必要です。');

  return {
    async getAll() {
      const { data, error } = await client.from('equipment').select('*')
        .eq('user_id', authenticatedUserId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(`クラウドデータの確認に失敗しました。${error.message ? ` ${error.message}` : ''}`);
      return (data as EquipmentRow[]).map(row => ({
        sourceId: row.source_id,
        item: equipmentRowToDomain(row),
      }));
    },
    async insertIfMissing(item) {
      const { data, error } = await client.from('equipment')
        .upsert(itemToMigrationInsert(item, authenticatedUserId), {
          onConflict: 'user_id,source_id',
          ignoreDuplicates: true,
        })
        .select('id')
        .maybeSingle();
      if (error) throw new Error(`「${item.name}」の移行に失敗しました。${error.message ? ` ${error.message}` : ''}`);
      return data ? 'inserted' : 'skipped';
    },
    async overwriteMigrated(item) {
      const { error } = await client.from('equipment')
        .upsert(itemToMigrationInsert(item, authenticatedUserId), {
          onConflict: 'user_id,source_id',
          ignoreDuplicates: false,
        });
      if (error) throw new Error(`「${item.name}」の更新に失敗しました。${error.message ? ` ${error.message}` : ''}`);
    },
  };
};

export const downloadMigrationBackup = (
  json: string,
  filename: string,
  browser: Pick<Document, 'createElement'> = document,
  objectUrls: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'> = URL,
) => {
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = objectUrls.createObjectURL(blob);
  try {
    const anchor = browser.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } finally {
    objectUrls.revokeObjectURL(url);
  }
};
