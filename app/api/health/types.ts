
import { createClient } from '@/lib/supabase/client'
import { HealthLogType } from '@/lib/types/health'

export async function getHealthTypes(subcategoryId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('health_log_types')
    .select('*')
    .order('label', { ascending: true })

  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId)
  }

  const { data: types, error } = await query

  if (error) throw error
  return types as HealthLogType[]
}

export async function getHealthTypeById(id: string) {
  const supabase = await createClient()
  
  const { data: type, error } = await supabase
    .from('health_log_types')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return type as HealthLogType
}

export async function createHealthType(type: Omit<HealthLogType, 'id'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('health_log_types')
    .insert([type])
    .select()
    .single()

  if (error) throw error
  return data as HealthLogType
}

export async function updateHealthType(id: string, updates: Partial<Omit<HealthLogType, 'id'>>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('health_log_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as HealthLogType
}

export async function deleteHealthType(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('health_log_types')
    .delete()
    .eq('id', id)

  if (error) throw error
} 