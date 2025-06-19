import { useCallback, useMemo } from 'react';
import { AccessProfileWithControls } from '@/lib/types/access';
import { User } from '@/lib/types/users';
import { NavItem } from '@/lib/constants/navigation';
import { getAccessProfiles, getPages } from '@/app/api/users/access';
import { useQuery } from '@tanstack/react-query';

interface UseAccessControlReturn {
  hasAccess: (pageId: string | undefined, permission: 'view' | 'edit' | 'delete') => boolean;
  filterNavItems: (items: NavItem[]) => NavItem[];
  accessProfile: AccessProfileWithControls | null;
  isLoading: boolean;
}

const useAccessControl = (user: User | undefined): UseAccessControlReturn => {
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

  // Find the user's access profile
  const accessProfile = useMemo(() => {
    if (!user || !accessProfiles) return null;
    return accessProfiles.find(profile => profile.id === user.access_profile_id) || null;
  }, [user, accessProfiles]);

  // Check if user has specific permission for a page
  const hasAccess = useCallback((pageId: string | undefined, permission: 'view' | 'edit' | 'delete'): boolean => {
    if (!pageId) return false;
    // Always allow access to Overview page
    const page = pages.find(p => p.id === pageId);
    if (page?.name.toLowerCase() === 'overview') return true;

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
  }, [user, accessProfile, pages]);

  // Filter navigation items based on access
  const filterNavItems = useCallback((items: NavItem[]): NavItem[] => {
    // If still loading, show nothing
    if (profilesLoading || pagesLoading) return [];

    //  organization owners see all items
    if (user && user.id === user.org_id) {
      return items;
    }

    // If no user, show nothing
    if (!user) return [];

    return items.filter(item => {
      // Always show Overview page
      if (item.name.toLowerCase() === 'overview') return true;
      // Show settings to admin
      if (item.name.toLowerCase() === 'settings' && user.role === 'admin') return true;
      // Special case: Only org owners can see Users page
      if (item.name.toLowerCase() === 'users') return user && user.id === user.org_id;

      // Find the page corresponding to the current navigation item
      const itemPage = pages.find(p => 
        p.name.toLowerCase() === item.name?.toLowerCase() && 
        p.section.toLowerCase() === (item.section || '').toLowerCase()
      );

      // For items with sub-items (like Reptiles, Finance)
      if (item.items) {
        // Recursively filter sub-items
        const filteredItems = filterNavItems(item.items);

        // Only include parent item if:
        // 1. It has a corresponding page entry AND the user has view access to it
        // 2. It has accessible children
        return (itemPage && hasAccess(itemPage.id, 'view')) || filteredItems.length > 0;
      }

      // For regular items, check direct access
      if (!itemPage) return false;

      const accessControl = accessProfile?.access_controls.find(ac => ac.page_id === itemPage.id);
      return accessControl?.can_view || false;
    });
  }, [pages, accessProfile, profilesLoading, pagesLoading, user, hasAccess]);

  return {
    hasAccess,
    filterNavItems,
    accessProfile,
    isLoading: profilesLoading || pagesLoading,
  };
};

export default useAccessControl;
