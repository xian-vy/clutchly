'use server'

import { createClient } from '@/lib/supabase/server'
import { Species, NewSpecies } from '@/lib/types/species'

export async function getSpecies() {
  const supabase = await createClient()
  
  const { data: species, error } = await supabase
    .from('species')
    .select('*')
    .order('name')

  if (error) throw error
  return species as Species[]
}

export async function getSpeciesById(id: string) {
  const supabase = await createClient()
  
  const { data: species, error } = await supabase
    .from('species')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return species as Species
}

export async function createSpecies(species: NewSpecies) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('species')
    .insert([species])
    .select()
    .single()

  if (error) throw error
  return data as Species
}

export async function updateSpecies(id: string, updates: Partial<NewSpecies>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('species')
    .update({ ...updates, last_modified: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Species
}

export async function deleteSpecies(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('species')
    .delete()
    .eq('id', id)

  if (error) throw error
} 