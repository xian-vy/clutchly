export interface Morph {
  id: string
  created_at: string
  user_id: string
  species_id: string
  name: string
  description: string | null
  genetic_traits: string[]
  visual_traits: string[]
  last_modified: string
  is_global?: boolean
}

export type NewMorph = Omit<Morph, 'id' | 'created_at' | 'user_id' | 'last_modified'> 