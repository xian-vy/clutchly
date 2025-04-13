import { createClient } from '@/lib/supabase/client'
import { Hatchling, NewHatchling } from '@/lib/types/breeding'

const supabase = createClient()

export async function getHatchlings(clutchId: string): Promise<Hatchling[]> {
  const { data, error } = await supabase
    .from('hatchlings')
    .select('*')
    .eq('clutch_id', clutchId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getHatchling(id: string): Promise<Hatchling> {
  const { data, error } = await supabase
    .from('hatchlings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createHatchling(hatchling: NewHatchling): Promise<Hatchling> {
  const { data, error } = await supabase
    .from('hatchlings')
    .insert([hatchling])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateHatchling(
  id: string,
  hatchling: NewHatchling
): Promise<Hatchling> {
  const { data, error } = await supabase
    .from('hatchlings')
    .update(hatchling)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteHatchling(id: string): Promise<void> {
  const { error } = await supabase
    .from('hatchlings')
    .delete()
    .eq('id', id)

  if (error) throw error
} 