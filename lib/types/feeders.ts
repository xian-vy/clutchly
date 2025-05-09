export interface FeederType {
  id: string;
  user_id: string;
  name: string; // e.g., "Mouse", "Cricket"
  description: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeederSize {
  id: string;
  feeder_type_id: string;
  user_id: string;
  name: string; // e.g., "Pinky", "Adult"
  description: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export type FeederCondition = 'live' | 'frozen-thawed' | 'freeze-dried' | 'pre-killed' | 'canned';

export type NewFeederType = Omit<FeederType, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type NewFeederSize = Omit<FeederSize, 'id' | 'created_at' | 'updated_at' | 'user_id'>;