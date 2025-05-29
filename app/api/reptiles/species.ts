
import { createClient } from '@/lib/supabase/client'
import { Species, NewSpecies } from '@/lib/types/species'
import { getUserAndOrganizationInfo } from '../utils_client'

export async function getSpecies() {
  const supabase = await createClient()
  const { organization } = await getUserAndOrganizationInfo()
    
  const { data: species, error } = await supabase
    .from('species')
    .select(`
      id,
      org_id,
      name,
      scientific_name,
      care_level,
      is_global
    `)
    .or(`is_global.eq.true,org_id.eq.${organization.id}`)
    .order('name')

  if (error) throw error
  
  const selectedSpecies = organization?.selected_species || []
  const sortedSpecies = [...species].sort((a, b) => {
    const aSelected = selectedSpecies.includes(a.id.toString())
    const bSelected = selectedSpecies.includes(b.id.toString())
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return a.name.localeCompare(b.name)
  })

  return (sortedSpecies as unknown) as Species[]
}

export async function getInitialSpecies() {
  const supabase =  createClient()
    
  const { data: species, error } = await supabase
    .from('species')
    .select(`
      id,
      org_id,
      name,
      scientific_name,
      care_level,
      is_global
    `)
    .or(`is_global.eq.true`)
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
      org_id,
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
  const { organization } = await getUserAndOrganizationInfo()

  const NewSpecies = {
    ...species,
    org_id : organization.id,
  }
  const { data, error } = await supabase
    .from('species')
    .insert([NewSpecies])
    .select(`
      id,
      org_id,
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
      org_id,
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
      org_id,
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