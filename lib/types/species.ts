export type CareLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Species {
  id: string
  created_at: string
  user_id: string
  name: string
  scientific_name: string | null
  description: string | null
  care_level: CareLevel
  last_modified: string
  is_global?: boolean
}

export type NewSpecies = Omit<Species, 'id' | 'created_at' | 'user_id' | 'last_modified'> 