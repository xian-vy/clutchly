
import { createClient } from '@/lib/supabase/client'
import { NewRack, Rack, NewLocation } from '@/lib/types/location'
import { bulkCreateLocations } from './locations'

export async function getRacks() {
  const supabase = await createClient()
  
  const { data: racks, error } = await supabase
    .from('racks')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return racks as Rack[]
}

export async function getRacksByRoom(roomId: string) {
  const supabase = await createClient()
  
  const { data: racks, error } = await supabase
    .from('racks')
    .select('*')
    .eq('room_id', roomId)
    .order('name', { ascending: true })

  if (error) throw error
  return racks as Rack[]
}

export async function getRackById(id: string) {
  const supabase = await createClient()
  
  const { data: rack, error } = await supabase
    .from('racks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return rack as Rack
}

export async function createRack(rack: NewRack) {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  
  // Create the rack first
  const { data: newRack, error } = await supabase
    .from('racks')
    .insert([{
      ...rack,
      user_id: userId
    }])
    .select()
    .single()

  if (error) throw error

  // Generate locations based on rack dimensions
  const locationsToCreate: NewLocation[] = [];
  const room = await getRoomById(rack.room_id);
  const roomName = room?.name || 'Unknown Room';
  const rackName = newRack.name;
  
  // For each level in the rack
  for (let level = 1; level <= rack.rows; level++) {
    // For each position in the level
    const positions = rack.columns || 1;
    for (let position = 1; position <= positions; position++) {
      const label = `${roomName} > ${rackName} > Level ${level} > Position ${position}`;
      
      locationsToCreate.push({
        room_id: rack.room_id,
        rack_id: newRack.id,
        shelf_level: level.toString(),
        position: position.toString(),
        label,
        notes: rack.notes || null,
        is_available: true,
      });
    }
  }
  
  // Create all locations at once
  await bulkCreateLocations(locationsToCreate);
  
  return newRack as Rack
}

export async function updateRack(id: string, updates: Partial<NewRack>) {
  const supabase = await createClient()
  
  // Get the current rack to check if dimensions changed
  const {  error: currentError } = await supabase
    .from('racks')
    .select('*')
    .eq('id', id)
    .single()
    
  if (currentError) throw currentError
  
  // Update the rack
  const { data: updatedRack, error } = await supabase
    .from('racks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // If dimensions changed, regenerate locations
  if (updates.rows !== undefined || updates.columns !== undefined) {
    // Delete existing locations for this rack
    await supabase
      .from('locations')
      .delete()
      .eq('rack_id', id)
    
    // Generate new locations based on updated dimensions
    const locationsToCreate: NewLocation[] = [];
    const room = await getRoomById(updatedRack.room_id);
    const roomName = room?.name || 'Unknown Room';
    const rackName = updatedRack.name;
    
    // For each level in the rack
    for (let level = 1; level <= updatedRack.rows; level++) {
      // For each position in the level
      const positions = updatedRack.columns || 1;
      for (let position = 1; position <= positions; position++) {
        const label = `${roomName} > ${rackName} > Level ${level} > Position ${position}`;
        
        locationsToCreate.push({
          room_id: updatedRack.room_id,
          rack_id: updatedRack.id,
          shelf_level: level.toString(),
          position: position.toString(),
          label,
          notes: updatedRack.notes || null,
          is_available: true,
        });
      }
    }
    
    // Create all locations at once
    await bulkCreateLocations(locationsToCreate);
  }
  
  return updatedRack as Rack
}

export async function deleteRack(id: string): Promise<void> {
  const supabase = await createClient()
  
  // Delete all locations for this rack first
  await supabase
    .from('locations')
    .delete()
    .eq('rack_id', id)
  
  // Then delete the rack
  const { error } = await supabase
    .from('racks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Helper function to get room by ID
async function getRoomById(id: string) {
  const supabase = await createClient()
  
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return room
}

export async function updateRackDimensions(rackId: string) {
  const supabase = await createClient()
  
  // Get all locations for this rack
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('shelf_level, position')
    .eq('rack_id', rackId)
  
  if (locationsError) throw locationsError
  
  // Calculate max rows and columns
  const maxLevel = Math.max(...locations.map(loc => Number(loc.shelf_level)))
  const maxPosition = Math.max(...locations.map(loc => Number(loc.position)))
  
  // Update rack with new dimensions
  const { data, error } = await supabase
    .from('racks')
    .update({
      rows: maxLevel,
      columns: maxPosition
    })
    .eq('id', rackId)
    .select()
    .single()

  if (error) throw error
  return data as Rack
} 