import { describe, expect, it } from 'vitest';
import { summary } from '../src/lib/format';
import { currentEquipment } from './fixtures/equipment';

describe('summary', () => {
  it('returns zero totals for zero items', () => {
    expect(summary([])).toEqual({ purchase: 0, sales: 0, net: 0, owned: 0 });
  });

  it('calculates totals and counts in_use/stored as owned', () => {
    const inUse = { ...currentEquipment, id: 'in-use', status: 'in_use' as const, purchasePrice: 10000, salePrice: 0 };
    const stored = { ...currentEquipment, id: 'stored', status: 'stored' as const, purchasePrice: 5000, salePrice: 0 };
    const sold = { ...currentEquipment, id: 'sold', status: 'sold' as const, purchasePrice: 20000, salePrice: 8000 };

    expect(summary([inUse, stored, sold])).toEqual({
      purchase: 35000,
      sales: 8000,
      net: 27000,
      owned: 2,
    });
  });
});
