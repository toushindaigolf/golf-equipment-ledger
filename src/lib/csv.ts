import type { EquipmentStatus, GolfEquipment } from '../types/equipment';

const headers = ['道具名', 'カテゴリ', 'メーカー', '購入日', '購入価格', '購入場所', '売却価格', 'ステータス', 'メモ'];

const escapeCsvValue = (value: string | number) => {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const equipmentToCsv = (
  items: GolfEquipment[],
  categoryLabel: (categoryId: string) => string,
  statusLabel: (status: EquipmentStatus) => string,
) => {
  const rows = items.map(item => [
    item.name,
    categoryLabel(item.categoryId),
    item.manufacturer,
    item.purchaseDate,
    item.purchasePrice,
    item.purchasePlace,
    item.salePrice,
    statusLabel(item.status),
    item.memo,
  ]);

  return `\ufeff${[headers, ...rows].map(row => row.map(escapeCsvValue).join(',')).join('\r\n')}\r\n`;
};
