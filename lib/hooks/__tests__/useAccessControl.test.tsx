import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import useAccessControl from '../useAccessControl';
import { User } from '@/lib/types/users';
import { AccessProfileWithControls } from '@/lib/types/access';
import { Page } from '@/lib/types/pages';
import { NavItem } from '@/lib/constants/navigation';
import { CACHE_KEYS } from '@/lib/constants/cache_keys';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
// Mock the dependencies
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

jest.mock('../../stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/app/api/users/access', () => ({
  getAccessProfiles: jest.fn(),
  getPages: jest.fn(),
}));


const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;


// Test data
const mockUser: User = {
  id: 'user-1',
  org_id: 'org-1',
  access_profile_id: 'profile-1',
  full_name: 'Test User',
  role: 'staff',
  status: 'active',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
};

const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-1',
  role: 'admin',
};

const mockOwnerUser: User = {
  ...mockUser,
  id: 'org-1', // Same as org_id
  role: 'owner',
};

const mockPages: Page[] = [
  { id: 'page-1', name: 'Reptiles', section: 'Main' },
  { id: 'page-2', name: 'Health', section: 'Health & Growth' },
  { id: 'page-3', name: 'Overview', section: 'Main' },
  { id: 'page-4', name: 'Sales', section: 'Finance' },
];

