
import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'
import { BackupType, backupConfigs } from '@/lib/types/download'
import { SupabaseClient } from '@supabase/supabase-js'
import { Clutch } from '@/lib/types/breeding'

const backupTypeSchema = z.enum([
  'reptiles',
  'feeding',
  'health_log_entries',
  'growth_entries',
  'breeding_projects',
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

function formatHetTraits(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.map(trait => `${trait.percentage}% ${trait.trait}`).join(', ')
}

function formatVisualTraits(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.join(', ')
}

function formatTargets(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.map(target => target.name || target.id).join('; ')
}

function formatEvents(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.length.toString() + ' events'
}

function formatClutches(value: unknown): string {
  if (!Array.isArray(value)) return '0'
  return value.length.toString()
}

function formatReptiles(value: unknown): string {
  if (!Array.isArray(value)) return '0'
  return value.length.toString()
}

function formatValue(value: unknown, type: string, key: string): string {
  if (value === null || value === undefined) return ''
  
  // Handle special formatting cases
  switch (key) {
    case 'het_traits':
      return formatHetTraits(value)
    case 'visual_traits':
      return formatVisualTraits(value)
    case 'targets':
      return formatTargets(value)
    case 'events':
      return formatEvents(value)
    case 'clutches':
      return formatClutches(value)
    case 'reptiles':
      return formatReptiles(value)
  }
  
  // Handle standard types
  switch (type) {
    case 'date':
      return new Date(value as string).toLocaleDateString()
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'array':
      return Array.isArray(value) ? value.join('; ') : ''
    case 'object':
      if (Array.isArray(value)) {
        return value.join('; ')
      }
      return JSON.stringify(value)
    case 'number':
      return value.toString()
    default:
      return String(value)
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: Record<string, unknown> | null, part) => {
    if (acc === null) return null
    const value = acc[part]
    if (value === undefined) return null
    if (typeof value === 'object') return value as Record<string, unknown>
    return { value }
  }, obj)?.value
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
        // For nested fields like visual_traits and het_traits, get the direct value from the row
        // instead of using getNestedValue which doesn't handle arrays properly
        let value;
        if (key === 'visual_traits' || key === 'het_traits') {
          value = row[key];
        } else {
          value = getNestedValue(row, key);
        }
        
        const field = config.fields.find(f => f.key === key)
        const formattedValue = formatValue(value, field?.type || 'string', key)
        return formattedValue.includes(',') ? `"${formattedValue}"` : formattedValue
      }).join(',')
    )
  ]
  
  return csvRows.join('\n')
}

async function getReptileData(supabase: SupabaseClient, userId: string, filters: Record<string, unknown> = {}, dateRange?: { from: string; to: string }) {
  // Get reptiles
  let query = supabase
    .from('reptiles')
    .select('*')
    .eq('org_id', userId)

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.from)
      .lte('created_at', dateRange.to)
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      query = query.eq(key, value)
    }
  })

  const { data: reptiles, error } = await query.order('name')
  if (error) throw error

  // Get species and morphs
  const speciesIds = reptiles.map(r => r.species_id).filter(Boolean)
  const morphIds = reptiles.map(r => r.morph_id).filter(Boolean)

  // Get parent IDs
  const parentIds = [
    ...reptiles.map(r => r.dam_id).filter(Boolean),
    ...reptiles.map(r => r.sire_id).filter(Boolean)
  ]

  // Fetch species
  const { data: species } = await supabase
    .from('species')
    .select('id, name, scientific_name')
    .in('id', speciesIds)

  // Fetch morphs
  const { data: morphs } = await supabase
    .from('morphs')
    .select('id, name')
    .in('id', morphIds)

  // Fetch parent reptiles
  const { data: parents } = await supabase
    .from('reptiles')
    .select('id, name')
    .in('id', parentIds)

  // Create maps for quick lookup
  const speciesMap = new Map(species?.map(s => [s.id, s]) || [])
  const morphMap = new Map(morphs?.map(m => [m.id, m]) || [])
  const parentMap = new Map(parents?.map(p => [p.id, p]) || [])

  // Enhance reptiles with related data
  return reptiles.map(reptile => ({
    ...reptile,
    species: speciesMap.get(reptile.species_id) || { name: 'Unknown', scientific_name: null },
    morph: morphMap.get(reptile.morph_id) || { name: 'Unknown' },
    mother: reptile.dam_id ? parentMap.get(reptile.dam_id) || { name: 'Unknown' } : null,
    father: reptile.sire_id ? parentMap.get(reptile.sire_id) || { name: 'Unknown' } : null
  }))
}

