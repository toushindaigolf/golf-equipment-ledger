import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import type { EquipmentInput, GolfEquipment } from '../types/equipment';
import type { EquipmentDataRepository } from './equipmentDataRepository';

type EquipmentRow = Database['public']['Tables']['equipment']['Row'];
type EquipmentInsert = Database['public']['Tables']['equipment']['Insert'];
type EquipmentUpdate = Database['public']['Tables']['equipment']['Update'];

export type EquipmentCloudGateway = {
  list(userId: string): Promise<EquipmentRow[]>;
  insert(row: EquipmentInsert): Promise<EquipmentRow>;
  update(userId: string, id: string, values: EquipmentUpdate): Promise<EquipmentRow | null>;
  remove(userId: string, id: string): Promise<string | null>;
};

export class EquipmentCloudError extends Error {
  readonly originalError: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'EquipmentCloudError';
    this.originalError = originalError;
  }
}

const cloudFailure = (operation: string, cause: unknown) =>
  new EquipmentCloudError(`クラウドへの${operation}に失敗しました。通信状態を確認して、もう一度お試しください。`, cause);

export const equipmentRowToDomain = (row: EquipmentRow): GolfEquipment => ({
  id: row.id,
  name: row.name,
  categoryId: row.category_id,
  manufacturer: row.manufacturer,
  purchaseDate: row.purchase_date,
  purchasePrice: row.purchase_price,
  purchasePlace: row.purchase_place,
  purchaseReason: row.purchase_reason,
  salePrice: row.sale_price,
  saleDate: row.sale_date ?? '',
  status: row.status,
  memo: row.memo,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const inputToDatabase = (input: EquipmentInput): EquipmentUpdate => ({
  name: input.name,
  category_id: input.categoryId,
  manufacturer: input.manufacturer,
  purchase_date: input.purchaseDate,
  purchase_price: input.purchasePrice,
  purchase_place: input.purchasePlace,
  purchase_reason: input.purchaseReason,
  sale_price: input.salePrice,
  sale_date: input.saleDate || null,
  status: input.status,
  memo: input.memo,
});

export function createSupabaseEquipmentGateway(client: SupabaseClient<Database>): EquipmentCloudGateway {
  return {
    async list(userId) {
      const { data, error } = await client.from('equipment').select('*')
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async insert(row) {
      const { data, error } = await client.from('equipment').insert(row).select('*').single();
      if (error) throw error;
      return data;
    },
    async update(userId, id, values) {
      const { data, error } = await client.from('equipment').update(values)
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async remove(userId, id) {
      const { data, error } = await client.from('equipment').delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      return data?.id ?? null;
    },
  };
}

export function createSupabaseEquipmentRepository(
  gateway: EquipmentCloudGateway,
  authenticatedUserId: string,
): EquipmentDataRepository {
  if (!authenticatedUserId) throw new Error('認証中のユーザーIDが必要です。');

  return {
    source: 'cloud',
    async getAll() {
      try {
        return (await gateway.list(authenticatedUserId)).map(equipmentRowToDomain);
      } catch (cause) {
        throw cloudFailure('用品データの読み込み', cause);
      }
    },
    async create(input) {
      try {
        const row = await gateway.insert({
          ...inputToDatabase(input),
          user_id: authenticatedUserId,
        } as EquipmentInsert);
        return equipmentRowToDomain(row);
      } catch (cause) {
        throw cloudFailure('用品データの登録', cause);
      }
    },
    async update(id, input) {
      try {
        const row = await gateway.update(authenticatedUserId, id, inputToDatabase(input));
        if (!row) throw new Error('Equipment not found or not owned by user');
        return equipmentRowToDomain(row);
      } catch (cause) {
        throw cloudFailure('用品データの更新', cause);
      }
    },
    async remove(id) {
      try {
        const removedId = await gateway.remove(authenticatedUserId, id);
        if (!removedId) throw new Error('Equipment not found or not owned by user');
      } catch (cause) {
        throw cloudFailure('用品データの削除', cause);
      }
    },
  };
}
