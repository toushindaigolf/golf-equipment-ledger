export type EquipmentStatus = 'in_use' | 'stored' | 'sold';
export type GolfEquipment = { id:string; name:string; categoryId:string; manufacturer:string; purchaseDate:string; purchasePrice:number; purchasePlace:string; purchaseReason:string; salePrice:number; status:EquipmentStatus; memo:string; createdAt:string; updatedAt:string };
export type EquipmentInput = Omit<GolfEquipment, 'id'|'createdAt'|'updatedAt'>;
export type SortOption = 'newest'|'oldest'|'price_desc'|'price_asc';
