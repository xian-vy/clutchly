'use client';

import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { getLocationDetails } from '@/app/api/locations/locations';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { NewReptile, Reptile } from '@/lib/types/reptile';
import { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ReptileForm } from './ReptileForm';
import { EnrichedReptile, ReptileList } from './ReptileList';
import { Loader2 } from 'lucide-react';
import { getProfile } from '@/app/api/profiles/profiles';
import { Profile } from '@/lib/types/profile';
import { toast } from 'sonner';

type EnrichedReptileWithLabel = EnrichedReptile & {
  label: string;
};
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
    refetch: refetchReptiles
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: createReptile,
    updateResource: updateReptile,
    deleteResource: deleteReptile,
  })

  const { data: profile, isLoading : profileLoading } = useQuery<Profile>({
    queryKey: ['profile2'],
    queryFn: async () => {
      const data = await getProfile();
      return Array.isArray(data) ? data[0] : data;
    },
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
        staleTime: 60 * 60 * 1000, // Consider data fresh for 60 minutes
        cacheTime: 60 * 60 * 1000, // Keep in cache for 60 minutes
      }))
  });

  const locationData = useMemo(() => {
    const data: Record<string, EnrichedReptileWithLabel> = {};
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
      const speciesData = species.find(s => s.id.toString() === reptile.species_id.toString());
      const morphData = morphs.find(m => m.id.toString() === reptile.morph_id.toString());
      const dam = reptile.dam_id ? reptiles.find(r => r.id.toString() === reptile.dam_id) : null;
      const sire = reptile.sire_id ? reptiles.find(r => r.id.toString() === reptile.sire_id) : null;
      const damName = dam ? dam.name : 'Unknown';
      const sireName = sire ? sire.name : 'Unknown';
      
      // Get location information if available
      const locationInfo = reptile.location_id ? locationData[reptile.location_id] : null;
      const locationLabel = locationInfo ? locationInfo.label : "Unknown Location";

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

  const isLoading = reptilesLoading || speciesLoading || morphsLoading || loadingLocations || profileLoading;

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    )
  }

  const onDialogChange = () => {
    setIsDialogOpen(false);
    setSelectedReptile(undefined); 
  }

  const handleImportComplete = () => {
    refetchReptiles();
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
          onImportSuccess={handleImportComplete}
       />

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogTitle>
            {selectedReptile ? 'Edit Reptile' : 'Add New Reptile'}
          </DialogTitle>
          <ReptileForm
            initialData={selectedReptile}
            onSubmit={async (data) => {
              //check for duplicate name
              const duplicate = reptiles.find(r => r.name.toLowerCase().trim() === data.name.toLowerCase().trim() && r.id !== selectedReptile?.id);
              if (duplicate) {
                toast.error('A reptile with that name already exists!');
                return;
              }
              const success = selectedReptile
                ? await handleUpdate(data)
                : await handleCreate(data);
              if (success) {
                onDialogChange(); 
              }
            }}
            onCancel={onDialogChange}
            profile={profile}
          />
        </DialogContent>
      </Dialog>
      
    
    </div>
  );
}