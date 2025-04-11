export type HealthLogSeverity = 'low' | 'moderate' | 'high';

export interface HealthLogEntry {
  id: string;
  reptile_id: string;
  user_id: string;
  date: string;
  category: HealthLogCategoryId;
  subcategory: HealthLogSubcategoryId;
  type: HealthLogTypeId | 'custom';
  custom_type_label?: string;
  notes?: string;
  severity?: HealthLogSeverity;
  resolved?: boolean;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export type HealthLogCategoryId =
  | 'symptom'
  | 'injury'
  | 'illness'
  | 'treatment'
  | 'routine_check'
  | 'death'
  | 'behavioral_change'
  | 'environmental_issue'
  | 'husbandry_adjustment'
  | 'reproductive_event'
  | 'other';

export interface HealthCategory {
  id: HealthLogCategoryId;
  label: string;
}

export type HealthLogSubcategoryId =
  | 'feeding_issue'
  | 'mobility_issue'
  | 'respiratory_issue'
  | 'visual_issue'
  | 'digestive_issue'
  | 'shedding_issue'
  | 'skin_issue'
  | 'trauma'
  | 'infection'
  | 'parasite'
  | 'internal_condition'
  | 'medication'
  | 'surgical'
  | 'routine_monitoring'
  | 'vital_check'
  | 'environmental_stress'
  | 'enclosure_maintenance'
  | 'breeding_cycle'
  | 'egg_laying'
  | 'brumation'
  | 'unknown'
  | 'custom';

export interface HealthSubcategory {
  id: HealthLogSubcategoryId;
  category_id: HealthLogCategoryId;
  label: string;
}

export type HealthLogTypeId =
  | 'refused_food'
  | 'regurgitation'
  | 'lethargy'
  | 'tail_loss'
  | 'wheezing'
  | 'cloudy_eyes'
  | 'retained_shed'
  | 'discoloration'
  | 'bite_injury'
  | 'mouth_rot'
  | 'mites'
  | 'egg_binding'
  | 'prolapse'
  | 'fluid_therapy'
  | 'force_fed'
  | 'vet_visit'
  | 'weight_recorded'
  | 'feeding_recorded'
  | 'physical_exam'
  | 'passed_away'
  | 'increased_aggression'
  | 'temperature_drop'
  | 'substrate_changed'
  | 'mating_successful'
  | 'eggs_laid'
  | 'brumation_started';

export interface HealthType {
  id: HealthLogTypeId;
  subcategory_id: HealthLogSubcategoryId;
  label: string;
}
