import type { EquipmentInput, GolfEquipment } from '../types/equipment';
import { parseEquipmentData } from '../lib/equipmentData';

export const EQUIPMENT_STORAGE_KEY = 'golf-equipment-ledger-v1';

export const demoEquipment: GolfEquipment[] = [{id:'demo-1',name:'STEALTH2 HD ドライバー',categoryId:'driver',manufacturer:'TaylorMade',purchaseDate:'2025-04-12',purchasePrice:49500,purchasePlace:'ゴルフショップ',purchaseReason:'スライスを減らしたかったため',salePrice:0,saleDate:'',status:'in_use',memo:'10.5度 / 純正シャフト',createdAt:'2025-04-12T00:00:00.000Z',updatedAt:'2025-04-12T00:00:00.000Z'},{id:'demo-2',name:'ゴルフシューズ',categoryId:'shoes',manufacturer:'adidas',purchaseDate:'2024-10-05',purchasePrice:13200,purchasePlace:'オンラインストア',purchaseReason:'雨の日用に',salePrice:6000,saleDate:'2025-03-01',status:'sold',memo:'売却済み',createdAt:'2024-10-05T00:00:00.000Z',updatedAt:'2025-03-01T00:00:00.000Z'}];

type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;

const cloneDemo = () => demoEquipment.map(item => ({ ...item }));

export const createEquipmentRepository = (storage: StorageAdapter) => {
  const getAll = (): GolfEquipment[] => {
    const raw = storage.getItem(EQUIPMENT_STORAGE_KEY);
    if (!raw) return cloneDemo();

    try {
      const parsed = parseEquipmentData(JSON.parse(raw));
      return parsed.ok ? parsed.items : cloneDemo();
    } catch {
      return cloneDemo();
    }
  };

  const saveAll = (items: GolfEquipment[]) => {
    const parsed = parseEquipmentData(items);
    if (!parsed.ok) throw new Error(`Invalid equipment data: ${parsed.errors.join(', ')}`);
    storage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(parsed.items));
  };

  return {
    getAll,
    saveAll,
    create(input: EquipmentInput) {
      const now = new Date().toISOString();
      const item: GolfEquipment = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
      saveAll([item, ...getAll()]);
      return item;
    },
    update(id: string, input: EquipmentInput) {
      const items = getAll().map(item => item.id === id
        ? { ...item, ...input, updatedAt: new Date().toISOString() }
        : item);
      saveAll(items);
      return items;
    },
    remove(id: string) {
      const items = getAll().filter(item => item.id !== id);
      saveAll(items);
      return items;
    },
    restore(value: unknown) {
      const parsed = parseEquipmentData(value);
      if (!parsed.ok) throw new Error(`Invalid equipment data: ${parsed.errors.join(', ')}`);
      saveAll(parsed.items);
      return parsed.items;
    },
  };
};

export const equipmentRepository = createEquipmentRepository({
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
});
