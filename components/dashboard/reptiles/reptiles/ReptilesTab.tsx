'use client';

import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { getLocationDetails } from '@/app/api/locations/locations';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { NewReptile, Reptile } from '@/lib/types/reptile';
import { useMemo, useState, useEffect } from 'react';
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

  // States to track location data loading
  const [locationData, setLocationData] = useState<Record<string, any>>({});
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Fetch location information for reptiles with location_id
  const fetchLocationData = async (reptileList: Reptile[]) => {
    const reptileWithLocations = reptileList.filter(r => r.location_id);
    
    if (reptileWithLocations.length === 0) return;
    
    setLoadingLocations(true);
    try {
      const locationPromises = reptileWithLocations.map(reptile => 
        reptile.location_id ? getLocationDetails(reptile.location_id) : Promise.resolve(null)
      );
      
      const locationResults = await Promise.all(locationPromises);
      const newLocationData: Record<string, any> = {};
      
      reptileWithLocations.forEach((reptile, index) => {
        if (reptile.location_id && locationResults[index]) {
          newLocationData[reptile.location_id] = locationResults[index];
        }
      });
      
      setLocationData(newLocationData);
    } catch (error) {
      console.error("Error fetching location data:", error);
    } finally {
      setLoadingLocations(false);
    }
  };
  
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

  // Fetch location data when reptiles change
  useEffect(() => {
    if (reptiles.length > 0 && !reptilesLoading) {
      fetchLocationData(reptiles);
    }
  }, [reptiles, reptilesLoading]);

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
                // Refetch location data after create/update
                fetchLocationData(reptiles);
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