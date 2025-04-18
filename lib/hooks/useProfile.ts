'use client';

import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types/profile';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useProfile = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user ID when component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch profile data with react-query
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If no profile exists, create a minimal profile
        if (error.code === 'PGRST116') { // Record not found
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const newProfile: Partial<Profile> = {
              id: user.id,
              email: user.email || '',
              is_active: true
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (createError) throw createError;
            return createdProfile as Profile;
          }
        }
        
        throw error;
      }
      
      return data as Profile;
    },
    refetchOnWindowFocus: false,
    enabled: !!userId,
    staleTime: 300000, // 5 minutes
    retry: 2
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      if (!userId) throw new Error('User not authenticated');
      
      // If we don't have a profile yet, create one
      if (!profile) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not found');
        
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: updatedProfile.full_name,
          account_type: updatedProfile.account_type,
          collection_size: updatedProfile.collection_size,
          is_active: true
        };
        
        const { data, error } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
          
        if (error) throw error;
        return data as Profile;
      }
      
      // Otherwise update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', userId], data);
    }
  });

  // Check if profile is complete (has name and account type)
  const isProfileComplete = !!profile?.full_name && !!profile?.account_type;

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    isProfileComplete,
    refetch
  };
}; 