import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { EquipmentDataRepository } from './equipmentDataRepository';
import { localEquipmentDataRepository } from './equipmentRepository';
import { createSupabaseEquipmentGateway, createSupabaseEquipmentRepository } from './supabaseEquipmentRepository';

export function selectEquipmentRepository(
  userId: string | undefined,
  client: SupabaseClient<Database> | null = supabase,
  localRepository: EquipmentDataRepository = localEquipmentDataRepository,
) {
  if (!userId || !client) return localRepository;
  return createSupabaseEquipmentRepository(createSupabaseEquipmentGateway(client), userId);
}
