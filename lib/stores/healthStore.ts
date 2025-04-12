import { create } from 'zustand';
import { 
  getHealthCategories 
} from '@/app/api/health/categories';
import { 
  getHealthSubcategories 
} from '@/app/api/health/subcategories';
import { 
  getHealthTypes 
} from '@/app/api/health/types';
import { 
  HealthLogCategory, 
  HealthLogSubcategory, 
  HealthLogType 
} from '@/lib/types/health';

interface HealthState {
  categories: HealthLogCategory[];
  subcategories: HealthLogSubcategory[];
  types: HealthLogType[];
  isLoading: boolean;
  error: Error | null;
  fetchAllData: () => Promise<void>;
  getSubcategoriesByCategory: (categoryId: string) => HealthLogSubcategory[];
  getTypesBySubcategory: (subcategoryId: string) => HealthLogType[];
}

export const useHealthStore = create<HealthState>((set, get) => ({
  categories: [],
  subcategories: [],
  types: [],
  isLoading: false,
  error: null,

  fetchAllData: async () => {
    try {
      set({ isLoading: true, error: null });
      const [categoriesData, subcategoriesData, typesData] = await Promise.all([
        getHealthCategories(),
        getHealthSubcategories(),
        getHealthTypes()
      ]);
      set({ 
        categories: categoriesData,
        subcategories: subcategoriesData,
        types: typesData,
        isLoading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err : new Error('Failed to fetch health data'),
        isLoading: false 
      });
    }
  },

  getSubcategoriesByCategory: (categoryId: string) => {
    const { subcategories } = get();
    return subcategories.filter(s => s.category_id === categoryId);
  },

  getTypesBySubcategory: (subcategoryId: string) => {
    const { types } = get();
    return types.filter(t => t.subcategory_id === subcategoryId);
  },
})); 