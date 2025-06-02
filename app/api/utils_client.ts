import { createClient } from '@/lib/supabase/client'
import { Organization } from '@/lib/types/organizations'
import { User } from '@/lib/types/users'
import { Subscription } from '@/lib/types/subscription'

type UserOrg = {
  user : User,
  organization: Organization
}
export async function getUserAndOrganizationInfo () : Promise<UserOrg> {
  const supabase =  createClient()
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

export async function getSubscriptionClient() {
  const supabase =  createClient()
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) throw new Error('Not authenticated')
  
  try {
   
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        organizations!inner (
          id,
          full_name,
          created_at
        )
      `)
      .eq('org_id', organization.id)
      .single()

    if (error) {
      console.error('Error getting subscription:', error)
      throw error
    }

    return subscription as Subscription
  } catch (err) {
    console.error('Error in getSubscription:', err)
    throw err
  }
}

export async function getSubscriptionLimitClient() {
  const supabase =  createClient()
  const subscription = await getSubscriptionClient();
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
 
  return data.reptile_limit || 0
}
