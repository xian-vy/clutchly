import { createClient } from '@/lib/supabase/client'
import { BreedingProject, NewBreedingProject } from '@/lib/types/breeding'

const supabase = createClient()

export async function getBreedingProjects(): Promise<BreedingProject[]> {
  const { data, error } = await supabase
    .from('breeding_projects')
    .select('*')
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