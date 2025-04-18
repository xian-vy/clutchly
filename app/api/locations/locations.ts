'use server'

import { createClient } from '@/lib/supabase/server'
import { Location, NewLocation } from '@/lib/types/location'

export async function getLocations() {
  const supabase = await createClient()
  
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .order('label', { ascending: true })

  if (error) throw error
  return locations as Location[]
}

export async function getAvailableLocations() {
  const supabase = await createClient()
  
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_available', true)
    .order('label', { ascending: true })

  if (error) throw error
  return locations as Location[]
}

export async function getLocationById(id: string) {
  const supabase = await createClient()
  
  const { data: location, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return location as Location
}

export async function getLocationsByRack(rackId: string) {
  const supabase = await createClient()
  
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .eq('rack_id', rackId)
    .order('shelf_level', { ascending: true })
    .order('position', { ascending: true })

  if (error) throw error
  return locations as Location[]
}

export async function createLocation(location: NewLocation) {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id

  // With RLS enabled, this will automatically be restricted to the current user
  const { data, error } = await supabase
    .from('locations')
    .insert([{
      ...location,
      user_id: userId
    }])
    .select()
    .single()

  if (error) throw error
  return data as Location
}

export async function updateLocation(id: string, updates: Partial<NewLocation>) {
  const supabase = await createClient()
  
  // With RLS, user can only update their own locations
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Location
}

export async function deleteLocation(id: string): Promise<void> {
  const supabase = await createClient()
  
  // With RLS, user can only delete their own locations
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getLocationDetails(locationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      rooms:room_id (name),
      racks:rack_id (name, type)
    `)
    .eq('id', locationId)
    .single()

  if (error) throw error
  return data
} 