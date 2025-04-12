import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GrowthEntry } from '@/lib/types/growth';
import { getGrowthEntries } from '@/app/api/growth/entries';

interface GrowthState {
  entries: GrowthEntry[];
  isLoading: boolean;
  error: Error | null;
  fetchEntries: () => Promise<void>;
  getEntriesByReptile: (reptileId: string) => GrowthEntry[];
}

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,

      fetchEntries: async () => {
        try {
          set({ isLoading: true, error: null });
          const entriesData = await getGrowthEntries();
          set({ 
            entries: entriesData,
            isLoading: false 
          });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to fetch growth entries'),
            isLoading: false 
          });
        }
      },

      getEntriesByReptile: (reptileId: string) => {
        const { entries } = get();
        return entries.filter(entry => entry.reptile_id === reptileId);
      },
    }),
    {
      name: 'growth-storage',
    }
  )
); 