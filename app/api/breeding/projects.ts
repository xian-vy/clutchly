import { createClient } from '@/lib/supabase/client'
import { BreedingProject, NewBreedingProject } from '@/lib/types/breeding'

const supabase = createClient()

export async function getBreedingProjects(): Promise<BreedingProject[]> {
  const currentUser= await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  const { data, error } = await supabase
    .from('breeding_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getBreedingProject(id: string): Promise<BreedingProject> {
  const { data, error } = await supabase
    .from('breeding_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createBreedingProject(project: NewBreedingProject): Promise<BreedingProject> {
  const supabase =  createClient()
  const currentUser= await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  const NewBreedingProject = {
    ...project,
    user_id : userId,
  }
  const { data, error } = await supabase
    .from('breeding_projects')
    .insert([NewBreedingProject])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBreedingProject(
  id: string,
  project: NewBreedingProject
): Promise<BreedingProject> {
  const { data, error } = await supabase
    .from('breeding_projects')
    .update(project)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBreedingProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('breeding_projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getBreedingProjectsByDate(dateRange?: { 
  startDate?: string; 
  endDate?: string;
  dateField?: 'start_date' | 'end_date' | 'expected_hatch_date' | 'created_at';
}): Promise<BreedingProject[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('breeding_projects')
    .select('*')
    
  // Apply date filtering if range is provided
  if (dateRange) {
    const dateField = dateRange.dateField || 'start_date'
    
    if (dateRange.startDate) {
      query = query.gte(dateField, dateRange.startDate)
    }
    if (dateRange.endDate) {
      query = query.lte(dateField, dateRange.endDate)
    }
  }
  
  // Order by start date by default
  query = query.order('start_date', { ascending: false })
  
  const { data, error } = await query

  if (error) throw error
  return data
}