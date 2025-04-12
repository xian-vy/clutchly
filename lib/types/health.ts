export type HealthLogSeverity = 'low' | 'moderate' | 'high';

export interface HealthLogEntry {
  id: string;
  reptile_id: string;
  user_id: string;
  date: string;
  category: HealthLogCategoryId;
  subcategory: HealthLogSubcategoryId;
  type: 'custom' | HealthLogTypeId;
  custom_type_label?: string;
  notes?: string;
  severity?: HealthLogSeverity;
  resolved: boolean;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export type HealthLogCategoryId = string;
export type HealthLogSubcategoryId = string;
export type HealthLogTypeId = string;

export interface HealthLogCategory {
  id: HealthLogCategoryId;
  label: string;
  description?: string;
}

export interface HealthLogSubcategory {
  id: HealthLogSubcategoryId;
  category_id: HealthLogCategoryId;
  label: string;
  description?: string;
}

export interface HealthLogType {
  id: HealthLogTypeId;
  subcategory_id: HealthLogSubcategoryId;
  label: string;
  description?: string;
}

export interface HealthCategory {
  id: HealthLogCategoryId;
  label: string;
}

export interface HealthSubcategory {
  id: HealthLogSubcategoryId;
  category_id: HealthLogCategoryId;
  label: string;
}

export interface HealthType {
  id: HealthLogTypeId;
  subcategory_id: HealthLogSubcategoryId;
  label: string;
}

export interface CreateHealthLogEntryInput {
  reptile_id: string;
  user_id: string;
  date: string;
  category: HealthLogCategoryId;
  subcategory: HealthLogSubcategoryId;
  type: 'custom' | HealthLogTypeId;
  custom_type_label?: string;
  notes?: string;
  severity?: 'low' | 'moderate' | 'high';
  resolved: boolean;
  attachments: string[];
}
