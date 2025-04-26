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
  reptile_code: string | null
  species_id: string
  morph_id: string
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
  location_id?: string | null
  original_breeder : string | null //produced_by
}

export type NewReptile = Omit<Reptile, 'id' | 'created_at' | 'user_id' | 'last_modified'>

//for breeding
export type ReptileGeneInfo = { name: string; morphName: string, hets : HetTrait[] | null, visuals : string[] | null }