'use server'

import { createClient } from '@/lib/supabase/server'
import { HealthLogCategory } from '@/lib/types/health'

export async function getHealthCategories() {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('health_log_categories')
    .select('*')
    .order('label', { ascending: true })

  if (error) throw error
  return categories as HealthLogCategory[]
}

export async function getHealthCategoryById(id: string) {
  const supabase = await createClient()
  
  const { data: category, error } = await supabase
    .from('health_log_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return category as HealthLogCategory
}

export async function createHealthCategory(category: Omit<HealthLogCategory, 'id'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('health_log_categories')
    .insert([category])
    .select()
    .single()

  if (error) throw error
  return data as HealthLogCategory
}

export async function updateHealthCategory(id: string, updates: Partial<Omit<HealthLogCategory, 'id'>>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('health_log_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as HealthLogCategory
}

export async function deleteHealthCategory(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('health_log_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
} 