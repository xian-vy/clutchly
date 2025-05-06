import { createClient } from '@/lib/supabase/client'
import { Clutch, NewClutch } from '@/lib/types/breeding'

const supabase = createClient()

export async function getAllClutches(): Promise<Clutch[]> {
  const { data, error } = await supabase
    .from('clutches')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

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
  // First get the breeding project to get parent IDs
  const { data: project, error: projectError } = await supabase
    .from('breeding_projects')
    .select('*')
    .eq('id', clutch.breeding_project_id)
    .single()

  if (projectError) throw projectError

  // Create the clutch
  const { data, error } = await supabase
    .from('clutches')
    .insert([clutch])
    .select()
    .single()

  if (error) throw error

  // Update parent reptiles
  const parents = [project.male_id, project.female_id]
  for (const parentId of parents) {
    // Get current reptile data
    const { data: reptile } = await supabase
      .from('reptiles')
      .select('project_ids, is_breeder')
      .eq('id', parentId)
      .single()

    // Update project_ids and is_breeder
    const projectIds = reptile?.project_ids || []
    if (!projectIds.includes(project.id)) {
      projectIds.push(project.id)
    }

    await supabase
      .from('reptiles')
      .update({ 
        project_ids: projectIds,
        is_breeder: true,
        last_modified: new Date().toISOString()
      })
      .eq('id', parentId)
  }

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
  // First get the clutch and its project to get parent IDs
  const { data: clutch, error: clutchError } = await supabase
    .from('clutches')
    .select('breeding_project_id')
    .eq('id', id)
    .single()

  if (clutchError) throw clutchError

  const { data: project, error: projectError } = await supabase
    .from('breeding_projects')
    .select('*')
    .eq('id', clutch.breeding_project_id)
    .single()

  if (projectError) throw projectError

  // Delete the clutch
  const { error } = await supabase
    .from('clutches')
    .delete()
    .eq('id', id)

  if (error) throw error

  // Check if parents have other active projects
  const parents = [project.male_id, project.female_id]
  for (const parentId of parents) {
    // Get current reptile data
    const { data: reptile } = await supabase
      .from('reptiles')
      .select('project_ids')
      .eq('id', parentId)
      .single()

    let projectIds = reptile?.project_ids || []
    projectIds = projectIds.filter((pid : string)=> pid !== project.id.toString())

    // Check if reptile has any other active projects
    const { data: activeProjects } = await supabase
      .from('breeding_projects')
      .select('id')
      .in('id', projectIds)
      .eq('status', 'active')

    // Update reptile
    await supabase
      .from('reptiles')
      .update({ 
        project_ids: projectIds,
        is_breeder: activeProjects && activeProjects.length > 0,
        last_modified: new Date().toISOString()
      })
      .eq('id', parentId)
  }
}

export async function getClutchesByDate(
  breedingProjectId: string,
  dateRange?: { 
    startDate?: string; 
    endDate?: string;
    dateField?: 'lay_date' | 'hatch_date' | 'created_at';
  }
): Promise<Clutch[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('clutches')
    .select('*')
    .eq('breeding_project_id', breedingProjectId)
    
  // Apply date filtering if range is provided
  if (dateRange) {
    const dateField = dateRange.dateField || 'lay_date'
    
    if (dateRange.startDate) {
      query = query.gte(dateField, dateRange.startDate)
    }
    if (dateRange.endDate) {
      query = query.lte(dateField, dateRange.endDate)
    }
  }
  
  // Order by lay date by default
  query = query.order('lay_date', { ascending: false })
  
  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getAllClutchesByDate(
  dateRange?: { 
    startDate?: string; 
    endDate?: string;
    dateField?: 'lay_date' | 'hatch_date' | 'created_at';
  }
): Promise<Clutch[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('clutches')
    .select('*')
    
  // Apply date filtering if range is provided
  if (dateRange) {
    const dateField = dateRange.dateField || 'lay_date'
    
    if (dateRange.startDate) {
      query = query.gte(dateField, dateRange.startDate)
    }
    if (dateRange.endDate) {
      query = query.lte(dateField, dateRange.endDate)
    }
  }
  
  // Order by lay date by default
  query = query.order('lay_date', { ascending: false })
  
  const { data, error } = await query

  if (error) throw error
  return data
}