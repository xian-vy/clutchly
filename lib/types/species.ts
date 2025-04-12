export type CareLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Species {
  id: number
  user_id: string
  name: string
  scientific_name: string | null
  care_level: CareLevel
  is_global?: boolean
}

export type NewSpecies = Omit<Species, 'id' | 'user_id'> 