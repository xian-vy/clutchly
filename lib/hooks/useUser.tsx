import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getUsers } from '@/app/api/users/users';
import { useMemo } from 'react';

export const useUser = () => {
  const supabase = createClient();

  // Get the current session
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        throw error;
      }
      return session;
    },
    staleTime: 0, // Always fetch fresh session data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
  });

  // Get all users and find the current user
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const data = await getUsers();
        console.log('Users query successful:', { count: data?.length });
        return data;
      } catch (error) {
        console.error('Users query error:', error);
        throw error;
      }
    },
    enabled: !!session?.user?.id, // Only fetch users if we have a valid session with user ID
    staleTime: 0, // Always fetch fresh user data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Log any errors
  if (sessionError) {
    console.error('Session query error:', sessionError);
  }
  if (usersError) {
    console.error('Users query error:', usersError);
  }

  const user = useMemo(() => {
    if (!session?.user?.id || !users) {
      console.log('User lookup failed:', { 
        hasSession: !!session, 
        hasUserId: !!session?.user?.id, 
        hasUsers: !!users 
      });
      return null;
    }
    const foundUser = users.find(u => u.id === session.user.id);
    console.log('User lookup:', { 
      sessionUserId: session.user.id, 
      foundUser,
      usersCount: users.length,
      allUserIds: users.map(u => u.id)
    });
    return foundUser || null;
  }, [session?.user?.id, users]);


  return {
    user,
    isLoading: sessionLoading || usersLoading,
    error: sessionError || usersError
  };
}; 