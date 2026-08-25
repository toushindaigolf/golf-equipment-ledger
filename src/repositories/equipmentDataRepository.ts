import type { EquipmentInput, GolfEquipment } from '../types/equipment';

export type EquipmentStorageSource = 'local' | 'cloud';

export interface EquipmentDataRepository {
  readonly source: EquipmentStorageSource;
  getAll(): Promise<GolfEquipment[]>;
  create(input: EquipmentInput): Promise<GolfEquipment>;
  update(id: string, input: EquipmentInput): Promise<GolfEquipment>;
  remove(id: string): Promise<void>;
  restore?(items: GolfEquipment[]): Promise<GolfEquipment[]>;
}