async function getHealthData(supabase: SupabaseClient, userId: string, filters: Record<string, unknown> = {}, dateRange?: { from: string; to: string }) {
  // Get health logs
  let query = supabase
    .from('health_log_entries')
    .select('*')
    .eq('org_id', userId)

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.from)
      .lte('created_at', dateRange.to)
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      query = query.eq(key, value)
    }
  })

  const { data: healthLogs, error } = await query.order('date', { ascending: false })
  if (error) throw error

  // Get related data
  const reptileIds = healthLogs.map(h => h.reptile_id).filter(Boolean)
  const categoryIds = healthLogs.map(h => h.category_id).filter(Boolean)
  const subcategoryIds = healthLogs.map(h => h.subcategory_id).filter(Boolean)
  const typeIds = healthLogs.map(h => h.type_id).filter(Boolean)

  // Fetch reptiles
  const { data: reptiles } = await supabase
    .from('reptiles')
    .select('id, name')
    .in('id', reptileIds)

  // Fetch categories
  const { data: categories } = await supabase
    .from('health_log_categories')
    .select('id, label')
    .in('id', categoryIds)

  // Fetch subcategories
  const { data: subcategories } = await supabase
    .from('health_log_subcategories')
    .select('id, label')
    .in('id', subcategoryIds)

  // Fetch types
  const { data: types } = await supabase
    .from('health_log_types')
    .select('id, label')
    .in('id', typeIds)

  // Create maps for quick lookup
  const reptileMap = new Map(reptiles?.map(r => [r.id, r]) || [])
  const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])
  const subcategoryMap = new Map(subcategories?.map(s => [s.id, s]) || [])
  const typeMap = new Map(types?.map(t => [t.id, t]) || [])

  // Enhance health logs with related data
  return healthLogs.map(log => ({
    ...log,
    reptile: reptileMap.get(log.reptile_id) || { name: 'Unknown' },
    category: categoryMap.get(log.category_id) || { label: 'Unknown' },
    subcategory: subcategoryMap.get(log.subcategory_id) || { label: 'Unknown' },
    type: log.type_id ? typeMap.get(log.type_id) || { label: 'Unknown' } : null
  }))
}

async function getGrowthData(supabase: SupabaseClient, userId: string, filters: Record<string, unknown> = {}, dateRange?: { from: string; to: string }) {
  // Get growth entries
  let query = supabase
    .from('growth_entries')
    .select('*')
    .eq('org_id', userId)

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.from)
      .lte('created_at', dateRange.to)
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      query = query.eq(key, value)
    }
  })

  const { data: growthEntries, error } = await query.order('date', { ascending: false })
  if (error) throw error

  // Get reptiles
  const reptileIds = growthEntries.map(g => g.reptile_id).filter(Boolean)
  const { data: reptiles } = await supabase
    .from('reptiles')
    .select('id, name')
    .in('id', reptileIds)

  // Create map for quick lookup
  const reptileMap = new Map(reptiles?.map(r => [r.id, r]) || [])

  // Enhance growth entries with reptile data
  return growthEntries.map(entry => ({
    ...entry,
    reptile: reptileMap.get(entry.reptile_id) || { name: 'Unknown' }
  }))
}

async function getBreedingData(supabase: SupabaseClient, userId: string, filters: Record<string, unknown> = {}, dateRange?: { from: string; to: string }) {
  // Get breeding projects
  let query = supabase
    .from('breeding_projects')
    .select('*')
    .eq('org_id', userId)

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.from)
      .lte('created_at', dateRange.to)
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      query = query.eq(key, value)
    }
  })

  const { data: breedingProjects, error } = await query.order('start_date', { ascending: false })
  if (error) throw error

  // Get related data
  const reptileIds = [
    ...breedingProjects.map(bp => bp.male_id).filter(Boolean),
    ...breedingProjects.map(bp => bp.female_id).filter(Boolean)
  ]
  const speciesIds = breedingProjects.map(bp => bp.species_id).filter(Boolean)
  const projectIds = breedingProjects.map(bp => bp.id)

  // Fetch reptiles
  const { data: reptiles } = await supabase
    .from('reptiles')
    .select('id, name')
    .in('id', reptileIds)

  // Fetch species
  const { data: species } = await supabase
    .from('species')
    .select('id, name')
    .in('id', speciesIds)

  // Fetch clutches
  const { data: clutches } = await supabase
    .from('clutches')
    .select('*')
    .in('breeding_project_id', projectIds)

  // Create maps for quick lookup
  const reptileMap = new Map(reptiles?.map(r => [r.id, r]) || [])
  const speciesMap = new Map(species?.map(s => [s.id, s]) || [])
  const clutchMap = new Map<string | number, Clutch[]>(projectIds.map(id => [id, []]))
  clutches?.forEach(clutch  => {
    const projectClutches = clutchMap.get(clutch.breeding_project_id) || []
    projectClutches.push(clutch)
    clutchMap.set(clutch.breeding_project_id, projectClutches)
  })

  // Enhance breeding projects with related data
  return breedingProjects.map(project => ({
    ...project,
    male: reptileMap.get(project.male_id) || { name: 'Unknown' },
    female: reptileMap.get(project.female_id) || { name: 'Unknown' },
    species: speciesMap.get(project.species_id) || { name: 'Unknown' },
    clutches: clutchMap.get(project.id) || []
  }))
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
    .eq('org_id', user.id)
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

  // Get data based on type
  let data: Record<string, unknown>[]
  switch (type) {
    case 'reptiles':
      data = await getReptileData(supabase, user.id, filters, dateRange)
      break
    case 'health_log_entries':
      data = await getHealthData(supabase, user.id, filters, dateRange)
      break
    case 'growth_entries':
      data = await getGrowthData(supabase, user.id, filters, dateRange)
      break
    case 'breeding_projects':
      data = await getBreedingData(supabase, user.id, filters, dateRange)
      break
    default:
      throw new Error('Invalid backup type')
  }

  // Convert data to CSV
  const csvData = convertToCSV(data, type)

  // Log the backup
  await supabase.from('backup_logs').insert({
    org_id: user.id,
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
    .eq('org_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return logs
} 

export async function getLastBackupTimes(){
  const supabase = await createClient()

  const { data: lastBackups } = await supabase
    .from('backup_logs')
    .select('backup_type, created_at')
    .order('created_at', { ascending: false })

    return lastBackups
}