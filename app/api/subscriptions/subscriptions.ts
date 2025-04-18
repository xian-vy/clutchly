'use server'

import { createClient } from '@/lib/supabase/server'
import { Subscription, SubscriptionPlan } from '@/lib/types/subscription'

export async function getSubscription() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  // If subscription doesn't exist, create a free one
  if (error && error.code === 'PGRST116') {
    return createSubscription('Free')
  }

  if (error) throw error
  return subscription as Subscription
}

export async function createSubscription(plan: SubscriptionPlan) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Calculate trial end date (14 days from now)
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)
  
  const newSubscription = {
    profile_id: user.id,
    plan: plan,
    status: plan === 'Free' ? 'active' : 'trialing',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    current_period_end: null,
    trial_end: plan === 'Free' ? null : trialEnd.toISOString()
  }
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([newSubscription])
    .select()
    .single()

  if (error) {
    console.error("Error creating subscription:", error.message)
    throw error
  }
  
  return data as Subscription
}

export async function updateSubscription(plan: SubscriptionPlan, stripeData?: { 
  customer_id: string, 
  subscription_id: string,
  current_period_end: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const updates: Partial<Subscription> = {
    plan,
    status: 'active',
    updated_at: new Date().toISOString()
  }
  
  if (stripeData) {
    updates.stripe_customer_id = stripeData.customer_id
    updates.stripe_subscription_id = stripeData.subscription_id
    updates.current_period_end = stripeData.current_period_end
    updates.trial_end = null // End trial when upgrading with payment
  }
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('profile_id', user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating subscription:", error.message)
    throw error
  }
  
  return data as Subscription
}

export async function cancelSubscription() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('profile_id', user.id)
    .select()
    .single()

  if (error) {
    console.error("Error canceling subscription:", error.message)
    throw error
  }
  
  return data as Subscription
}

export async function getSubscriptionPlans() {
  return [
    {
      id: 'free',
      name: 'Free',
      description: 'Basic reptile management for hobbyists',
      price: 0,
      features: [
        'Manage up to 5 reptiles',
        'Basic health tracking',
        'Photo documentation',
        'Mobile access'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Enhanced tracking for serious keepers',
      price: 9.99,
      features: [
        'Manage up to 25 reptiles',
        'Advanced health tracking',
        'Breeding records',
        'Growth analytics',
        'Unlimited photos',
        'Premium support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Complete solution for breeders & facilities',
      price: 19.99,
      features: [
        'Unlimited reptiles',
        'Complete genetic tracking',
        'Advanced breeding projects',
        'Full analytics dashboard',
        'Facility management',
        'API access',
        'Priority support'
      ]
    }
  ]
} 