const mockAccessControls = [
  {
    id: 'control-1',
    access_profile_id: 'profile-1',
    page_id: 'page-1',
    can_view: true,
    can_edit: true,
    can_delete: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'control-2',
    access_profile_id: 'profile-1',
    page_id: 'page-2',
    can_view: true,
    can_edit: false,
    can_delete: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const mockAccessProfile: AccessProfileWithControls = {
  id: 'profile-1',
  org_id: 'org-1',
  name: 'Test Profile',
  description: 'Test description',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  access_controls: mockAccessControls,
};

const mockNavItems: NavItem[] = [
  {
    name: 'Overview',
    href: '/overview',
    icon: jest.fn(),
  },
  {
    name: 'Reptiles',
    href: '/reptiles',
    icon: jest.fn(),
    section: 'Main',
  },
  {
    name: 'Health',
    href: '/health',
    icon: jest.fn(),
    section: 'Health & Growth',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: jest.fn(),
    section: 'System',
  },
  {
    name: 'Users',
    href: '/users',
    icon: jest.fn(),
    section: 'Main',
  },
];

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAccessControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuthStore.mockReturnValue({
      organization: { id: 'org-1', name: 'Test Org' },
    } as any);

    mockUseQuery.mockImplementation(({ queryKey, queryFn }) => {
      if (queryKey[0] === CACHE_KEYS.ACCESS_PROFILES) {
        return {
          data: [mockAccessProfile],
          isLoading: false,
          error: null,
        } as any;
      }
      if (queryKey[0] === CACHE_KEYS.PAGES) {
        return {
          data: mockPages,
          isLoading: false,
          error: null,
        } as any;
      }
      return { data: null, isLoading: false, error: null } as any;
    });
  });

  describe('hasAccess', () => {
    it('should return false for undefined pageId', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess(undefined, 'view')).toBe(false);
    });

    it('should always allow access to Overview page', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess('page-3', 'view')).toBe(true);
      expect(result.current.hasAccess('page-3', 'edit')).toBe(true);
      expect(result.current.hasAccess('page-3', 'delete')).toBe(true);
    });

    it('should return false for no user', () => {
      const { result } = renderHook(() => useAccessControl(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess('page-1', 'view')).toBe(false);
    });

    it('should return true for admin users', () => {
      const { result } = renderHook(() => useAccessControl(mockAdminUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess('page-1', 'view')).toBe(true);
      expect(result.current.hasAccess('page-1', 'edit')).toBe(true);
      expect(result.current.hasAccess('page-1', 'delete')).toBe(true);
    });

    it('should return true for organization owners', () => {
      const { result } = renderHook(() => useAccessControl(mockOwnerUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess('page-1', 'view')).toBe(true);
      expect(result.current.hasAccess('page-1', 'edit')).toBe(true);
      expect(result.current.hasAccess('page-1', 'delete')).toBe(true);
    });

    it('should return false for settings page (special case)', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess('settings', 'view')).toBe(false);
    });

    it('should return false when no access profile', () => {
      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === CACHE_KEYS.ACCESS_PROFILES) {
          return { data: [], isLoading: false, error: null } as any;
        }
        if (queryKey[0] === CACHE_KEYS.PAGES) {
          return { data: mockPages, isLoading: false, error: null } as any;
        }
        return { data: null, isLoading: false, error: null } as any;
      });

      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess('page-1', 'view')).toBe(false);
    });

    it('should check access controls for regular users', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      // page-1 has can_view: true, can_edit: true, can_delete: false
      expect(result.current.hasAccess('page-1', 'view')).toBe(true);
      expect(result.current.hasAccess('page-1', 'edit')).toBe(true);
      expect(result.current.hasAccess('page-1', 'delete')).toBe(false);

      // page-2 has can_view: true, can_edit: false, can_delete: false
      expect(result.current.hasAccess('page-2', 'view')).toBe(true);
      expect(result.current.hasAccess('page-2', 'edit')).toBe(false);
      expect(result.current.hasAccess('page-2', 'delete')).toBe(false);
    });

    it('should return false for pages not in access controls', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess('page-4', 'view')).toBe(false);
    });
  });

  describe('filterNavItems', () => {
    it('should return empty array when loading', () => {
      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === CACHE_KEYS.ACCESS_PROFILES) {
          return { data: null, isLoading: true, error: null } as any;
        }
        if (queryKey[0] === CACHE_KEYS.PAGES) {
          return { data: mockPages, isLoading: false, error: null } as any;
        }
        return { data: null, isLoading: false, error: null } as any;
      });

      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.filterNavItems(mockNavItems)).toEqual([]);
    });

    it('should return all items for organization owners', () => {
      const { result } = renderHook(() => useAccessControl(mockOwnerUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.filterNavItems(mockNavItems)).toEqual(mockNavItems);
    });

    it('should return empty array for no user', () => {
      const { result } = renderHook(() => useAccessControl(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.filterNavItems(mockNavItems)).toEqual([]);
    });

    it('should always show Overview page', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      const filtered = result.current.filterNavItems(mockNavItems);
      const overviewItem = filtered.find(item => item.name.toLowerCase() === 'overview');
      expect(overviewItem).toBeDefined();
    });

    it('should show Settings only to admin or org owner', () => {
      // Test with regular user
      const { result: regularResult } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });
      const regularFiltered = regularResult.current.filterNavItems(mockNavItems);
      const settingsRegular = regularFiltered.find(item => item.name.toLowerCase() === 'settings');
      expect(settingsRegular).toBeUndefined();

      // Test with admin user
      const { result: adminResult } = renderHook(() => useAccessControl(mockAdminUser), {
        wrapper: createWrapper(),
      });
      const adminFiltered = adminResult.current.filterNavItems(mockNavItems);
      const settingsAdmin = adminFiltered.find(item => item.name.toLowerCase() === 'settings');
      expect(settingsAdmin).toBeDefined();

      // Test with owner user
      const { result: ownerResult } = renderHook(() => useAccessControl(mockOwnerUser), {
        wrapper: createWrapper(),
      });
      const ownerFiltered = ownerResult.current.filterNavItems(mockNavItems);
      const settingsOwner = ownerFiltered.find(item => item.name.toLowerCase() === 'settings');
      expect(settingsOwner).toBeDefined();
    });

    it('should show Users only to org owner', () => {
      // Test with regular user
      const { result: regularResult } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });
      const regularFiltered = regularResult.current.filterNavItems(mockNavItems);
      const usersRegular = regularFiltered.find(item => item.name.toLowerCase() === 'users');
      expect(usersRegular).toBeUndefined();

      // Test with admin user
      const { result: adminResult } = renderHook(() => useAccessControl(mockAdminUser), {
        wrapper: createWrapper(),
      });
      const adminFiltered = adminResult.current.filterNavItems(mockNavItems);
      const usersAdmin = adminFiltered.find(item => item.name.toLowerCase() === 'users');
      expect(usersAdmin).toBeUndefined();

      // Test with owner user
      const { result: ownerResult } = renderHook(() => useAccessControl(mockOwnerUser), {
        wrapper: createWrapper(),
      });
      const ownerFiltered = ownerResult.current.filterNavItems(mockNavItems);
      const usersOwner = ownerFiltered.find(item => item.name.toLowerCase() === 'users');
      expect(usersOwner).toBeDefined();
    });

    it('should filter items based on access controls', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      const filtered = result.current.filterNavItems(mockNavItems);
      
      // Should include Overview (always allowed)
      expect(filtered.find(item => item.name.toLowerCase() === 'overview')).toBeDefined();
      
      // Should include Reptiles (has view access)
      expect(filtered.find(item => item.name.toLowerCase() === 'reptiles')).toBeDefined();
      
      // Should include Health (has view access)
      expect(filtered.find(item => item.name.toLowerCase() === 'health')).toBeDefined();
      
      // Should not include Settings (special case, denied for regular users)
      expect(filtered.find(item => item.name.toLowerCase() === 'settings')).toBeUndefined();
      
      // Should not include Users (only for org owners)
      expect(filtered.find(item => item.name.toLowerCase() === 'users')).toBeUndefined();
    });

    it('should handle items without corresponding pages', () => {
      const navItemsWithUnknown: NavItem[] = [
        ...mockNavItems,
        {
          name: 'Unknown Page',
          href: '/unknown',
          icon: jest.fn(),
          section: 'Unknown',
        },
      ];

      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      const filtered = result.current.filterNavItems(navItemsWithUnknown);
      const unknownItem = filtered.find(item => item.name === 'Unknown Page');
      expect(unknownItem).toBeUndefined();
    });
  });

  describe('accessProfile', () => {
    it('should return null when no user', () => {
      const { result } = renderHook(() => useAccessControl(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.accessProfile).toBeNull();
    });

    it('should return null when no access profiles', () => {
      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === CACHE_KEYS.ACCESS_PROFILES) {
          return { data: [], isLoading: false, error: null } as any;
        }
        if (queryKey[0] === CACHE_KEYS.PAGES) {
          return { data: mockPages, isLoading: false, error: null } as any;
        }
        return { data: null, isLoading: false, error: null } as any;
      });

      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.accessProfile).toBeNull();
    });

    it('should return the correct access profile for user', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.accessProfile).toEqual(mockAccessProfile);
    });

    it('should return null when user access profile not found', () => {
      const userWithUnknownProfile: User = {
        ...mockUser,
        access_profile_id: 'unknown-profile',
      };

      const { result } = renderHook(() => useAccessControl(userWithUnknownProfile), {
        wrapper: createWrapper(),
      });

      expect(result.current.accessProfile).toBeNull();
    });
  });

  describe('isLoading', () => {
    it('should return true when profiles are loading', () => {
      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === CACHE_KEYS.ACCESS_PROFILES) {
          return { data: null, isLoading: true, error: null } as any;
        }
        if (queryKey[0] === CACHE_KEYS.PAGES) {
          return { data: mockPages, isLoading: false, error: null } as any;
        }
        return { data: null, isLoading: false, error: null } as any;
      });

      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return true when pages are loading', () => {
      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === CACHE_KEYS.ACCESS_PROFILES) {
          return { data: [mockAccessProfile], isLoading: false, error: null } as any;
        }
        if (queryKey[0] === CACHE_KEYS.PAGES) {
          return { data: null, isLoading: true, error: null } as any;
        }
        return { data: null, isLoading: false, error: null } as any;
      });

      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return false when both queries are loaded', () => {
      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle case-insensitive page name matching', () => {
      const pagesWithDifferentCase: Page[] = [
        { id: 'page-1', name: 'REPTILES', section: 'Main' },
        { id: 'page-2', name: 'health', section: 'Health & Growth' },
      ];

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === CACHE_KEYS.ACCESS_PROFILES) {
          return { data: [mockAccessProfile], isLoading: false, error: null } as any;
        }
        if (queryKey[0] === CACHE_KEYS.PAGES) {
          return { data: pagesWithDifferentCase, isLoading: false, error: null } as any;
        }
        return { data: null, isLoading: false, error: null } as any;
      });

      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      // Should still work with case-insensitive matching
      expect(result.current.hasAccess('page-1', 'view')).toBe(true);
    });

    it('should handle empty access controls array', () => {
      const emptyAccessProfile: AccessProfileWithControls = {
        ...mockAccessProfile,
        access_controls: [],
      };

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === CACHE_KEYS.ACCESS_PROFILES) {
          return { data: [emptyAccessProfile], isLoading: false, error: null } as any;
        }
        if (queryKey[0] === CACHE_KEYS.PAGES) {
          return { data: mockPages, isLoading: false, error: null } as any;
        }
        return { data: null, isLoading: false, error: null } as any;
      });

      const { result } = renderHook(() => useAccessControl(mockUser), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasAccess('page-1', 'view')).toBe(false);
    });
  });
});
