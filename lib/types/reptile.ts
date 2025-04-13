export type Sex = 'male' | 'female' | 'unknown'
export type Status = 'active' | 'sold' | 'deceased'

export interface Reptile {
  id: string
  created_at: string
  user_id: string
  name: string
  species: string
  morph: string
  sex: Sex
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