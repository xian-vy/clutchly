import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  mobileSidebarOpen: boolean;
  isCollapsed: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleIsCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      mobileSidebarOpen: false,
      isCollapsed: false,
      openSidebar: () => set({ mobileSidebarOpen: true }),
      closeSidebar: () => set({ mobileSidebarOpen: false }),
      toggleSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
      setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleIsCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ mobileSidebarOpen: state.mobileSidebarOpen, isCollapsed: state.isCollapsed }),
    }
  )
); 