'use server'

import { createClient } from '@/lib/supabase/server'
import { Profile, ProfileFormData } from '@/lib/types/profile'

export async function getProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create a minimal one
    if (error && error.code === 'PGRST116') {
      console.log('Profile not found, creating new profile...')
      return createProfile({
        full_name: '',
        account_type: 'keeper',
        collection_size: null
      })
    }

    if (error) throw error
    return profile as Profile
  } catch (err) {
    console.error('Error in getProfile:', err)
    throw err
  }
}

export async function createProfile(profileData: ProfileFormData) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // First check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
      
    if (existingProfile) {
      // Profile exists, update it instead
      return updateProfile(profileData)
    }
    
    const newProfile: Partial<Profile> = {
      id: user.id,
      email: user.email || '',
      full_name: profileData.full_name,
      account_type: profileData.account_type,
      collection_size: profileData.collection_size,
      is_active: true
    }
    
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()
      
    if (error) {
      console.error("Error creating profile:", error.message, error)
      throw error
    }
    
    return data as Profile
  } catch (err) {
    console.error('Error in createProfile:', err)
    throw err
  }
}

export async function updateProfile(profileData: ProfileFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.full_name,
      account_type: profileData.account_type,
      collection_size: profileData.collection_size
    })
    .eq('id', user.id)
    .select()
    .single()
    
  if (error) {
    console.error("Error updating profile:", error.message)
    throw error
  }
  
  return data as Profile
}

export async function deleteProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)
    
  if (error) {
    console.error("Error deleting profile:", error.message)
    throw error
  }
}

export async function isProfileComplete() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, account_type')
    .eq('id', user.id)
    .single()
    
  if (error || !data) return false
  
  return !!data.full_name && !!data.account_type
} 