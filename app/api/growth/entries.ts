import { createClient } from '@/lib/supabase/client'
import { CreateGrowthEntryInput, GrowthEntry } from '@/lib/types/growth'
import { getUserAndOrganizationInfo } from '../utils_client'
import { Organization } from '@/lib/types/organizations';

export async function getGrowthEntries(organization : Organization, dateRange?: { startDate?: string; endDate?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('growth_entries')
    .select('*')
    .eq('org_id', organization.id)

  // Apply date filtering if range is provided
  if (dateRange) {
    if (dateRange.startDate) {
      query = query.gte('date', dateRange.startDate)
    }
    if (dateRange.endDate) {
      // Set end date to end of day
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)
      query = query.lte('date', endDate.toISOString())
    }
  }

  // Order by date
  query = query.order('date', { ascending: false })

  const { data: growthEntries, error } = await query

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
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }
  
  const newGrowthEntry = {
    ...growthEntry,
    org_id: organization.id,
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

export async function getGrowthEntriesByDate(organization : Organization, dateRange?: { startDate?: string; endDate?: string }) {
  const supabase = await createClient()
  
  let query = supabase
    .from('growth_entries')
    .select('*')
    .eq('org_id', organization.id)
    
  // Apply date filtering if range is provided
  if (dateRange) {
    if (dateRange.startDate) {
      query = query.gte('date', dateRange.startDate)
    }
    if (dateRange.endDate) {
      query = query.lte('date', dateRange.endDate)
    }
  }
  
  // Order by date
  query = query.order('date', { ascending: false })
  
  const { data: growthEntries, error } = await query

  if (error) throw error
  return growthEntries as GrowthEntry[]
}