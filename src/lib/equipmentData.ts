import type { EquipmentStatus, GolfEquipment } from '../types/equipment';

export const EQUIPMENT_SCHEMA_VERSION = 1 as const;
export const LEGACY_EQUIPMENT_SCHEMA_VERSION = 0 as const;
export const DEMO_EQUIPMENT_IDS = ['demo-1', 'demo-2'] as const;

type EquipmentEnvelope = {
  schemaVersion: number;
  items: unknown[];
};

export type EquipmentParseResult =
  | {
      ok: true;
      items: GolfEquipment[];
      schemaVersion: number;
      legacy: boolean;
    }
  | {
      ok: false;
      errors: string[];
    };

const equipmentStatuses: EquipmentStatus[] = ['in_use', 'stored', 'sold'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const optionalString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const nonNegativeNumber = (value: unknown, fallback: number) => {
  if (value === undefined || value === null || value === '') return fallback;
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};

const timestampFallback = (purchaseDate: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)
    ? `${purchaseDate}T00:00:00.000Z`
    : '1970-01-01T00:00:00.000Z';

type NormalizeResult =
  | { ok: true; item: GolfEquipment }
  | { ok: false; error: string };

const normalizeEquipment = (value: unknown, index: number): NormalizeResult => {
  if (!isRecord(value)) {
    return { ok: false, error: `items[${index}] must be an object` };
  }

  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const purchasePrice = nonNegativeNumber(value.purchasePrice, 0);
  const salePrice = nonNegativeNumber(value.salePrice, 0);

  if (!id) return { ok: false, error: `items[${index}].id is required` };
  if (!name) return { ok: false, error: `items[${index}].name is required` };
  if (purchasePrice === undefined) {
    return { ok: false, error: `items[${index}].purchasePrice must be a non-negative number` };
  }
  if (salePrice === undefined) {
    return { ok: false, error: `items[${index}].salePrice must be a non-negative number` };
  }

  const purchaseDate = optionalString(value.purchaseDate);
  if (purchaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
    return { ok: false, error: `items[${index}].purchaseDate must use YYYY-MM-DD` };
  }
  const createdAt = optionalString(value.createdAt, timestampFallback(purchaseDate));
  const status = equipmentStatuses.includes(value.status as EquipmentStatus)
    ? (value.status as EquipmentStatus)
    : 'in_use';

  const item: GolfEquipment = {
    id,
    name,
    categoryId: optionalString(value.categoryId).trim() || 'other',
    manufacturer: optionalString(value.manufacturer),
    purchaseDate,
    purchasePrice,
    purchasePlace: optionalString(value.purchasePlace),
    purchaseReason: optionalString(value.purchaseReason),
    salePrice,
    status,
    memo: optionalString(value.memo),
    createdAt,
    updatedAt: optionalString(value.updatedAt, createdAt),
  };

  return { ok: true, item };
};

const readEnvelope = (value: unknown) => {
  if (Array.isArray(value)) {
    return {
      schemaVersion: LEGACY_EQUIPMENT_SCHEMA_VERSION,
      items: value,
      legacy: true,
    };
  }

  if (!isRecord(value) || !Array.isArray(value.items) || typeof value.schemaVersion !== 'number') {
    return undefined;
  }

  const envelope = value as EquipmentEnvelope;
  if (envelope.schemaVersion > EQUIPMENT_SCHEMA_VERSION || envelope.schemaVersion < 1) {
    return undefined;
  }

  return {
    schemaVersion: envelope.schemaVersion,
    items: envelope.items,
    legacy: false,
  };
};

export const parseEquipmentData = (value: unknown): EquipmentParseResult => {
  const source = readEnvelope(value);
  if (!source) {
    return { ok: false, errors: ['Unsupported equipment data format'] };
  }

  const items: GolfEquipment[] = [];
  const errors: string[] = [];

  source.items.forEach((entry, index) => {
    const normalized = normalizeEquipment(entry, index);
    if (!normalized.ok) errors.push(normalized.error);
    else items.push(normalized.item);
  });

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    items,
    schemaVersion: source.schemaVersion,
    legacy: source.legacy,
  };
};

export const isDemoEquipment = (item: Pick<GolfEquipment, 'id'>) =>
  DEMO_EQUIPMENT_IDS.includes(item.id as (typeof DEMO_EQUIPMENT_IDS)[number]);

export const migratableEquipment = (items: GolfEquipment[]) =>
  items.filter(item => !isDemoEquipment(item));
