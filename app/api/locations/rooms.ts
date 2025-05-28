
import { createClient } from '@/lib/supabase/client'
import { NewRoom, Room } from '@/lib/types/location'

export async function getRooms() {
  const supabase = await createClient()
  const currentUser= await supabase.auth.getUser()
  const userId = currentUser.data.user?.id  
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('org_id', userId)
    .order('name', { ascending: true })

  if (error) throw error
  return rooms as Room[]
}

export async function getRoomById(id: string) {
  const supabase = await createClient()
  
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return room as Room
}

export async function createRoom(room: NewRoom) {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  
  const { data, error } = await supabase
    .from('rooms')
    .insert([{
      ...room,
      org_id: userId
    }])
    .select()
    .single()

  if (error) throw error
  return data as Room
}

export async function updateRoom(id: string, updates: Partial<NewRoom>) {
  const supabase = await createClient()
  
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
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)

  if (error) throw error
} 