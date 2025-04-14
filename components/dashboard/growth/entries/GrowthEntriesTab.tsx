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
import { NewReptile, Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';


export function GrowthEntriesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
    queryKey: ['growthEntries'],
    getResources: getGrowthEntries,
    createResource: createGrowthEntry,
    updateResource: updateGrowthEntry,
    deleteResource: deleteGrowthEntry,
  });

  const { 
    resources: reptiles, 
    isLoading: isReptilesLoading 
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });

  const { species,  isLoading: speciesLoading } = useSpeciesStore()
  const { morphs, isLoading: morphsLoading } = useMorphsStore()

  const enrichedGrowthEntries = useMemo(() => {
    return growthEntries.map(growth => {
      const reptile = reptiles.find(reptile => reptile.id === growth.reptile_id);
      const speciesName = species.find(s => s.id.toString() === reptile?.species);
      const morphName = morphs.find(m => m.id.toString() === reptile?.morph);
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
          <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
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