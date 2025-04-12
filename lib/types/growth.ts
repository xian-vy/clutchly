export interface GrowthEntry {
  id: string;
  reptile_id: string;
  user_id: string;
  date: string;
  weight: number;
  length: number;
  notes?: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateGrowthEntryInput {
  reptile_id: string;
  user_id: string;
  date: string;
  weight: number;
  length: number;
  notes?: string;
  attachments: string[];
} 