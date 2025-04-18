'use client';

import { useEffect, useState } from 'react';
import { Subscription } from '@/lib/types/subscription';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useSubscription = () => {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user ID when component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch subscription data with react-query
  const {
    data: subscription,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', userId)
        .single();

      if (error) throw error;
      return data as Subscription;
    },
    enabled: !!userId
  });

  // Calculate subscription status
  const isPremium = subscription?.plan === 'Starter' || subscription?.plan === 'Pro';
  
  // Check if subscription is in trial period
  const isTrialing = subscription?.status === 'trialing';
  
  // Calculate days left in trial
  const trialDaysLeft = subscription?.trial_end
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Format trial end date
  const trialEndDate = subscription?.trial_end
    ? new Date(subscription.trial_end).toLocaleDateString()
    : null;

  return {
    subscription,
    isLoading,
    error,
    isPremium,
    isTrialing,
    trialDaysLeft,
    trialEndDate,
    refetch
  };
}; 