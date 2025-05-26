import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getUsers } from '@/app/api/users/users';
import { useMemo } from 'react';

export const useUser = () => {
  const supabase = createClient();

  // Get the current session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Get all users and find the current user
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: !!session, // Only fetch users if we have a session
  });

  const user = useMemo(() => {
    if (!session?.user || !users) return null;
    return users.find(u => u.id === session.user.id) || null;
  }, [session?.user, users]);

  return {
    user,
    isLoading: sessionLoading || usersLoading,
  };
}; 