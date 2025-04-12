import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Species, NewSpecies } from '@/lib/types/species';
import { getSpecies, createSpecies, updateSpecies, deleteSpecies, getGlobalSpecies } from '@/app/api/reptiles/species';

interface SpeciesState {
  species: Species[];
  isLoading: boolean;
  error: Error | null;
  fetchSpecies: () => Promise<void>;
  downloadCommonSpecies: (selectedIds?: string[]) => Promise<void>;
  addSpecies: (species: NewSpecies) => Promise<Species | null>;
  updateSpecies: (id: string, updates: Partial<NewSpecies>) => Promise<Species | null>;
  deleteSpecies: (id: string) => Promise<boolean>;
  getSpeciesById: (id: string) => Species | undefined;
  getSpeciesByName: (name: string) => Species | undefined;
}

export const useSpeciesStore = create<SpeciesState>()(
  persist(
    (set, get) => ({
      species: [],
      isLoading: false,
      error: null,

      fetchSpecies: async () => {
        try {
          set({ isLoading: true, error: null });
          const speciesData = await getSpecies();
          set({ species: speciesData, isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to fetch species'),
            isLoading: false 
          });
        }
      },

      downloadCommonSpecies: async (selectedIds?: string[]) => {
        try {
          set({ isLoading: true, error: null });
          const commonSpecies = await getGlobalSpecies();
          
          // Filter species if IDs are provided
          const speciesToDownload = selectedIds 
            ? commonSpecies.filter(s => selectedIds.includes(s.id.toString()))
            : commonSpecies;
          
          // Merge with existing species, avoiding duplicates by name
          const existingSpecies = get().species;
          const existingNames = new Set(existingSpecies.map(s => s.name.toLowerCase()));
          
          const newSpecies = speciesToDownload.filter(s => !existingNames.has(s.name.toLowerCase()));
          
          set({ 
            species: [...existingSpecies, ...newSpecies],
            isLoading: false 
          });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to download common species'),
            isLoading: false 
          });
        }
      },

      addSpecies: async (speciesData: NewSpecies) => {
        try {
          set({ isLoading: true, error: null });
          const newSpecies = await createSpecies(speciesData);
          set(state => ({ 
            species: [...state.species, newSpecies],
            isLoading: false 
          }));
          return newSpecies;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to add species'),
            isLoading: false 
          });
          return null;
        }
      },

      updateSpecies: async (id: string, updates: Partial<NewSpecies>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedSpecies = await updateSpecies(id, updates);
          set(state => ({ 
            species: state.species.map(s => s.id.toString() === id ? updatedSpecies : s),
            isLoading: false 
          }));
          return updatedSpecies;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to update species'),
            isLoading: false 
          });
          return null;
        }
      },

      deleteSpecies: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await deleteSpecies(id);
          set(state => ({ 
            species: state.species.filter(s => s.id.toString() !== id),
            isLoading: false 
          }));
          return true;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to delete species'),
            isLoading: false 
          });
          return false;
        }
      },

      getSpeciesById: (id: string) => {
        return get().species.find(s => s.id.toString() === id);
      },

      getSpeciesByName: (name: string) => {
        return get().species.find(s => s.name.toLowerCase() === name.toLowerCase());
      }
    }),
    {
      name: 'species-storage',
    }
  )
); 