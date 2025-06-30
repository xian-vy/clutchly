import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FeederType, FeederSize, NewFeederType, NewFeederSize } from '@/lib/types/feeders';
import { 
  getFeederTypes, 
  createFeederType, 
  updateFeederType, 
  deleteFeederType
} from '@/app/api/feeders/types';
import { 
    getFeederSizes,
    getFeederSizesByType,
    createFeederSize,
    updateFeederSize,
    deleteFeederSize
  } from '@/app/api/feeders/sizes';
import { Organization } from '../types/organizations';
// Define the combined state for feeder types and sizes
interface FeedersState {
  feederTypes: FeederType[];
  feederSizes: FeederSize[];
  isLoading: boolean;
  error: Error | null;
  
  // Feeder Type operations
  fetchFeederTypes: (organization : Organization) => Promise<void>;
  addFeederType: (feederType: NewFeederType) => Promise<FeederType | null>;
  updateFeederType: (id: string, updates: Partial<NewFeederType>) => Promise<FeederType | null>;
  deleteFeederType: (id: string) => Promise<boolean>;
  getFeederTypeById: (id: string) => FeederType | undefined;
  
  // Feeder Size operations
  fetchFeederSizes: (organization : Organization ) => Promise<void>;
  fetchFeederSizesByType: (feederTypeId: string) => Promise<void>;
  addFeederSize: (feederSize: NewFeederSize) => Promise<FeederSize | null>;
  updateFeederSize: (id: string, updates: Partial<NewFeederSize>) => Promise<FeederSize | null>;
  deleteFeederSize: (id: string) => Promise<boolean>;
  getFeederSizeById: (id: string) => FeederSize | undefined;
  getFeederSizesByType: (feederTypeId: string) => FeederSize[];
  
  // Helper methods
  addFeederTypeToState: (feederType: FeederType) => void;
  addFeederSizeToState: (feederSize: FeederSize) => void;
}

export const useFeedersStore = create<FeedersState>()(
  persist(
    (set, get) => ({
      feederTypes: [],
      feederSizes: [],
      isLoading: false,
      error: null,

      // Feeder Type operations
      fetchFeederTypes: async (organization : Organization) => {
        try {
          set({ isLoading: true, error: null });
          const feederTypesData = await getFeederTypes(organization);
          set({ feederTypes: feederTypesData, isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to fetch feeder types'),
            isLoading: false 
          });
        }
      },

      addFeederType: async (feederTypeData: NewFeederType) => {
        try {
          set({ isLoading: true, error: null });
          const newFeederType = await createFeederType(feederTypeData);
          set(state => ({ 
            feederTypes: [...state.feederTypes, newFeederType],
            isLoading: false 
          }));
          return newFeederType;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to add feeder type'),
            isLoading: false 
          });
          return null;
        }
      },

      updateFeederType: async (id: string, updates: Partial<NewFeederType>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedFeederType = await updateFeederType(id, updates);
          set(state => ({ 
            feederTypes: state.feederTypes.map(ft => ft.id === id ? updatedFeederType : ft),
            isLoading: false 
          }));
          return updatedFeederType;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to update feeder type'),
            isLoading: false 
          });
          return null;
        }
      },

      deleteFeederType: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await deleteFeederType(id);
          set(state => ({ 
            feederTypes: state.feederTypes.filter(ft => ft.id !== id),
            // Also remove associated feeder sizes
            feederSizes: state.feederSizes.filter(fs => fs.feeder_type_id !== id),
            isLoading: false 
          }));
          return true;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to delete feeder type'),
            isLoading: false 
          });
          return false;
        }
      },

      getFeederTypeById: (id: string) => {
        return get().feederTypes.find(ft => ft.id === id);
      },

      // Feeder Size operations
      fetchFeederSizes: async (organization : Organization) => {
        try {
          set({ isLoading: true, error: null });
          const feederSizesData = await getFeederSizes(organization);
          set({ feederSizes: feederSizesData, isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to fetch feeder sizes'),
            isLoading: false 
          });
        }
      },

      fetchFeederSizesByType: async (feederTypeId: string) => {
        try {
          set({ isLoading: true, error: null });
          const feederSizesData = await getFeederSizesByType(feederTypeId);
          
          // Merge with existing feeder sizes, replacing any with the same ID
          const existingFeederSizes = get().feederSizes;
          //const existingIds = new Set(existingFeederSizes.map(fs => fs.id));
          
          const updatedFeederSizes = [
            ...existingFeederSizes.filter(fs => fs.feeder_type_id !== feederTypeId),
            ...feederSizesData
          ];
          
          set({ feederSizes: updatedFeederSizes, isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to fetch feeder sizes by type'),
            isLoading: false 
          });
        }
      },

      addFeederSize: async (feederSizeData: NewFeederSize) => {
        try {
          set({ isLoading: true, error: null });
          const newFeederSize = await createFeederSize(feederSizeData);
          set(state => ({ 
            feederSizes: [...state.feederSizes, newFeederSize],
            isLoading: false 
          }));
          return newFeederSize;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to add feeder size'),
            isLoading: false 
          });
          return null;
        }
      },

      updateFeederSize: async (id: string, updates: Partial<NewFeederSize>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedFeederSize = await updateFeederSize(id, updates);
          set(state => ({ 
            feederSizes: state.feederSizes.map(fs => fs.id === id ? updatedFeederSize : fs),
            isLoading: false 
          }));
          return updatedFeederSize;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to update feeder size'),
            isLoading: false 
          });
          return null;
        }
      },

      deleteFeederSize: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await deleteFeederSize(id);
          set(state => ({ 
            feederSizes: state.feederSizes.filter(fs => fs.id !== id),
            isLoading: false 
          }));
          return true;
        } catch (err) {
          set({ 
            error: err instanceof Error ? err : new Error('Failed to delete feeder size'),
            isLoading: false 
          });
          return false;
        }
      },

      getFeederSizeById: (id: string) => {
        return get().feederSizes.find(fs => fs.id === id);
      },

      getFeederSizesByType: (feederTypeId: string) => {
        return get().feederSizes.filter(fs => fs.feeder_type_id === feederTypeId);
      },

      // Helper methods
      addFeederTypeToState: (feederType: FeederType) => {
        set(state => ({ 
          feederTypes: [...state.feederTypes, feederType]
        }));
      },

      addFeederSizeToState: (feederSize: FeederSize) => {
        set(state => ({ 
          feederSizes: [...state.feederSizes, feederSize]
        }));
      },
    }),
    {
      name: 'feeders-storage',
    }
  )
);