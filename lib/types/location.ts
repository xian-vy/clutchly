export interface Room {
  id: string;
  name: string;
  notes?: string | null;
}

export interface Rack {
  id: string;
  name: string;
  room_id: string;
  type: string;
  rows: number;
  columns?: number | null;
  notes?: string | null;
}

export interface Location {
  id: string;
  room_id: string;
  rack_id: string;
  shelf_level: number | string;
  position: number | string;
  label: string;
  notes?: string | null;
  is_available: boolean;
}

export type NewRoom = Omit<Room, 'id'>;
export type NewRack = Omit<Rack, 'id'>;
export type NewLocation = Omit<Location, 'id'>; 