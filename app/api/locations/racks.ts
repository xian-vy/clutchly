'use server'

import { createClient } from '@/lib/supabase/server'
import { NewRack, Rack } from '@/lib/types/location'

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
  
  const { data, error } = await supabase
    .from('racks')
    .insert([{
      ...rack,
      user_id: userId
    }])
    .select()
    .single()

  if (error) throw error
  return data as Rack
}

export async function updateRack(id: string, updates: Partial<NewRack>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('racks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Rack
}

export async function deleteRack(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('racks')
    .delete()
    .eq('id', id)

  if (error) throw error
} 