export type HealthLogSeverity = 'low' | 'moderate' | 'high';

export interface HealthLogEntry {
  id: string;
  reptile_id: string;
  user_id: string;
  date: string;
  category_id: string;
  subcategory_id: string;
  type_id: string | null;
  custom_type_label?: string;
  notes?: string;
  severity?: HealthLogSeverity;
  resolved: boolean;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export interface HealthLogCategory {
  id: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface HealthLogSubcategory {
  id: string;
  category_id: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface HealthLogType {
  id: string;
  subcategory_id: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface HealthCategory {
  id: string;
  label: string;
}

export interface HealthSubcategory {
  id: string;
  category_id: string;
  label: string;
}

export interface HealthType {
  id: string;
  subcategory_id: string;
  label: string;
}

export interface CreateHealthLogEntryInput {
  reptile_id: string;
  user_id: string;
  date: string;
  category_id: string;
  subcategory_id: string;
  type_id: string | null;
  custom_type_label?: string;
  notes?: string;
  severity?: HealthLogSeverity;
  resolved: boolean;
  attachments: string[];
}
