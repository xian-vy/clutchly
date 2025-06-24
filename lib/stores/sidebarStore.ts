import { create } from 'zustand';

interface SidebarState {
  mobileSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  mobileSidebarOpen: false,
  openSidebar: () => set({ mobileSidebarOpen: true }),
  closeSidebar: () => set({ mobileSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
})); 