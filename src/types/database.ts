import type { EquipmentStatus } from './equipment';

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: {
          id: string;
          user_id: string;
          source_id: string | null;
          name: string;
          category_id: string;
          manufacturer: string;
          purchase_date: string;
          purchase_price: number;
          purchase_place: string;
          purchase_reason: string;
          sale_price: number;
          sale_date: string | null;
          status: EquipmentStatus;
          memo: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_id?: string | null;
          name: string;
          category_id?: string;
          manufacturer?: string;
          purchase_date: string;
          purchase_price?: number;
          purchase_place?: string;
          purchase_reason?: string;
          sale_price?: number;
          sale_date?: string | null;
          status?: EquipmentStatus;
          memo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_id?: string | null;
          name?: string;
          category_id?: string;
          manufacturer?: string;
          purchase_date?: string;
          purchase_price?: number;
          purchase_place?: string;
          purchase_reason?: string;
          sale_price?: number;
          sale_date?: string | null;
          status?: EquipmentStatus;
          memo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: { user_id: string; created_at: string; updated_at: string };
        Insert: { user_id: string; created_at?: string; updated_at?: string };
        Update: { user_id?: string; created_at?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
