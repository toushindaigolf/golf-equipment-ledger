import { describe, expect, it } from 'vitest';
import {
  EQUIPMENT_SCHEMA_VERSION,
  isDemoEquipment,
  migratableEquipment,
  parseEquipmentData,
} from '../src/lib/equipmentData';
import { currentEquipment, invalidEquipment, legacyEquipment } from './fixtures/equipment';

describe('parseEquipmentData', () => {
  it('parses the current versioned envelope', () => {
    const result = parseEquipmentData({
      schemaVersion: EQUIPMENT_SCHEMA_VERSION,
      items: [currentEquipment],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.legacy).toBe(false);
    expect(result.items).toEqual([currentEquipment]);
  });

  it('accepts a legacy array and safely fills optional fields', () => {
    const result = parseEquipmentData([legacyEquipment]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.legacy).toBe(true);
    expect(result.items[0]).toMatchObject({
      manufacturer: '',
      purchasePlace: '',
      purchaseReason: '',
      purchasePrice: 24000,
      salePrice: 0,
      saleDate: '',
      status: 'in_use',
      memo: '',
    });
  });

  it('accepts an older versioned record without a sale date', () => {
    const { saleDate: _saleDate, ...previousItem } = currentEquipment;
    const result = parseEquipmentData({ schemaVersion: 1, items: [previousItem] });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.items[0].saleDate).toBe('');
  });

  it('rejects an invalid sale date', () => {
    const result = parseEquipmentData([{ ...currentEquipment, saleDate: '2026/08/26' }]);
    expect(result.ok).toBe(false);
  });

  it('accepts an empty data set', () => {
    const result = parseEquipmentData([]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.items).toEqual([]);
  });

  it('rejects invalid items without modifying the input', () => {
    const source = [invalidEquipment];
    const snapshot = JSON.stringify(source);
    const result = parseEquipmentData(source);

    expect(result.ok).toBe(false);
    expect(JSON.stringify(source)).toBe(snapshot);
  });

  it('identifies and excludes demo records for future migration', () => {
    const demo = { ...currentEquipment, id: 'demo-1' };
    expect(isDemoEquipment(demo)).toBe(true);
    expect(migratableEquipment([demo, currentEquipment])).toEqual([currentEquipment]);
  });
});
