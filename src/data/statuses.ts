import type { EquipmentStatus } from '../types/equipment';
export const statuses: {id:EquipmentStatus; name:string}[] = [{id:'in_use',name:'使用中'},{id:'stored',name:'保管'},{id:'sold',name:'売却済み'}];
export const statusName = (id:EquipmentStatus) => statuses.find(s=>s.id===id)?.name ?? '';
