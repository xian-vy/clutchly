import { create } from 'zustand';
import { getUserAndOrganizationInfo } from '@/app/api/utils_client';
import { User } from '@/lib/types/users';
import { Organization } from '@/lib/types/organizations';
import { logout } from '@/app/auth/logout/actions';
import { toast } from 'sonner';

interface AuthState {
  user: User | undefined;
  organization: Organization | undefined;
  isLoggingOut: boolean;
  isLoading: boolean;
  error: string | null;
  fetchUserAndOrg: () => Promise<void>;
  setUser: (user: User | undefined) => void;
  setOrganization: (organization: Organization | undefined) => void;
  setIsLoggingOut: (isLoggingOut: boolean) => void;
  clearAuth: () => void;
  resetLoadingStates: () => void;
  logoutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: undefined,
  organization: undefined,
  isLoggingOut: false,
  isLoading: false,
  error: null,
  
  fetchUserAndOrg: async () => {
    // Don't fetch if we're logging out
    if (get().isLoggingOut) return;
    
    set({ isLoading: true, error: null });
    try {
      const { user, organization } = await getUserAndOrganizationInfo();
      // Only update state if we're not logging out
      if (!get().isLoggingOut) {
        set({ user, organization, isLoading: false });
      }
    } catch (error) {
      // Only update error state if we're not logging out
      if (!get().isLoggingOut) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch user and organization',
          isLoading: false 
        });
      }
    }
  },
  
  setUser: (user) => set({ user }),
  
  setOrganization: (organization) => set({ organization }),
  
  setIsLoggingOut: (isLoggingOut) => {
    set({ isLoggingOut });
    // If logging out, clear loading states to prevent race conditions
    if (isLoggingOut) {
      set({ isLoading: false, error: null });
    }
  },
  
  clearAuth: () => set({ 
    user: undefined, 
    organization: undefined, 
    error: null,
    isLoading: false,
    isLoggingOut: false
  }),

  resetLoadingStates: () => set({
    isLoading: false,
    isLoggingOut: false,
    error: null
  }),

  logoutUser: async () => {
    set({ isLoggingOut: true });
    const toastId = toast.loading("Logging Out...");
    try {
      localStorage.removeItem('feeders-storage');
      localStorage.removeItem('morphs-storage');
      localStorage.removeItem('species-storage');
      await logout();
      get().clearAuth();
      toast.dismiss(toastId);
      window.location.reload();
    } catch (error) {
      set({ isLoggingOut: false });
      set({ error: error instanceof Error ? error.message : 'Logout failed' });
      toast.error("Logout failed", { id: toastId });
    }
  },
})); 