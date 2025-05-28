
import { createClient } from '@/lib/supabase/client'
import { Morph, NewMorph } from '@/lib/types/morph'
import { getUserAndOrganizationInfo } from '../utils_client'

export async function getMorphs() {
  const supabase = await createClient()
  const { organization } = await getUserAndOrganizationInfo()

  const { data: morphs, error } = await supabase
    .from('morphs')
    .select(`
      id,
      org_id,
      species_id,
      name,
      description,
      is_global,
      species:species(name)
    `)
    .or(`is_global.eq.true,org_id.eq.${organization.id}`)
    .order('name')

  if (error) throw error
  return (morphs as unknown) as (Morph & { species: { name: string } })[]
}

export async function getMorphById(id: string) {
  const supabase = await createClient()
  
  const { data: morph, error } = await supabase
    .from('morphs')
    .select(`
      id,
      org_id,
      species_id,
      name,
      description,
      is_global,
      species:species(name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return (morph as unknown) as Morph & { species: { name: string } }
}

export async function getMorphsBySpecies(speciesId: string) {
  const supabase = await createClient()
  
  const { data: morphs, error } = await supabase
    .from('morphs')
    .select(`
      id,
      org_id,
      species_id,
      name,
      description,
      is_global
    `)
    .eq('species_id', speciesId)
    .order('name')

  if (error) throw error
  return (morphs as unknown) as Morph[]
}

export async function createMorph(morph: NewMorph) {
  const supabase = await createClient()
  const { organization } = await getUserAndOrganizationInfo()

  const newMorph = {
    ...morph,
    org_id : organization.id,
  }
  const { data, error } = await supabase
    .from('morphs')
    .insert([newMorph])
    .select(`
      id,
      org_id,
      species_id,
      name,
      description,
      is_global,
      species:species(name)
    `)
    .single()

  if (error) throw error
  return (data as unknown) as Morph & { species: { name: string } }
}

export async function updateMorph(id: string, updates: Partial<NewMorph>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('morphs')
    .update({ ...updates, last_modified: new Date().toISOString() })
    .eq('id', id)
    .select(`
      id,
      org_id,
      species_id,
      name,
      description,
      is_global,
      species:species(name)
    `)
    .single()

  if (error) throw error
  return (data as unknown) as Morph & { species: { name: string } }
}

export async function deleteMorph(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('morphs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getGlobalMorphs() {
  const supabase = await createClient()
  
  const { data: morphs, error } = await supabase
    .from('morphs')
    .select(`
      id,
      org_id,
      species_id,
      name,
      description,
      is_global,
      species:species(name)
    `)
    .eq('is_global', true)
    .order('name')

  if (error) throw error
  return (morphs as unknown) as (Morph & { species: { name: string } })[]
} 