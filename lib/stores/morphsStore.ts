import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Morph, NewMorph } from '@/lib/types/morph';
import { getMorphs, createMorph, updateMorph, deleteMorph, getGlobalMorphs } from '@/app/api/reptiles/morphs';
import { useSpeciesStore } from './speciesStore';

interface MorphsState {
  morphs: (Morph & { species: { name: string } })[];
  isLoading: boolean;
  error: Error | null;
  fetchMorphs: () => Promise<void>;
  downloadCommonMorphs: (selectedSpeciesIds?: string[]) => Promise<void>;
  addMorph: (morph: NewMorph) => Promise<(Morph & { species: { name: string } }) | null>;
  updateMorph: (id: string, updates: Partial<NewMorph>) => Promise<(Morph & { species: { name: string } }) | null>;
  deleteMorph: (id: string) => Promise<boolean>;
  getMorphById: (id: string) => (Morph & { species: { name: string } }) | undefined;
  getMorphsBySpecies: (speciesId: string) => (Morph & { species: { name: string } })[];
}

export const useMorphsStore = create<MorphsState>()(
  persist(
    (set, get) => ({
      morphs: [],
      isLoading: false,
      error: null,

      fetchMorphs: async () => {
        try {
          set({ isLoading: true, error: null });
          const morphsData = await getMorphs();
          set({ morphs: morphsData, isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to fetch morphs'),
            isLoading: false 
          });
        }
      },

      downloadCommonMorphs: async (selectedSpeciesIds?: string[]) => {
        try {
          set({ isLoading: true, error: null });
          
          // Get species from the species store to reference in morphs
          const speciesStore = useSpeciesStore.getState();
          const species = speciesStore.species;
          
          if (species.length === 0) {
            // If no species are available, download common species first
            await speciesStore.downloadCommonSpecies();
          }

          const commonMorphs = await getGlobalMorphs();
          
          // Filter morphs by selected species if provided
          const morphsToDownload = selectedSpeciesIds
            ? commonMorphs.filter(m => selectedSpeciesIds.includes(m.species_id.toString()))
            : commonMorphs;
          
          // Merge with existing morphs, avoiding duplicates by name and species
          const existingMorphs = get().morphs;
          const existingMorphKeys = new Set(
            existingMorphs.map(m => `${m.name.toLowerCase()}-${m.species.name.toLowerCase()}`)
          );
          
          const newMorphs = morphsToDownload.filter(
            m => !existingMorphKeys.has(`${m.name.toLowerCase()}-${m.species.name.toLowerCase()}`)
          );
          
          set({ 
            morphs: [...existingMorphs, ...newMorphs],
            isLoading: false 
          });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to download common morphs'),
            isLoading: false 
          });
        }
      },

      addMorph: async (morphData: NewMorph) => {
        try {
          set({ isLoading: true, error: null });
          const newMorph = await createMorph(morphData);
          set(state => ({ 
            morphs: [...state.morphs, newMorph],
            isLoading: false 
          }));
          return newMorph;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to add morph'),
            isLoading: false 
          });
          return null;
        }
      },

      updateMorph: async (id: string, updates: Partial<NewMorph>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedMorph = await updateMorph(id, updates);
          set(state => ({ 
            morphs: state.morphs.map(m => m.id.toString() === id ? updatedMorph : m),
            isLoading: false 
          }));
          return updatedMorph;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to update morph'),
            isLoading: false 
          });
          return null;
        }
      },

      deleteMorph: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await deleteMorph(id);
          set(state => ({ 
            morphs: state.morphs.filter(m => m.id.toString() !== id),
            isLoading: false 
          }));
          return true;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to delete morph'),
            isLoading: false 
          });
          return false;
        }
      },

      getMorphById: (id: string) => {
        return get().morphs.find(m => m.id.toString() === id);
      },

      getMorphsBySpecies: (speciesId: string) => {
        return get().morphs.filter(m => m.species_id.toString() === speciesId);
      }
    }),
    {
      name: 'morphs-storage',
    }
  )
); 