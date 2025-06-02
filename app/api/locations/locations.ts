
import { createClient } from '@/lib/supabase/client'
import { Location, NewLocation } from '@/lib/types/location'
import { updateRackDimensions } from './racks'
import { getUserAndOrganizationInfo } from '../utils_client'

export async function getLocations() {
  const supabase =  createClient()
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }

  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .eq('org_id', organization.id)
    .order('label', { ascending: true })

  if (error) throw error
  return locations as Location[]
}

export async function getAvailableLocations() {
  const supabase =  createClient()
  
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_available', true)
    .order('label', { ascending: true })

  if (error) throw error
  return locations as Location[]
}

export async function getLocationById(id: string) {
  const supabase =  createClient()
  
  const { data: location, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return location as Location
}

export async function getLocationsByRack(rackId: string) {
  const supabase =  createClient()
  
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
  const supabase =  createClient()
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }
  // With RLS enabled, this will automatically be restricted to the current user
  const { data, error } = await supabase
    .from('locations')
    .insert([{
      ...location,
      org_id: organization.id
    }])
    .select()
    .single()

  if (error) throw error
  
  // Update rack dimensions after creating location
  await updateRackDimensions(location.rack_id)
  
  return data as Location
}

export async function updateLocation(id: string, updates: Partial<NewLocation>) {
  const supabase =  createClient()
  
  // Get the current location to check if rack_id changed
  const { data: currentLocation, error: currentError } = await supabase
    .from('locations')
    .select('rack_id')
    .eq('id', id)
    .single()
    
  if (currentError) throw currentError
  
  // With RLS, user can only update their own locations
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  // Update rack dimensions for both old and new rack if rack_id changed
  if (updates.rack_id && updates.rack_id !== currentLocation.rack_id) {
    await updateRackDimensions(currentLocation.rack_id) // Update old rack
    await updateRackDimensions(updates.rack_id) // Update new rack
  } else if (updates.rack_id) {
    await updateRackDimensions(updates.rack_id)
  } else if (currentLocation.rack_id) {
    await updateRackDimensions(currentLocation.rack_id)
  }
  
  return data as Location
}

export async function deleteLocation(id: string): Promise<void> {
  const supabase =  createClient()
  
  // Get the location's rack_id before deleting
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('rack_id')
    .eq('id', id)
    .single()
    
  if (locationError) throw locationError
  
  // With RLS, user can only delete their own locations
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)

  if (error) throw error
  
  // Update rack dimensions after deleting location
  if (location.rack_id) {
    await updateRackDimensions(location.rack_id)
  }
}

export async function getLocationDetails(locationId: string) {
  const supabase =  createClient()
  
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

export async function bulkCreateLocations(locations: NewLocation[]) {
  const supabase =  createClient()
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }

  // Add org_id to each location
  const locationsWithUserId = locations.map(location => ({
    ...location,
    org_id: organization.id
  }))

  // Insert all locations at once
  const { data, error } = await supabase
    .from('locations')
    .insert(locationsWithUserId)
    .select()

  if (error) throw error
  
  // Update rack dimensions for each unique rack
  const uniqueRackIds = [...new Set(locations.map(loc => loc.rack_id))]
  await Promise.all(uniqueRackIds.map(rackId => updateRackDimensions(rackId)))
  
  return data as Location[]
} 