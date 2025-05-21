import { Reptile } from './reptile'

export interface Shedding {
    id: string;
    reptile_id: string;
    user_id: string;
    shed_date: string; // ISO date
    completeness: 'full' | 'partial' | 'retained' | 'unknown';
    notes?: string | null;
    photo_url?: string | null;
    created_at: string;
    updated_at: string;
  }

export interface ReptileLocation {
  id: string;
  label: string;
  rack: {
    id: string;
    name: string;
    room: {
      id: string;
      name: string;
    };
  };
}

export interface SheddingWithReptile extends Shedding {
  reptile: Reptile;
}

// Form types
export interface IndividualSheddingFormData {
  reptile_id: string;
  shed_date: string;
  completeness: 'full' | 'partial' | 'retained' | 'unknown';
  notes?: string;
  photo_url?: string;
}

export interface BatchSheddingFormData {
  reptile_ids: string[];
  shed_date: string;
  completeness: 'full' | 'partial' | 'retained' | 'unknown';
  notes?: string;
  photo_url?: string;
}

// API types
export type CreateSheddingInput = Omit<Shedding, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateSheddingInput = Partial<Omit<Shedding, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// Type assertion functions
export function assertReptileWithLocation(data: unknown): Reptile {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid reptile data');
  }

  const reptileData = data as Reptile;
  const { id, name } = reptileData;

  if (typeof id !== 'string' || typeof name !== 'string') {
    throw new Error('Invalid reptile data: missing required fields');
  }

  return reptileData;
}

export function assertReptilesWithLocation(data: unknown[]): Reptile[] {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data: expected an array');
  }
  return data.map(assertReptileWithLocation);
}
