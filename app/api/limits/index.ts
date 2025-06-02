'use server'
import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '../subscriptions/subscriptions';

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
  