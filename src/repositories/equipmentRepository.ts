import type { EquipmentInput, GolfEquipment } from '../types/equipment';
const key = 'golf-equipment-ledger-v1';
const demo: GolfEquipment[] = [{id:'demo-1',name:'STEALTH2 HD ドライバー',categoryId:'driver',manufacturer:'TaylorMade',purchaseDate:'2025-04-12',purchasePrice:49500,purchasePlace:'ゴルフショップ',purchaseReason:'スライスを減らしたかったため',salePrice:0,status:'in_use',memo:'10.5度 / 純正シャフト',createdAt:'2025-04-12T00:00:00.000Z',updatedAt:'2025-04-12T00:00:00.000Z'},{id:'demo-2',name:'ゴルフシューズ',categoryId:'shoes',manufacturer:'adidas',purchaseDate:'2024-10-05',purchasePrice:13200,purchasePlace:'オンラインストア',purchaseReason:'雨の日用に',salePrice:6000,status:'sold',memo:'売却済み',createdAt:'2024-10-05T00:00:00.000Z',updatedAt:'2025-03-01T00:00:00.000Z'}];
const valid = (data:unknown): data is GolfEquipment[] => Array.isArray(data);
export const equipmentRepository = {
  getAll():GolfEquipment[] { try { const raw=localStorage.getItem(key); return raw && valid(JSON.parse(raw)) ? JSON.parse(raw) : demo; } catch { return demo; } },
  saveAll(items:GolfEquipment[]) { localStorage.setItem(key, JSON.stringify(items)); },
  create(input:EquipmentInput) { const now=new Date().toISOString(); const item:GolfEquipment={...input,id:crypto.randomUUID(),createdAt:now,updatedAt:now}; const items=[item,...this.getAll()]; this.saveAll(items); return item; },
  update(id:string,input:EquipmentInput) { const items=this.getAll().map(item=>item.id===id?{...item,...input,updatedAt:new Date().toISOString()}:item); this.saveAll(items); return items; },
  remove(id:string) { const items=this.getAll().filter(item=>item.id!==id); this.saveAll(items); return items; },
  restore(items:GolfEquipment[]) { this.saveAll(items); return items; },
};
