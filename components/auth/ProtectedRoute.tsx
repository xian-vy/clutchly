'use client';

import useAccessControl from '@/lib/hooks/useAccessControl';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getPages } from '@/app/api/users/access';
import { useAuthStore } from '@/lib/stores/authStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  pageName: string;
}

export default function ProtectedRoute({ children, pageName }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuthStore();
  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: getPages,
    staleTime: 60 * 60 * 1000,
  });
  const { hasAccess, isLoading: accessLoading } = useAccessControl(user);

  const pageId = pages.find(p => p.name.toLowerCase() === pageName.toLowerCase())?.id;

  // Compute access
  const isUsersPage = pageName.toLowerCase() === 'users';
  const canAccess =
    isUsersPage
      ? user && user.id === user.org_id
      : pageId && hasAccess(pageId, 'view');


  useEffect(() => {
    if (!userLoading && !accessLoading && !pagesLoading ) {

      if (!canAccess) {
         router.replace('/overview');
      }
    }
  }, [canAccess, userLoading, accessLoading, pagesLoading, router]);

  // Show loader while loading
  if (userLoading || accessLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Checking access...</span>
      </div>
    );
  }

  // Don't render children if not allowed (prevents flash)
  if (!canAccess && !userLoading && !accessLoading && !pagesLoading) {
    return null;
  }

  return <>{children}</>;
} 