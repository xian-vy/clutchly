import { useCallback, useMemo } from 'react';
import { AccessProfileWithControls } from '@/lib/types/access';
import { User } from '@/lib/types/users';
import { NavItem } from '@/lib/constants/navigation';
import { getAccessProfiles, getPages } from '@/app/api/users/access';
import { useQuery } from '@tanstack/react-query';

interface UseAccessControlReturn {
  hasAccess: (pageId: string, permission: 'view' | 'edit' | 'delete') => boolean;
  filterNavItems: (items: NavItem[]) => NavItem[];
  accessProfile: AccessProfileWithControls | null;
  isLoading: boolean;
}

const useAccessControl = (user: User | null): UseAccessControlReturn => {
  // Fetch access profiles and pages using React Query
  const { data: accessProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['accessProfiles'],
    queryFn: getAccessProfiles,
    enabled: !!user, // Only fetch if we have a user
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: getPages,
    enabled: !!user,
    staleTime: 60 * 60 * 1000,
  });

  // Create a mapping of page names to IDs
  const pageNameToId = useMemo(() => {
    return pages.reduce((acc, page) => {
      acc[page.name.toLowerCase()] = page.id;
      return acc;
    }, {} as Record<string, string>);
  }, [pages]);

  // Find the user's access profile
  const accessProfile = useMemo(() => {
    if (!user || !accessProfiles) return null;
    return accessProfiles.find(profile => profile.id === user.access_profile_id) || null;
  }, [user, accessProfiles]);

  // Check if user has specific permission for a page
  const hasAccess = useCallback((pageId: string, permission: 'view' | 'edit' | 'delete'): boolean => {
    if (!user) return false;
    
    // Admin users have full access
    if (user.role === 'admin') return true;

    // Organization owners (users.id === org_id) have full access
    if (user.id === user.org_id) return true;

    // If no access profile, deny access
    if (!accessProfile) return false;

    const accessControl = accessProfile.access_controls.find(ac => ac.page_id === pageId);
    if (!accessControl) return false;

    switch (permission) {
      case 'view':
        return accessControl.can_view;
      case 'edit':
        return accessControl.can_edit;
      case 'delete':
        return accessControl.can_delete;
      default:
        return false;
    }
  }, [user, accessProfile]);

  // Filter navigation items based on access
  const filterNavItems = useCallback((items: NavItem[]): NavItem[] => {
    // If still loading, show nothing
    if (profilesLoading || pagesLoading) return [];

    // Admin users and organization owners see all items
    if (user?.role === 'admin' || (user && user.id === user.org_id)) {
      return items;
    }

    // If no user, show nothing
    if (!user) return [];

    return items.filter(item => {
      // For items with sub-items, check access for each sub-item
      if (item.items) {
        const filteredItems = filterNavItems(item.items);
        // Only include parent item if it has accessible children
        return filteredItems.length > 0;
      }

      // For regular items, require explicit view access
      const pageId = pageNameToId[item.name?.toLowerCase()];
      // If no name or no matching page found, deny access
      if (!item.name || !pageId) return false;
      
      return hasAccess(pageId, 'view');
    });
  }, [hasAccess, pageNameToId, profilesLoading, pagesLoading, user]);

  return {
    hasAccess,
    filterNavItems,
    accessProfile,
    isLoading: profilesLoading || pagesLoading,
  };
};

export default useAccessControl;
