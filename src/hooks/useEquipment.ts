import { useEffect, useState } from 'react';
import { equipmentRepository } from '../repositories/equipmentRepository';
import type { EquipmentInput, GolfEquipment } from '../types/equipment';
export function useEquipment(){ const [items,setItems]=useState<GolfEquipment[]>([]); useEffect(()=>setItems(equipmentRepository.getAll()),[]); return {items,create:(input:EquipmentInput)=>setItems([equipmentRepository.create(input),...items]),update:(id:string,input:EquipmentInput)=>setItems(equipmentRepository.update(id,input)),remove:(id:string)=>setItems(equipmentRepository.remove(id)),restore:(data:GolfEquipment[])=>setItems(equipmentRepository.restore(data))}; }
