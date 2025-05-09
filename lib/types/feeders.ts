export interface Feeders {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeederSize {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export type NewFeederType = Omit<Feeders, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type NewFeederSize = Omit<FeederSize, 'id' | 'created_at' | 'updated_at' | 'user_id'>;