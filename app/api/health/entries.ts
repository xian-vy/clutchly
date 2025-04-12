'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateHealthLogEntryInput, HealthLogEntry } from '@/lib/types/health'

export async function getHealthLogs() {
  const supabase = await createClient()
  
  const { data: healthLogs, error } = await supabase
    .from('health_log_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return healthLogs as HealthLogEntry[]
}

export async function getHealthLogById(id: string) {
  const supabase = await createClient()
  
  const { data: healthLog, error } = await supabase
    .from('health_log_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return healthLog as HealthLogEntry
}

export async function createHealthLog(healthLog: CreateHealthLogEntryInput) {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  
  if (!userId) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }
  
  const newHealthLog = {
    ...healthLog,
    user_id: userId,
  }
  
  
  const { data, error } = await supabase
    .from('health_log_entries')
    .insert([newHealthLog])
    .select()
    .single()

  if (error) {
    console.error('Error creating health log:', error);
    throw error;
  }
  
  return data as HealthLogEntry
}

export async function updateHealthLog(id: string, updates: Partial<CreateHealthLogEntryInput>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('health_log_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as HealthLogEntry
}

export async function deleteHealthLog(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('health_log_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
} 