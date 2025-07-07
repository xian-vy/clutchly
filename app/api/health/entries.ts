import { createClient } from '@/lib/supabase/client'
import { CreateHealthLogEntryInput, HealthLogEntry } from '@/lib/types/health'
import { getUserAndOrganizationInfo } from '../utils_client'
import { Organization } from '@/lib/types/organizations';

export async function getHealthLogs(organization : Organization,dateRange?: { startDate?: string; endDate?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('health_log_entries')
    .select('*')
    .eq('org_id', organization.id)

  // Apply date filtering if range is provided
  if (dateRange) {
    if (dateRange.startDate) {
      query = query.gte('date', dateRange.startDate)
    }
    if (dateRange.endDate) {
      // Set end date to end of day
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)
      query = query.lte('date', endDate.toISOString())
    }
  }

  // Order by date
  query = query.order('date', { ascending: false })

  const { data: healthLogs, error } = await query

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
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
    console.error('No authenticated user found');
    throw new Error('Authentication required');
  }
  
  const newHealthLog = {
    ...healthLog,
    org_id: organization.id,
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

export async function getHealthLogsByDate(organization : Organization, dateRange?: { startDate?: string; endDate?: string }) {
  const supabase = await createClient()
  
  let query = supabase
    .from('health_log_entries')
    .select('*')
    .eq('org_id', organization.id)
    
  // Apply date filtering if range is provided
  if (dateRange) {
    if (dateRange.startDate) {
      query = query.gte('date', dateRange.startDate)
    }
    if (dateRange.endDate) {
      query = query.lte('date', dateRange.endDate)
    }
  }
  
  // Order by date
  query = query.order('date', { ascending: false })
  
  const { data: healthLogs, error } = await query

  if (error) throw error
  return healthLogs as HealthLogEntry[]
}