'use server'

import { createClient } from '@/lib/supabase/server'
import { Morph, NewMorph } from '@/lib/types/morph'

export async function getMorphs() {
  const supabase = await createClient()
  
  const { data: morphs, error } = await supabase
    .from('morphs')
    .select(`
      *,
      species:species(name)
    `)
    .order('name')

  if (error) throw error
  return morphs as (Morph & { species: { name: string } })[]
}

export async function getMorphById(id: string) {
  const supabase = await createClient()
  
  const { data: morph, error } = await supabase
    .from('morphs')
    .select(`
      *,
      species:species(name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return morph as Morph & { species: { name: string } }
}

export async function getMorphsBySpecies(speciesId: string) {
  const supabase = await createClient()
  
  const { data: morphs, error } = await supabase
    .from('morphs')
    .select('*')
    .eq('species_id', speciesId)
    .order('name')

  if (error) throw error
  return morphs as Morph[]
}

export async function createMorph(morph: NewMorph) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('morphs')
    .insert([morph])
    .select(`
      *,
      species:species(name)
    `)
    .single()

  if (error) throw error
  return data as Morph & { species: { name: string } }
}

export async function updateMorph(id: string, updates: Partial<NewMorph>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('morphs')
    .update({ ...updates, last_modified: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      species:species(name)
    `)
    .single()

  if (error) throw error
  return data as Morph & { species: { name: string } }
}

export async function deleteMorph(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('morphs')
    .delete()
    .eq('id', id)

  if (error) throw error
} 