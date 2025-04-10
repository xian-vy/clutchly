'use server'

import { createClient } from '@/lib/supabase/server'
import { Reptile, NewReptile } from '@/lib/types/reptile'

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
  
  const { data, error } = await supabase
    .from('reptiles')
    .insert([reptile])
    .select()
    .single()

  if (error) throw error
  return data as Reptile
}

export async function updateReptile(id: string, updates: Partial<NewReptile>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reptiles')
    .update({ ...updates, last_modified: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Reptile
}

export async function deleteReptile(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('reptiles')
    .delete()
    .eq('id', id)

  if (error) throw error
} 