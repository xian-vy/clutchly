'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Checks if an invite code is valid and available
 */
export async function checkInviteCode(code: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('id, is_available')
      .eq('code', code.toUpperCase())
      .single()
    
    if (error) throw error
    
    return data && data.is_available === true
  } catch (err) {
    console.error('Error in checkInviteCode:', err)
    return false
  }
}

/**
 * Marks an invite code as used by a user
 */
export async function markInviteCodeAsUsed(code: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('invite_codes')
      .update({
        is_available: false,
        used_at: new Date().toISOString(),
        used_by: userId
      })
      .eq('code', code.toUpperCase())
    
    if (error) throw error
    
    return true
  } catch (err) {
    console.error('Error in markInviteCodeAsUsed:', err)
    return false
  }
} 