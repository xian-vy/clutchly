import { createClient } from '@/lib/supabase/server'
import { Organization } from '@/lib/types/organizations'
import { User } from '@/lib/types/users'
import { getSubscription } from './subscriptions/subscriptions'

type UserOrg = {
  user : User,
  organization: Organization
}
export async function getUserAndOrganizationInfo () : Promise<UserOrg> {
  const supabase =  await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  const email = currentUser.data.user?.email
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      organizations!inner (*)
    `)
    .eq('id', userId)
    .single()

    if (userError) throw userError

    const userWithEmail = {
      ...user,
      email
    }
  
    return { 
      user: userWithEmail, 
      organization: user.organizations 
    }
}

export async function getSubscriptionLimit(): Promise<number> {
  const supabase = await createClient()
  const subscription = await getSubscription();
  if (!subscription) throw new Error('No subscription found')
  
  const { data, error } = await supabase
    .from('subscription_limits')
    .select('plan, reptile_limit')
    .eq('plan', subscription.plan)
    .single()
  
  if (error) {
    console.error('Error subscription limits:', error)
    return 0 
  }
 
  return data.reptile_limit 
}

export async function getReptileCount(org_id : string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('reptiles')
    .select('*', { count: 'exact', head: true }) 
    .eq('org_id', org_id)

  if (error) throw error
  return count ?? 0
}