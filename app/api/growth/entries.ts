'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateGrowthEntryInput, GrowthEntry } from '@/lib/types/growth'

export async function getGrowthEntries() {
  const supabase = await createClient()
  
  const { data: growthEntries, error } = await supabase
    .from('growth_entries')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return growthEntries as GrowthEntry[]
}

export async function getGrowthEntryById(id: string) {
  const supabase = await createClient()
  
  const { data: growthEntry, error } = await supabase
    .from('growth_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return growthEntry as GrowthEntry
}

export async function createGrowthEntry(growthEntry: CreateGrowthEntryInput) {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  
  if (!userId) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }
  
  const newGrowthEntry = {
    ...growthEntry,
    user_id: userId,
  }
  
  const { data, error } = await supabase
    .from('growth_entries')
    .insert([newGrowthEntry])
    .select()
    .single()

    const {  error : reptileError } = await supabase
    .from('reptiles')
    .update({ 
      weight: data.weight,
      length: data.length,
      last_modified: new Date().toISOString()
     })
    .eq('id', data.reptile_id)

  if (error || reptileError) {
    console.error('Error creating growth entry:', error || reptileError);
    throw error;
  }
  
  return data as GrowthEntry
}

export async function updateGrowthEntry(id: string, updates: Partial<CreateGrowthEntryInput>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('growth_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Add reptile update if weight or length changed
  if (updates.weight || updates.length) {
    // Get the latest growth entry for this reptile
    const { data: latestEntry, error: latestError } = await supabase
      .from('growth_entries')
      .select('*')
      .eq('reptile_id', data.reptile_id)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (latestError) throw latestError

    // Only update reptile if this entry is the latest
    if (latestEntry.id === id) {
      const { error: reptileError } = await supabase
        .from('reptiles')
        .update({ 
          ...(updates.weight && { weight: updates.weight }),
          ...(updates.length && { length: updates.length }),
          last_modified: new Date().toISOString()
        })
        .eq('id', data.reptile_id)

      if (reptileError) throw reptileError
    }
  }

  return data as GrowthEntry
}

export async function deleteGrowthEntry(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('growth_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}