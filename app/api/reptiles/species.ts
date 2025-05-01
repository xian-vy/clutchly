
import { createClient } from '@/lib/supabase/client'
import { Species, NewSpecies } from '@/lib/types/species'

export async function getSpecies() {
  const supabase = await createClient()
  const currentUser= await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  const { data: species, error } = await supabase
    .from('species')
    .select(`
      id,
      user_id,
      name,
      scientific_name,
      care_level,
      is_global
    `)
    .or(`is_global.eq.true,user_id.eq.${userId}`)
    .order('name')

  if (error) throw error
  return (species as unknown) as Species[]
}

export async function getSpeciesById(id: string) {
  const supabase = await createClient()
  
  const { data: species, error } = await supabase
    .from('species')
    .select(`
      id,
      user_id,
      name,
      scientific_name,
      care_level,
      is_global
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return (species as unknown) as Species
}

export async function createSpecies(species: NewSpecies) {
  const supabase = await createClient()
  const currentUser= await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  const NewSpecies = {
    ...species,
    user_id : userId,
  }
  const { data, error } = await supabase
    .from('species')
    .insert([NewSpecies])
    .select(`
      id,
      user_id,
      name,
      scientific_name,
      care_level,
      is_global
    `)
    .single()

  if (error) throw error
  return (data as unknown) as Species
}

export async function updateSpecies(id: string, updates: Partial<NewSpecies>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('species')
    .update({ ...updates, last_modified: new Date().toISOString() })
    .eq('id', id)
    .select(`
      id,
      user_id,
      name,
      scientific_name,
      care_level,
      is_global
    `)
    .single()

  if (error) throw error
  return (data as unknown) as Species
}

export async function deleteSpecies(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('species')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getGlobalSpecies() {
  const supabase = await createClient()
  
  const { data: species, error } = await supabase
    .from('species')
    .select(`
      id,
      user_id,
      name,
      scientific_name,
      care_level,
      is_global
    `)
    .eq('is_global', true)
    .order('name')

  if (error) throw error
  return (species as unknown) as Species[]
} 