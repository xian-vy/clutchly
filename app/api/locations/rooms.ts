
import { createClient } from '@/lib/supabase/client'
import { NewRoom, Room } from '@/lib/types/location'
import { getUserAndOrganizationInfo } from '../utils_client'

export async function getRooms() {
  const supabase =  createClient()
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('org_id', organization.id)
    .order('name', { ascending: true })

  if (error) throw error
  return rooms as Room[]
}

export async function getRoomById(id: string) {
  const supabase =  createClient()
  
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return room as Room
}

export async function createRoom(room: NewRoom) {
  const supabase =  createClient()
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }
  
  const newRoom = {
    ...room,
    org_id: organization.id
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert([newRoom])
    .select() 
    .single()

  if (error)  {
    console.error('Error creating room:', error)
  }
  return data as Room
}

export async function updateRoom(id: string, updates: Partial<NewRoom>) {
  const supabase =  createClient()
  
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Room
}

export async function deleteRoom(id: string): Promise<void> {
  const supabase =  createClient()
  
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)

  if (error) throw error
} 