import { describe, expect, it } from 'vitest';
import { equipmentToCsv } from '../src/lib/csv';
import { currentEquipment } from './fixtures/equipment';

describe('equipmentToCsv', () => {
  it('exports a BOM and headers for zero items', () => {
    const csv = equipmentToCsv([], value => value, value => value);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('道具名,カテゴリ,メーカー');
  });

  it('escapes commas, newlines and double quotes', () => {
    const csv = equipmentToCsv(
      [currentEquipment],
      () => 'ドライバー',
      () => '売却済み',
    );

    expect(csv).toContain('"カンマ, 改行\n引用符 ""テスト"""');
    expect(csv).toContain(',50000,');
    expect(csv).toContain(',12000,');
    expect(csv).toContain(',12000,2026-08-26,');
  });
});
