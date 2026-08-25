import { describe, expect, it } from 'vitest';
import { analyzeEquipmentYear, availableAnalysisYears } from '../src/lib/analytics';
import { summary } from '../src/lib/format';
import type { GolfEquipment } from '../src/types/equipment';
import { currentEquipment } from './fixtures/equipment';

const item = (overrides: Partial<GolfEquipment>): GolfEquipment => ({
  ...currentEquipment,
  id: overrides.id ?? crypto.randomUUID(),
  ...overrides,
});

describe('availableAnalysisYears', () => {
  it('returns purchase and sale years in newest-first order', () => {
    const items = [
      item({ purchaseDate: '2024-01-01', saleDate: '2026-02-01' }),
      item({ purchaseDate: '2025-01-01', saleDate: '' }),
    ];
    expect(availableAnalysisYears(items, 2030)).toEqual([2026, 2025, 2024]);
  });

  it('uses a deterministic fallback for an empty data set', () => {
    expect(availableAnalysisYears([], 2030)).toEqual([2030]);
  });
});

describe('analyzeEquipmentYear', () => {
  it('returns zeroed analytics for an empty year', () => {
    const result = analyzeEquipmentYear([], 2026);
    expect(result).toMatchObject({
      purchaseCount: 0,
      saleCount: 0,
      purchaseTotal: 0,
      saleTotal: 0,
      netTotal: 0,
      maxCategoryId: null,
      categoryPurchases: [],
    });
    expect(result.monthlyPurchases).toHaveLength(12);
    expect(result.monthlyPurchases.every(month => month.amount === 0)).toBe(true);
  });

  it('separates purchases and sales by their own dates', () => {
    const result = analyzeEquipmentYear([
      item({ purchaseDate: '2025-08-10', purchasePrice: 50000, saleDate: '2026-02-12', salePrice: 18000 }),
    ], 2026);

    expect(result).toMatchObject({
      purchaseCount: 0,
      saleCount: 1,
      purchaseTotal: 0,
      saleTotal: 18000,
      netTotal: -18000,
    });
  });

  it('aggregates monthly and category purchase amounts', () => {
    const result = analyzeEquipmentYear([
      item({ id: 'a', categoryId: 'driver', purchaseDate: '2026-01-05', purchasePrice: 50000, saleDate: '' }),
      item({ id: 'b', categoryId: 'wedge', purchaseDate: '2026-01-20', purchasePrice: 18000, saleDate: '' }),
      item({ id: 'c', categoryId: 'driver', purchaseDate: '2026-03-10', purchasePrice: 30000, saleDate: '' }),
    ], 2026);

    expect(result.purchaseCount).toBe(3);
    expect(result.purchaseTotal).toBe(98000);
    expect(result.monthlyPurchases[0].amount).toBe(68000);
    expect(result.monthlyPurchases[2].amount).toBe(30000);
    expect(result.categoryPurchases).toEqual([
      { categoryId: 'driver', amount: 80000 },
      { categoryId: 'wedge', amount: 18000 },
    ]);
    expect(result.maxCategoryId).toBe('driver');
  });

  it('groups unknown categories into other', () => {
    const result = analyzeEquipmentYear([
      item({ id: 'a', categoryId: 'future-category', purchaseDate: '2026-04-01', purchasePrice: 12000 }),
      item({ id: 'b', categoryId: 'another-future-category', purchaseDate: '2026-04-02', purchasePrice: 8000 }),
    ], 2026);

    expect(result.categoryPurchases).toEqual([{ categoryId: 'other', amount: 20000 }]);
  });

  it('counts a zero-price purchase without producing invalid totals', () => {
    const result = analyzeEquipmentYear([
      item({ purchaseDate: '2026-05-01', purchasePrice: 0, saleDate: '', salePrice: 0 }),
    ], 2026);

    expect(result.purchaseCount).toBe(1);
    expect(result.purchaseTotal).toBe(0);
    expect(result.netTotal).toBe(0);
    expect(result.monthlyPurchases[4].amount).toBe(0);
  });

  it('does not assign a sold legacy record to a year without a sale date', () => {
    const result = analyzeEquipmentYear([
      item({ status: 'sold', saleDate: '', salePrice: 12000 }),
    ], 2026);

    expect(result.saleCount).toBe(0);
    expect(result.saleTotal).toBe(0);
  });

  it('matches the existing totals when all activity belongs to one year', () => {
    const items = [currentEquipment];
    const result = analyzeEquipmentYear(items, 2026);
    const existing = summary(items);

    expect(result.purchaseTotal).toBe(existing.purchase);
    expect(result.saleTotal).toBe(existing.sales);
    expect(result.netTotal).toBe(existing.net);
  });
});
