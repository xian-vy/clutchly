export type SubscriptionPlan = 'Free' | 'Starter' | 'Pro';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export interface Subscription {
  id: string;
  org_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithProfile extends Subscription {
  organization: {
    full_name: string | null;
    email: string;
  };
} 