import { categories } from '../data/categories';
import type { GolfEquipment } from '../types/equipment';

export type MonthlyPurchase = {
  month: number;
  amount: number;
};

export type CategoryPurchase = {
  categoryId: string;
  amount: number;
};

export type AnnualEquipmentAnalytics = {
  year: number;
  purchaseCount: number;
  saleCount: number;
  purchaseTotal: number;
  saleTotal: number;
  netTotal: number;
  maxCategoryId: string | null;
  monthlyPurchases: MonthlyPurchase[];
  categoryPurchases: CategoryPurchase[];
};

const categoryIds = categories.map(([id]) => id);
const categoryOrder = new Map<string, number>(categoryIds.map((id, index) => [id, index]));
const knownCategoryIds = new Set<string>(categoryIds);

const dateParts = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return undefined;
  return { year, month };
};

const analysisCategoryId = (categoryId: string) =>
  knownCategoryIds.has(categoryId) ? categoryId : 'other';

export const availableAnalysisYears = (
  items: GolfEquipment[],
  fallbackYear = new Date().getFullYear(),
) => {
  const years = new Set<number>();

  items.forEach(item => {
    const purchase = dateParts(item.purchaseDate);
    const sale = dateParts(item.saleDate);
    if (purchase) years.add(purchase.year);
    if (sale) years.add(sale.year);
  });

  return years.size > 0 ? [...years].sort((a, b) => b - a) : [fallbackYear];
};

export const analyzeEquipmentYear = (
  items: GolfEquipment[],
  year: number,
): AnnualEquipmentAnalytics => {
  const monthlyPurchases = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    amount: 0,
  }));
  const categoryAmounts = new Map<string, number>();
  let purchaseCount = 0;
  let saleCount = 0;
  let purchaseTotal = 0;
  let saleTotal = 0;

  items.forEach(item => {
    const purchase = dateParts(item.purchaseDate);
    if (purchase?.year === year) {
      purchaseCount += 1;
      purchaseTotal += item.purchasePrice;
      monthlyPurchases[purchase.month - 1].amount += item.purchasePrice;
      const categoryId = analysisCategoryId(item.categoryId);
      categoryAmounts.set(categoryId, (categoryAmounts.get(categoryId) ?? 0) + item.purchasePrice);
    }

    const sale = dateParts(item.saleDate);
    if (sale?.year === year) {
      saleCount += 1;
      saleTotal += item.salePrice;
    }
  });

  const categoryPurchases = [...categoryAmounts.entries()]
    .map(([categoryId, amount]) => ({ categoryId, amount }))
    .sort((a, b) => b.amount - a.amount
      || (categoryOrder.get(a.categoryId) ?? Number.MAX_SAFE_INTEGER)
        - (categoryOrder.get(b.categoryId) ?? Number.MAX_SAFE_INTEGER));

  return {
    year,
    purchaseCount,
    saleCount,
    purchaseTotal,
    saleTotal,
    netTotal: purchaseTotal - saleTotal,
    maxCategoryId: categoryPurchases[0]?.categoryId ?? null,
    monthlyPurchases,
    categoryPurchases,
  };
};
