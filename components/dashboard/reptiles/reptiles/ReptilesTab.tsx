'use client';

import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { NewReptile, Reptile } from '@/lib/types/reptile';
import { useMemo, useState } from 'react';
import { ReptileForm } from './ReptileForm';
import { ReptileList } from './ReptileList';
import { Loader2 } from 'lucide-react';

export function ReptilesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const {
    resources: reptiles,
    isLoading: reptilesLoading,
    selectedResource: selectedReptile,
    setSelectedResource: setSelectedReptile,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: createReptile,
    updateResource: updateReptile,
    deleteResource: deleteReptile,
  })

  // Get species and morphs from their respective stores
  const { species,  isLoading: speciesLoading } = useSpeciesStore()
  const { morphs, isLoading: morphsLoading } = useMorphsStore()


  // Create enriched reptiles with species and morph names
  const enrichedReptiles = useMemo(() => {
    return reptiles.map(reptile => {
      const speciesData = species.find(s => s.id.toString() === reptile.species);
      const morphData = morphs.find(m => m.id.toString() === reptile.morph);
      const dam = reptile.dam_id ? reptiles.find(r => r.id.toString() === reptile.dam_id) : null;
      const sire = reptile.sire_id ? reptiles.find(r => r.id.toString() === reptile.sire_id) : null;
      const damName = dam ? dam.name : 'Unknown';
      const sireName = sire ? sire.name : 'Unknown';

      return {
        ...reptile,
        species_name: speciesData?.name || 'Unknown Species',
        morph_name: morphData?.name || 'Unknown Morph',
        dam_name: damName,
        sire_name: sireName,
      };
    });
  }, [reptiles, species, morphs]);

  const isLoading = reptilesLoading || speciesLoading  || morphsLoading;

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
      </div>
    )
  }

  const onDialogChange = () => {
    setIsDialogOpen(false);
    setSelectedReptile(undefined); 
  }

  return (
    <div className="space-y-6">
      <ReptileList 
        reptiles={enrichedReptiles}
        onEdit={(reptile) => {
          setSelectedReptile(reptile);
          setIsDialogOpen(true);
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
      />

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogTitle>
            {selectedReptile ? 'Edit Herp' : 'Add New Herp'}
          </DialogTitle>
          <ReptileForm
            initialData={selectedReptile}
            onSubmit={async (data) => {
              const success = selectedReptile
                ? await handleUpdate(data)
                : await handleCreate(data);
              if (success) {
                onDialogChange(); 
              }
            }}
            onCancel={onDialogChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}