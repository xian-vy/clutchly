export type BreedingStatus = 'active' | 'completed' | 'failed' | 'planned'
export type IncubationStatus = 'not_started' | 'in_progress' | 'completed' | 'failed'

export interface BreedingProject {
  id: string
  user_id: string
  name: string
  status: BreedingStatus
  male_id: string
  female_id: string
  start_date: string
  end_date?: string
  expected_hatch_date?: string
  notes?: string
  species_id: string
  created_at: string
  updated_at: string
}

export interface Clutch {
  id: string
  breeding_project_id: string
  lay_date: string
  egg_count: number
  fertile_count: number
  incubation_status: IncubationStatus
  incubation_temp?: number
  incubation_humidity?: number
  hatch_date?: string
  notes?: string
  species_id: string
  created_at: string
  updated_at: string
}

export interface Hatchling {
  id: string
  clutch_id: string
  morph: string
  sex: 'male' | 'female' | 'unknown'
  weight: number
  notes?: string
  species_id: string
  created_at: string
}

export type NewBreedingProject = Omit<BreedingProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type NewClutch = Omit<Clutch, 'id' | 'created_at' | 'updated_at'>
export type NewHatchling = Omit<Hatchling, 'id' | 'created_at'> 