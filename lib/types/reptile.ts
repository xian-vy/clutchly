export type Sex = 'male' | 'female' | 'unknown'
export type Status = 'active' | 'sold' | 'deceased'

export interface HetTrait {
  trait: string;
  percentage: number;
  source?: 'visual_parent' | 'genetic_test' | 'breeding_odds';
  verified?: boolean;
}

export interface Reptile {
  id: string
  created_at: string
  user_id: string
  name: string
  species: string
  morph: string
  visual_traits: string[] | null
  het_traits: HetTrait[] | null
  sex: Sex
  weight: number;
  length: number;
  hatch_date: string | null
  acquisition_date: string
  status: Status
  notes: string | null
  last_modified: string
  parent_clutch_id?: string | null
  dam_id ?: string | null
  sire_id?: string | null
  generation?: number 
  breeding_line?: string          
  is_breeder?: boolean   
  retired_breeder?: boolean       
  primary_genetics?: string[]  
  lineage_path?: string  
  project_ids?: string[]
}

export type NewReptile = Omit<Reptile, 'id' | 'created_at' | 'user_id' | 'last_modified'>