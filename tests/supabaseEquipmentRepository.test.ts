import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../src/types/database';
import type { EquipmentInput } from '../src/types/equipment';
import {
  createSupabaseEquipmentRepository,
  type EquipmentCloudGateway,
} from '../src/repositories/supabaseEquipmentRepository';

type EquipmentRow = Database['public']['Tables']['equipment']['Row'];

const input: EquipmentInput = {
  name: 'クラウド用ドライバー',
  categoryId: 'driver',
  manufacturer: 'PING',
  purchaseDate: '2026-08-26',
  purchasePrice: 48000,
  purchasePlace: 'テスト店舗',
  purchaseReason: 'テスト',
  salePrice: 0,
  saleDate: '',
  status: 'in_use',
  memo: 'クラウド保存テスト',
};

const row: EquipmentRow = {
  id: 'cloud-item-1',
  user_id: 'user-a',
  name: input.name,
  category_id: input.categoryId,
  manufacturer: input.manufacturer,
  purchase_date: input.purchaseDate,
  purchase_price: input.purchasePrice,
  purchase_place: input.purchasePlace,
  purchase_reason: input.purchaseReason,
  sale_price: input.salePrice,
  sale_date: null,
  status: input.status,
  memo: input.memo,
  created_at: '2026-08-26T00:00:00.000Z',
  updated_at: '2026-08-26T00:00:00.000Z',
};

const gateway = (overrides: Partial<EquipmentCloudGateway> = {}): EquipmentCloudGateway => ({
  list: vi.fn(async () => [row]),
  insert: vi.fn(async () => row),
  update: vi.fn(async () => row),
  remove: vi.fn(async () => row.id),
  ...overrides,
});

describe('Supabase equipment repository', () => {
  it('uses the authenticated user id for list, create, update, and delete', async () => {
    const cloud = gateway();
    const repository = createSupabaseEquipmentRepository(cloud, 'user-a');

    await repository.getAll();
    const created = await repository.create(input);
    await repository.update(row.id, input);
    await repository.remove(row.id);

    expect(cloud.list).toHaveBeenCalledWith('user-a');
    expect(cloud.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-a' }));
    expect(cloud.update).toHaveBeenCalledWith('user-a', row.id, expect.any(Object));
    expect(cloud.remove).toHaveBeenCalledWith('user-a', row.id);
    expect(created).toMatchObject({ id: row.id, categoryId: 'driver', saleDate: '' });
  });

  it('loads persisted cloud rows after a repository is recreated', async () => {
    const cloud = gateway();
    const firstPage = createSupabaseEquipmentRepository(cloud, 'user-a');
    const refreshedPage = createSupabaseEquipmentRepository(cloud, 'user-a');

    expect(await firstPage.getAll()).toEqual(await refreshedPage.getAll());
    expect(cloud.list).toHaveBeenCalledTimes(2);
  });

  it('reports a cloud failure without writing to another storage repository', async () => {
    const localWrite = vi.fn();
    const cloud = gateway({ insert: vi.fn(async () => { throw new Error('offline'); }) });
    const repository = createSupabaseEquipmentRepository(cloud, 'user-a');

    await expect(repository.create(input)).rejects.toThrow('クラウドへの用品データの登録に失敗しました');
    expect(localWrite).not.toHaveBeenCalled();
  });

  it('rejects updates and deletes when no owned row is returned', async () => {
    const cloud = gateway({
      update: vi.fn(async () => null),
      remove: vi.fn(async () => null),
    });
    const repository = createSupabaseEquipmentRepository(cloud, 'user-a');

    await expect(repository.update('other-user-item', input)).rejects.toThrow('クラウドへの用品データの更新に失敗しました');
    await expect(repository.remove('other-user-item')).rejects.toThrow('クラウドへの用品データの削除に失敗しました');
  });
});
