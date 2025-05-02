export type ProfileType = 'keeper' | 'breeder' | 'facility';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  account_type: ProfileType;
  collection_size: number | null;
  created_at: string;
  is_active: boolean;
  selected_species: string[] | null; // Array of species IDs
}

export interface ProfileFormData {
  full_name: string;
  account_type: ProfileType;
  collection_size: number | null;
  selected_species: string[] | null; // Array of species IDs
} 