'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateGrowthEntryInput } from '@/lib/types/growth'
import { NewReptile, Reptile } from '@/lib/types/reptile'

export async function getReptiles() {
  const supabase = await createClient()
  
  const { data: reptiles, error } = await supabase
    .from('reptiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return reptiles as Reptile[]
}

export async function getReptileById(id: string) {
  const supabase = await createClient()
  
  const { data: reptile, error } = await supabase
    .from('reptiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return reptile as Reptile
}

export async function createReptile(reptile: NewReptile) {
  const supabase = await createClient()
  const currentUser= await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  const newReptile = {
    ...reptile,
    user_id : userId,
  }
  const { data, error } = await supabase
    .from('reptiles')
    .insert([newReptile])
    .select()
    .single()

    if (error) {
      console.error("Error creating reptile :", error.message)
      throw error
    }

    const newReptileGrowth : CreateGrowthEntryInput = {
      reptile_id: data.id,
      user_id: userId || '',
      date: new Date().toISOString(), 
      weight: data.weight,
      length: data.length,
      notes: "",
      attachments: [],
    }

    const {error : growthError} = await supabase
    .from('growth_entries')
    .insert([newReptileGrowth])

  if (growthError) {
    console.error("Error creating growth after reptile :", growthError.message)
    throw error
  }
  
  // If a location is assigned, update the location availability status
  if (data.location_id) {
    const { error: locationError } = await supabase
      .from('locations')
      .update({ is_available: false })
      .eq('id', data.location_id)
    
    if (locationError) {
      console.error("Error updating location availability:", locationError.message)
    }
  }
  
  return data as Reptile
}

export async function updateReptile(id: string, updates: Partial<NewReptile>) {
  const supabase = await createClient()
  
  // First, get the current reptile to check for location changes
  const { data: currentReptile, error: fetchError } = await supabase
    .from('reptiles')
    .select('location_id')
    .eq('id', id)
    .single()
    
  if (fetchError) throw fetchError
  
  const { data, error } = await supabase
    .from('reptiles')
    .update({ ...updates, last_modified: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  // Handle location changes if needed
  if (updates.location_id !== undefined && currentReptile.location_id !== updates.location_id) {
    // If the old location exists, mark it as available
    if (currentReptile.location_id) {
      await supabase
        .from('locations')
        .update({ is_available: true })
        .eq('id', currentReptile.location_id)
    }
    
    // If a new location is assigned, mark it as unavailable
    if (updates.location_id) {
      await supabase
        .from('locations')
        .update({ is_available: false })
        .eq('id', updates.location_id)
    }
  }
  
  return data as Reptile
}

export async function deleteReptile(id: string): Promise<void> {
  const supabase = await createClient()
  
  // First, get the reptile's location ID if it exists
  const { data: reptile, error: fetchError } = await supabase
    .from('reptiles')
    .select('location_id')
    .eq('id', id)
    .single()
    
  if (fetchError) throw fetchError
  
  const { error } = await supabase
    .from('reptiles')
    .delete()
    .eq('id', id)

  if (error) throw error
  
  // If the reptile had a location, mark it as available again
  if (reptile.location_id) {
    await supabase
      .from('locations')
      .update({ is_available: true })
      .eq('id', reptile.location_id)
  }
} 

export async function getReptileByClutchId(clutch_id: string) {
  const supabase = await createClient()
  
  const { data: reptile, error } = await supabase
    .from('reptiles')
    .select('*')
    .eq('parent_clutch_id', clutch_id)

  if (error) throw error
  return reptile as Reptile[]
}

