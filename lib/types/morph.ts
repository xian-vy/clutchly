export interface Morph {
  id: number
  user_id: string
  species_id: number
  name: string
  description: string | null
  is_global?: boolean
}
export type NewMorph = Omit<Morph, 'id' | 'user_id'>