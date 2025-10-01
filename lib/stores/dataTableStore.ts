import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DataTableState {
  pageSize: number;
  setPageSize: (size: number) => void;
  resetPageSize: () => void;
}

const defaultPageSize = 10;

export const useDataTableStore = create<DataTableState>()(
  persist(
    (set) => ({
      pageSize: defaultPageSize,
      setPageSize: (size) => {
        console.log('DataTableStore: Setting page size to', size);
        set({ pageSize: size });
      },
      resetPageSize: () => set({ pageSize: defaultPageSize }),
    }),
    {
      name: 'datatable-storage',
      partialize: (state) => ({ pageSize: state.pageSize }),
    }
  )
);
