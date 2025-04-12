export interface Morph {
  id: number
  user_id: string
  species_id: number
  name: string
  genetic_traits: string[]
  visual_traits: string[]
  is_global?: boolean
}

export type NewMorph = Omit<Morph, 'id' | 'user_id'> 