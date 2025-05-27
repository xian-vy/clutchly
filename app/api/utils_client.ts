import { createClient } from '@/lib/supabase/client'
import { Organization } from '@/lib/types/organizations'
import { User } from '@/lib/types/users'

type UserOrg = {
  user : User,
  organization: Organization
}
export async function getUserAndOrganizationInfo () : Promise<UserOrg> {
  const supabase =  createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (userError) throw userError

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.org_id)
    .single()

  if (orgError) throw orgError

  return { user, organization }
}