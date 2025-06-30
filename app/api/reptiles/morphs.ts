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

export async function getGlobalMorphs(speciesIds?: string[]) {
  const supabase =  createClient();
  const { organization } = await getUserAndOrganizationInfo();

  // 1. Fetch all unique species_id from reptiles for the current org
  const { data: reptiles, error: reptilesError } = await supabase
    .from('reptiles')
    .select('species_id')
    .eq('org_id', organization.id);
  if (reptilesError) throw reptilesError;

  const reptileSpeciesIds = Array.from(
    new Set((reptiles || []).map(r => r.species_id?.toString()).filter(Boolean))
  );

  // 2. Merge with provided speciesIds
  let allSpeciesIds: string[] = [];
  if (speciesIds && speciesIds.length > 0) {
    allSpeciesIds = Array.from(new Set([...speciesIds, ...reptileSpeciesIds]));
  } else {
    allSpeciesIds = reptileSpeciesIds;
  }

  // 3. Fetch morphs for all these species IDs (global or org)
  let query = supabase
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
    .order('name');

  if (allSpeciesIds.length > 0) {
    query = query.in('species_id', allSpeciesIds);
  }

  const { data: morphs, error } = await query;

  if (error) throw error;
  return (morphs as unknown) as (Morph & { species: { name: string } })[];
} 