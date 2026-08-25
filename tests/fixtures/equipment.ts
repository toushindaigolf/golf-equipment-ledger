import type { GolfEquipment } from '../../src/types/equipment';

export const currentEquipment: GolfEquipment = {
  id: 'fixture-current-1',
  name: 'テストドライバー',
  categoryId: 'driver',
  manufacturer: 'TaylorMade',
  purchaseDate: '2026-08-25',
  purchasePrice: 50000,
  purchasePlace: 'テストショップ',
  purchaseReason: 'テスト用',
  salePrice: 12000,
  status: 'sold',
  memo: 'カンマ, 改行\n引用符 "テスト"',
  createdAt: '2026-08-25T00:00:00.000Z',
  updatedAt: '2026-08-25T01:00:00.000Z',
};

export const legacyEquipment = {
  id: 'fixture-legacy-1',
  name: '旧形式アイアン',
  categoryId: 'iron',
  purchaseDate: '2024-01-02',
  purchasePrice: '24000',
};

export const invalidEquipment = {
  id: '',
  name: 'IDなし',
  purchasePrice: -1,
};
