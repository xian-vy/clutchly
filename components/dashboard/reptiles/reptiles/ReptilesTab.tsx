'use client';

import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { getLocationDetails } from '@/app/api/locations/locations';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { NewReptile, Reptile } from '@/lib/types/reptile';
import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ReptileForm } from './ReptileForm';
import { ReptileList } from './ReptileList';
import { ImportReptileDialog } from './ImportReptileDialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

export function ReptilesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  
  const {
    resources: reptiles,
    isLoading: reptilesLoading,
    selectedResource: selectedReptile,
    setSelectedResource: setSelectedReptile,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch: refetchReptiles
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


  // Fetch location information for reptiles with location_id
  // Replace the locationData state and fetchLocationData function with useQueries
  const locationQueries = useQueries({
    queries: reptiles
      .filter(r => r.location_id)
      .map(reptile => ({
        queryKey: ['location', reptile.location_id],
        queryFn: () => getLocationDetails(reptile.location_id!),
        staleTime: 15 * 60 * 1000, // Consider data fresh for 15 minutes
        cacheTime: 60 * 60 * 1000, // Keep in cache for 60 minutes
      }))
  });

  const locationData = useMemo(() => {
    const data: Record<string, any> = {};
    reptiles
      .filter(r => r.location_id)
      .forEach((reptile, index) => {
        if (reptile.location_id && locationQueries[index].data) {
          data[reptile.location_id] = locationQueries[index].data;
        }
      });
    return data;
  }, [reptiles, locationQueries]);

  const loadingLocations = locationQueries.some(query => query.isLoading);

  
  // Create enriched reptiles with species, morph, and location names
  const enrichedReptiles = useMemo(() => {
    return reptiles.map(reptile => {
      const speciesData = species.find(s => s.id.toString() === reptile.species_id);
      const morphData = morphs.find(m => m.id.toString() === reptile.morph_id);
      const dam = reptile.dam_id ? reptiles.find(r => r.id.toString() === reptile.dam_id) : null;
      const sire = reptile.sire_id ? reptiles.find(r => r.id.toString() === reptile.sire_id) : null;
      const damName = dam ? dam.name : 'Unknown';
      const sireName = sire ? sire.name : 'Unknown';
      
      // Get location information if available
      const locationInfo = reptile.location_id ? locationData[reptile.location_id] : null;
      const locationLabel = locationInfo ? locationInfo.label : null;

      return {
        ...reptile,
        species_name: speciesData?.name || 'Unknown Species',
        morph_name: morphData?.name || 'Unknown Morph',
        dam_name: damName,
        sire_name: sireName,
        location_label: locationLabel,
      };
    });
  }, [reptiles, species, morphs, locationData]);

  const isLoading = reptilesLoading || speciesLoading || morphsLoading || loadingLocations;

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

  const handleImportComplete = () => {
    // Refetch reptiles data after successful import
    refetchReptiles();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Herp List</h2>
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
      
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
      
      {/* Import Dialog */}
      <ImportReptileDialog 
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}