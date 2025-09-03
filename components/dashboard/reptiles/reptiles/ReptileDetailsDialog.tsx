'use client';

import { EnrichedReptile } from "./ReptileList";
import { Reptile } from "@/lib/types/reptile";
import { ReptileDetails } from "./details/ReptileDetails";
import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { useMorphsStore } from "@/lib/stores/morphsStore";
import { useMemo } from "react";
import { getLocationDetails } from "@/app/api/locations/locations";
import { useQueries } from "@tanstack/react-query";
import { CACHE_KEYS } from "@/lib/constants/cache_keys";

interface ReptileDetailsDialogProps {
  reptileId : string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptiles: Reptile[];
}
type EnrichedReptileWithLabel = EnrichedReptile & {
  label: string;
};
export function ReptileDetailsDialog({ 
  reptileId, 
  open, 
  onOpenChange,
  reptiles 
}: ReptileDetailsDialogProps) {
  const { species } = useSpeciesStore()
  const { morphs } = useMorphsStore()


  // Fetch location information for reptiles with location_id
  // Replace the locationData state and fetchLocationData function with useQueries
  const locationQueries = useQueries({
    queries: reptiles
      .filter(r => r.location_id)
      .map(reptile => ({
        queryKey: [CACHE_KEYS.LOCATIONS, reptile.location_id],
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

  
  const reptile = useMemo(() => {
    return reptiles.find(r => r.id.toString() === reptileId);
  }
  , [reptileId, reptiles]);

  
  // Create enriched reptiles with species, morph, and location names
  const enrichedReptile = useMemo(() => {
    if (!reptile) return null;
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
  }, [reptile, species, morphs, locationData,reptiles]);

  return (
    <ReptileDetails
      reptile={enrichedReptile}
      open={open}
      onOpenChange={onOpenChange}
      reptiles={reptiles}
    />
  );
}