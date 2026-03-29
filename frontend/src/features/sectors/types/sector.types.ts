export interface Sector {
  id: number;
  name: string;
  entity_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectorFormData {
  name: string;
  is_active?: boolean;
}

export interface SectorPagination {
  data: Sector[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}
