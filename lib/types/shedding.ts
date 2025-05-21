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

export interface ReptileWithLocation {
  id: string;
  name: string;
  reptile_code: string | null;
  location: ReptileLocation | null;
}

export interface SheddingWithReptile extends Shedding {
  reptile: ReptileWithLocation;
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

// Type for raw data from Supabase
interface RawReptileLocation {
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

interface RawReptileData {
  id: string;
  name: string;
  reptile_code: string | null;
  location: RawReptileLocation | null;
}

// Type assertion functions
export function assertReptileWithLocation(data: unknown): ReptileWithLocation {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid reptile data');
  }

  const reptileData = data as RawReptileData;
  const { id, name, reptile_code, location } = reptileData;

  if (typeof id !== 'string' || typeof name !== 'string') {
    throw new Error('Invalid reptile data: missing required fields');
  }

  const reptileLocation = location ? {
    id: location.id,
    label: location.label,
    rack: {
      id: location.rack.id,
      name: location.rack.name,
      room: {
        id: location.rack.room.id,
        name: location.rack.room.name,
      },
    },
  } : null;

  return {
    id,
    name,
    reptile_code: reptile_code || null,
    location: reptileLocation,
  };
}

export function assertReptilesWithLocation(data: unknown[]): ReptileWithLocation[] {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data: expected an array');
  }
  return data.map(assertReptileWithLocation);
}
