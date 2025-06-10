'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { GrowthEntry, CreateGrowthEntryInput } from '@/lib/types/growth';
import { 
  getGrowthEntries, 
  createGrowthEntry, 
  updateGrowthEntry, 
  deleteGrowthEntry 
} from '@/app/api/growth/entries';
import { GrowthEntryList } from './GrowthEntryList';
import { GrowthEntryForm } from './GrowthEntryForm';
import { Loader2 } from 'lucide-react';
import {  Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useQuery } from '@tanstack/react-query';
import { GrowthFilters } from './GrowthFilterDialog';
import { getCurrentMonthDateRange } from '@/lib/utils';

export function GrowthEntriesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentMonthRange = getCurrentMonthDateRange();
  const [filters, setFilters] = useState<GrowthFilters>({
    dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
  });
  
  const {
    resources: growthEntries,
    isLoading,
    selectedResource: selectedGrowthEntry,
    setSelectedResource: setSelectedGrowthEntry,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<GrowthEntry, CreateGrowthEntryInput>({
    resourceName: 'Growth Entry',
    queryKey: ['growthEntries', filters.dateRange],
    getResources: () => getGrowthEntries({
      startDate: filters.dateRange?.[0] || currentMonthRange.dateFrom,
      endDate: filters.dateRange?.[1] || currentMonthRange.dateTo
    }),
    createResource: createGrowthEntry,
    updateResource: updateGrowthEntry,
    deleteResource: deleteGrowthEntry,
  });

  const { data: reptiles = [], isLoading : isReptilesLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  const { species,  isLoading: speciesLoading } = useSpeciesStore()
  const { morphs, isLoading: morphsLoading } = useMorphsStore()

  const enrichedGrowthEntries = useMemo(() => {
    return growthEntries.map(growth => {
      const reptile = reptiles.find(reptile => reptile.id === growth.reptile_id);
      const speciesName = species.find(s => s.id.toString() === reptile?.species_id.toString());
      const morphName = morphs.find(m => m.id.toString() === reptile?.morph_id.toString());
      return {
        ...growth,
        reptile: reptile?.name || 'Unknown',
        species: speciesName?.name || 'Unknown',
        morph: morphName?.name || 'Unknown',
      };
    });
  }, [ growthEntries, reptiles, species, morphs ]);

  if (isLoading || speciesLoading || morphsLoading || isReptilesLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <GrowthEntryList 
        growthEntries={enrichedGrowthEntries}
        onEdit={(growthEntry) => {
          setSelectedGrowthEntry(growthEntry);
          setIsDialogOpen(true);
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedGrowthEntry ? 'Edit Growth Entry' : 'Add New Growth Entry'}
          </DialogTitle>
          <GrowthEntryForm
            initialData={selectedGrowthEntry}
            onSubmit={async (data) => {
              try {
                const success = selectedGrowthEntry
                  ? await handleUpdate(data)
                  : await handleCreate(data);
                if (success) {
                  setIsDialogOpen(false);
                  setSelectedGrowthEntry(undefined);
                }
              } catch (error) {
                console.error('Error submitting growth entry:', error);
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedGrowthEntry(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 