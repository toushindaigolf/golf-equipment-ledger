import type { GolfEquipment } from '../types/equipment';
export const yen=(value:number)=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(value);
export const date=(value:string)=>value ? new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'short',day:'numeric'}).format(new Date(`${value}T00:00:00`)) : '—';
export const summary=(items:GolfEquipment[])=>{const purchase=items.reduce((n,i)=>n+i.purchasePrice,0);const sales=items.reduce((n,i)=>n+i.salePrice,0);return {purchase,sales,net:purchase-sales,owned:items.filter(i=>i.status!=='sold').length};};
