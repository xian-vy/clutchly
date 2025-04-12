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
      const speciesData = species.find(s => s.id === reptile.species);
      const morphData = morphs.find(m => m.id === reptile.morph);
      
      return {
        ...reptile,
        species_name: speciesData?.name || 'Unknown Species',
        morph_name: morphData?.name || 'Unknown Morph'
      };
    });
  }, [reptiles, species, morphs]);

  const isLoading = reptilesLoading || speciesLoading  || morphsLoading;

  if (isLoading) {
    return <div>Loading...</div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedReptile ? 'Edit Reptile' : 'Add New Reptile'}
          </DialogTitle>
          <ReptileForm
            initialData={selectedReptile}
            onSubmit={async (data) => {
              const success = selectedReptile
                ? await handleUpdate(data)
                : await handleCreate(data);
              if (success) {
                setIsDialogOpen(false);
                setSelectedReptile(undefined);
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedReptile(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}