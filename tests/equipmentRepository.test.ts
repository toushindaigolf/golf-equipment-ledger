import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEquipmentRepository,
  demoEquipment,
  EQUIPMENT_STORAGE_KEY,
} from '../src/repositories/equipmentRepository';
import { currentEquipment, legacyEquipment } from './fixtures/equipment';

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
};

describe('equipmentRepository', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-id' });
  });

  it('returns demo records without writing when storage is empty', () => {
    const storage = createMemoryStorage();
    const repository = createEquipmentRepository(storage);

    expect(repository.getAll()).toEqual(demoEquipment);
    expect(storage.values.size).toBe(0);
  });

  it('loads and normalizes a legacy array without overwriting it', () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify([legacyEquipment]);
    storage.setItem(EQUIPMENT_STORAGE_KEY, raw);
    const repository = createEquipmentRepository(storage);

    expect(repository.getAll()[0]).toMatchObject({ salePrice: 0, saleDate: '', status: 'in_use' });
    expect(storage.getItem(EQUIPMENT_STORAGE_KEY)).toBe(raw);
  });

  it('preserves CRUD behavior', () => {
    const storage = createMemoryStorage();
    storage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify([currentEquipment]));
    const repository = createEquipmentRepository(storage);

    const created = repository.create({
      name: '追加パター',
      categoryId: 'putter',
      manufacturer: 'PING',
      purchaseDate: '2026-08-25',
      purchasePrice: 30000,
      purchasePlace: '',
      purchaseReason: '',
      salePrice: 0,
      saleDate: '',
      status: 'stored',
      memo: '',
    });
    expect(created.id).toBe('generated-id');
    expect(repository.getAll()).toHaveLength(2);

    const updated = repository.update('generated-id', {
      ...created,
      name: '更新パター',
    });
    expect(updated.find(item => item.id === 'generated-id')?.name).toBe('更新パター');

    expect(repository.remove('generated-id')).toEqual([currentEquipment]);
  });

  it('restores zero items and rejects invalid input without overwriting storage', () => {
    const storage = createMemoryStorage();
    storage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify([currentEquipment]));
    const repository = createEquipmentRepository(storage);

    expect(repository.restore([])).toEqual([]);
    const emptySnapshot = storage.getItem(EQUIPMENT_STORAGE_KEY);
    expect(() => repository.restore([{ id: '' }])).toThrow('Invalid equipment data');
    expect(storage.getItem(EQUIPMENT_STORAGE_KEY)).toBe(emptySnapshot);
  });
});
