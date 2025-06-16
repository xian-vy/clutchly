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
    if (!userLoading && !accessLoading && !pagesLoading && !hasAccess(pageId, 'view')) {
      router.push('/'); // Redirect to home page if no access
    }
  }, [userLoading, accessLoading, hasAccess, pagesLoading, router, pageId]);

  if (userLoading || accessLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!pageId) return null;
  if (!hasAccess(pageId, 'view')) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
} 