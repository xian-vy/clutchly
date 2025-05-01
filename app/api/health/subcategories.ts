
import { createClient } from '@/lib/supabase/client'
import { HealthLogSubcategory } from '@/lib/types/health'

export async function getHealthSubcategories(categoryId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('health_log_subcategories')
    .select('*')
    .order('label', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data: subcategories, error } = await query

  if (error) throw error
  return subcategories as HealthLogSubcategory[]
}

export async function getHealthSubcategoryById(id: string) {
  const supabase = await createClient()
  
  const { data: subcategory, error } = await supabase
    .from('health_log_subcategories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return subcategory as HealthLogSubcategory
}

export async function createHealthSubcategory(subcategory: Omit<HealthLogSubcategory, 'id'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('health_log_subcategories')
    .insert([subcategory])
    .select()
    .single()

  if (error) throw error
  return data as HealthLogSubcategory
}

export async function updateHealthSubcategory(id: string, updates: Partial<Omit<HealthLogSubcategory, 'id'>>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('health_log_subcategories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as HealthLogSubcategory
}

export async function deleteHealthSubcategory(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('health_log_subcategories')
    .delete()
    .eq('id', id)

  if (error) throw error
} 