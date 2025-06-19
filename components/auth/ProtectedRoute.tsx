'use client';

import useAccessControl from '@/lib/hooks/useAccessControl';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/app/api/organizations/organizations';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getPages } from '@/app/api/users/access';

interface ProtectedRouteProps {
  children: React.ReactNode;
  pageName: string;
}

export default function ProtectedRoute({ children, pageName }: ProtectedRouteProps) {
  const router = useRouter();
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user2'],
    queryFn: getCurrentUser,
    staleTime: 60 * 60 * 1000, 
  });

  
  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: getPages,
    enabled: !!user,
    staleTime: 60 * 60 * 1000,
  });

  const { hasAccess, isLoading: accessLoading } = useAccessControl(user);
  const pageId = pages.find(p => p.name.toLowerCase() === pageName.toLowerCase())?.id ;

  useEffect(() => {
    // Special case: Only org owners can access Users page
    if (pageName.toLowerCase() === 'users') {
      if (!userLoading && !pagesLoading && user && !(user.id === user.org_id)) {
        router.push('/');
      }
      return;
    }
    if (!userLoading && !accessLoading && !pagesLoading && !hasAccess(pageId, 'view')) {
      router.push('/'); // Redirect to home page if no access
    }
  }, [userLoading, accessLoading, hasAccess, pagesLoading, router, pageId, user, pageName]);

  if (userLoading || accessLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }
  // Special case: Only org owners can access Users page
  if (pageName.toLowerCase() === 'users' && user && !(user.id === user.org_id)) {
    return null;
  }
  if (!pageId && pageName.toLowerCase() !== 'users') return null;
  if (!hasAccess(pageId, 'view') && pageName.toLowerCase() !== 'users') {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
} 