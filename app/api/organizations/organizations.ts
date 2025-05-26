'use server'

import { createClient } from '@/lib/supabase/server'
import { MinProfileInfo, Organization, ProfileFormData } from '@/lib/types/organizations'
import { User } from '@/lib/types/users'

export async function getOrganization() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  try {
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.id)
      .single()


    if (error) throw error
    return organization as Organization
  } catch (err) {
    console.error('Error in getOrganization:', err)
    throw err
  }
}

export async function getPublicOrganization(orgName: string) : Promise<MinProfileInfo | null>  {
  const supabase = await createClient()

  const { data: orgData, error: orgError } = await supabase
  .from('view_public_organizations')
  .select('id, full_name, logo')
  .eq('full_name', orgName)
  .single();

  if (orgError || !orgData) {
    console.error("Error fetching public organization:", orgError.message);
    return null;
  }

  return orgData as Organization;
}

export async function createOrganization(orgData: ProfileFormData) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // First check if organization already exists
    const { data: existingProfile } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', user.id)
      .single()
      
    if (existingProfile) {
      // Organization exists, update it instead
      return updateOrganization(orgData)
    }
    
    const newProfile: Partial<Organization> = {
      id: user.id,
      email: user.email || '',
      full_name: orgData.full_name,
      account_type: orgData.account_type,
      collection_size: orgData.collection_size,
      selected_species: orgData.selected_species,
      is_active: true
    }
    
    
    const { data, error } = await supabase
      .from('organizations')
      .insert([newProfile])
      .select()
      .single()

      const newUser: Partial<User> = {
        id: user.id,
        org_id: user.id,
        full_name : orgData.full_name,
        role : 'admin'
      }
      console.log("newUser",newUser)

      const {  error : userError } = await supabase
      .from('users')
      .upsert([newUser])

    if (error) {
      console.error("Error creating organization:", error.message, error)
      throw error
    }

    if (userError) {
      console.error("Error creating user:", userError.message, userError)
      throw userError
    }
    
    return data as Organization
  } catch (err) {
    console.error('Error in createOrganization:', err)
    throw err
  }
}

export async function updateOrganization(orgData: ProfileFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('organizations')
    .update({
      full_name: orgData.full_name,
      account_type: orgData.account_type,
      collection_size: orgData.collection_size,
      selected_species: orgData.selected_species
    })
    .eq('id', user.id)
    .select()
    .single()
    
  if (error) {
    console.error("Error updating organization:", error.message)
    throw error
  }
  
  return data as Organization
}

export async function deleteOrganization() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', user.id)
    
  if (error) {
    console.error("Error deleting organization:", error.message)
    throw error
  }
}

export async function isProfileComplete() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data, error } = await supabase
    .from('organizations')
    .select('full_name, account_type, selected_species')
    .eq('id', user.id)
    .single()
    
  if (error || !data) return false
  
  // Check for name, account type, and at least one selected species
  return !!data.full_name && 
         !!data.account_type && 
         Array.isArray(data.selected_species) && 
         data.selected_species.length > 0;
} 