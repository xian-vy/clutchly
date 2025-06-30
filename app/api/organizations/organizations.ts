import { createClient } from '@/lib/supabase/client'
import { MinProfileInfo, Organization, ProfileFormData } from '@/lib/types/organizations'
import { User } from '@/lib/types/users'
import { createAccessProfile } from '@/app/api/users/access'
import { getPages } from '@/app/api/users/access'
import { getUserAndOrganizationInfo } from '../utils_client'

export async function getCurrentUser() : Promise <User> {
  try {
    const { user } = await getUserAndOrganizationInfo()
    return user as User
  } catch (err) {
    console.error('Error in getOrganization:', err)
    throw err
  }
}

export async function getOrganization() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  try {
    // First get the user's org_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error getting user data:', userError)
      throw userError
    }

    if (!userData?.org_id) {
      throw new Error('User not associated with any organization')
    }

    // Then get the organization
    const { data: organization, error } = await supabase
      .from('organizations')
      .select(`
        *,
        users!users_org_id_fkey(id)
      `)
      .eq('id', userData.org_id)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }
    
    if (!organization) {
      console.error('No organization found for user:', user.id)
      throw new Error('Organization not found')
    }

    return organization as Organization
  } catch (err) {
    console.error('Error in getOrganization:', err)
    throw err
  }
}

export async function getPublicOrganization(orgName: string) : Promise<MinProfileInfo | null>  {
  const supabase =  createClient()

  const { data: orgData, error: orgError } = await supabase
  .from('view_public_organizations')
  .select('id, full_name, logo')
  .ilike('full_name', orgName)
  .single();

  if (orgError || !orgData) {
    console.error("Error fetching public organization:", orgError.message);
    return null;
  }

  return orgData as Organization;
}

async function checkOrganizationNameExists(fullName: string, excludeId?: string) {
  const supabase =  createClient()
  
  let query = supabase
    .from('organizations')
    .select('id')
    .eq('full_name', fullName)
    
  if (excludeId) {
    query = query.neq('id', excludeId)
  }
  
  const { data, error } = await query.single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error checking organization name:', error)
    throw error
  }
  
  return !!data
}

export async function createOrganization(user: User, orgData: ProfileFormData) {
  const supabase =  createClient()
  
  try {
    
    // Check for duplicate organization name
    const nameExists = await checkOrganizationNameExists(orgData.full_name)
    if (nameExists) {
      throw new Error('An organization with this name already exists')
    }
    
    // First check if organization already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', user.id)
      .single()
      
    if (checkError) {
      console.error('Error checking organization:', checkError)
    }
    
    if (existingProfile) {
      // Organization exists, update it instead
      return updateOrganization(orgData)
    }

    // Prepare all data in parallel
    const [pages] = await Promise.all([
      getPages(user)
    ]);
    
    const newProfile: Partial<Organization> = {
      id: user.id,
      email: user.email || '',
      full_name: orgData.full_name.toLowerCase(),
      account_type: orgData.account_type,
      collection_size: orgData.collection_size,
      selected_species: orgData.selected_species,
      is_active: true
    }

    const newUser: Partial<User> = {
      id: user.id,
      org_id: user.id,
      full_name: orgData.full_name,
      role: 'owner',
      status: 'active',
    }

    const staffPages = pages.filter(page => 
      ['Shedding', 'Feeding', 'Enclosures', 'Health', 'Growth'].includes(page.name)
    );

    // First create the organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([newProfile])
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError.message, orgError)
      throw orgError
    }

    // Then create the user
    const { error: userError } = await supabase
      .from('users')
      .upsert([newUser])

    if (userError) {
      console.error("Error creating user:", userError.message, userError)
      throw userError
    }

    // Finally create access profiles
    try {
      await Promise.all([
        createAccessProfile({
          org_id: user.id,
          name: 'Admin',
          description: 'Full access to all features',
          access_controls: pages.map(page => ({
            page_id: page.id,
            can_view: true,
            can_edit: true,
            can_delete: true
          }))
        }).catch(error => {
          console.error("Error creating admin profile:", error);
          throw error;
        }),
        createAccessProfile({
          org_id: user.id,
          name: 'Staff',
          description: 'Access to basic features',
          access_controls: staffPages.map(page => ({
            page_id: page.id,
            can_view: true,
            can_edit: true,
            can_delete: true
          }))
        }).catch(error => {
          console.error("Error creating staff profile:", error);
          throw error;
        })
      ]);
      console.log('Created access profiles successfully')
    } catch (profileError) {
      console.error('Error creating access profiles:', profileError)
      throw profileError
    }
    
    return org as Organization
  } catch (err) {
    console.error('Error in createOrganization:', err)
    throw err
  }
}

export async function updateOrganization(orgData: ProfileFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Check for duplicate organization name, excluding current organization
  const nameExists = await checkOrganizationNameExists(orgData.full_name, user.id)
  if (nameExists) {
    throw new Error('An organization with this name already exists')
  }
  
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