'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { BackupType, backupConfigs } from '@/lib/types/download'

const backupTypeSchema = z.enum([
  'reptiles',
  'feeding',
  'health',
  'growth',
  'breeding',
  'locations',
])

const filterSchema = z.record(z.string(), z.any())

const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string()
})

const requestSchema = z.object({
  type: backupTypeSchema,
  filters: filterSchema.optional(),
  dateRange: dateRangeSchema.optional()
})

function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined) return ''
  
  switch (type) {
    case 'date':
      return new Date(value as string).toLocaleDateString()
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'array':
      return Array.isArray(value) ? value.join('; ') : ''
    case 'object':
      return JSON.stringify(value)
    case 'number':
      return value.toString()
    default:
      return String(value)
  }
}

function convertToCSV(data: Record<string, unknown>[], type: BackupType): string {
  if (!data.length) return ''
  
  const config = backupConfigs[type]
  const headers = config.fields.map(field => field.label)
  const keys = config.fields.map(field => field.key)
  
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key]
        const field = config.fields.find(f => f.key === key)
        const formattedValue = formatValue(value, field?.type || 'string')
        return formattedValue.includes(',') ? `"${formattedValue}"` : formattedValue
      }).join(',')
    )
  ]
  
  return csvRows.join('\n')
}

export async function createBackup(request: z.infer<typeof requestSchema>) {
  const supabase = await createClient()
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { type, filters, dateRange } = requestSchema.parse(request)

  // Check rate limit (1 backup per hour per type)
  const { data: lastBackup } = await supabase
    .from('backup_logs')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('backup_type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (lastBackup) {
    const lastBackupTime = new Date(lastBackup.created_at)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    if (lastBackupTime > oneHourAgo) {
      throw new Error('Rate limit exceeded. Please wait 1 hour between backups.')
    }
  }

  // Build query based on type and filters
  const tableName = type === 'feeding' ? 'feeding_schedules' : type
  let query = supabase
    .from(tableName)
    .select('*')
    .eq('user_id', user.id)

  // Apply date range filter if provided
  if (dateRange) {
    query = query
      .gte('created_at', dateRange.from)
      .lte('created_at', dateRange.to)
  }

  // Apply custom filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value)
      }
    })
  }

  // Handle special cases for feeding data
  if (type === 'feeding') {
    query = query.select(`
      *,
      targets:feeding_targets(*),
      events:feeding_events(*)
    `)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Convert data to CSV
  const csvData = convertToCSV(data, type)

  // Log the backup
  await supabase.from('backup_logs').insert({
    user_id: user.id,
    backup_type: type,
    data_size: csvData.length,
    status: 'success'
  })

  return csvData
}

export async function getBackupLogs() {
  const supabase = await createClient()
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: logs, error } = await supabase
    .from('backup_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return logs
} 