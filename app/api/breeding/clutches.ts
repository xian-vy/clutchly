import { createClient } from '@/lib/supabase/client'
import { Clutch, NewClutch } from '@/lib/types/breeding'

const supabase = createClient()

export async function getClutches(breedingProjectId: string): Promise<Clutch[]> {
  const { data, error } = await supabase
    .from('clutches')
    .select('*')
    .eq('breeding_project_id', breedingProjectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getClutch(id: string): Promise<Clutch> {
  const { data, error } = await supabase
    .from('clutches')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createClutch(clutch: NewClutch): Promise<Clutch> {
  const { data, error } = await supabase
    .from('clutches')
    .insert([clutch])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClutch(
  id: string,
  clutch: NewClutch
): Promise<Clutch> {
  const { data, error } = await supabase
    .from('clutches')
    .update(clutch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClutch(id: string): Promise<void> {
  const { error } = await supabase
    .from('clutches')
    .delete()
    .eq('id', id)

  if (error) throw error
} 