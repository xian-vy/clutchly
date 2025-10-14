import { useState, useEffect } from 'react';
import { Reptile } from '@/lib/types/reptile';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '../types/morph';

interface UseReptilesBySpeciesProps {
  reptiles: Reptile[];
  speciesId: string;
}

export function useReptilesParentsBySpecies({ reptiles, speciesId }: UseReptilesBySpeciesProps) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  const [maleReptiles, setMaleReptiles] = useState<Reptile[]>([]);
  const [femaleReptiles, setFemaleReptiles] = useState<Reptile[]>([]);
  const [morphsForSpecies, setMorphsForSpecies] = useState<Morph[]>([]);
  const { getMorphsBySpecies } = useMorphsStore();

  useEffect(() => {
    if (speciesId) {
      setSelectedSpeciesId(speciesId);
      const morphsForSpecies = getMorphsBySpecies(speciesId);
      const morphsList = morphsForSpecies.map(m => ({ id: m.id.toString(), name: m.name }));
      setMorphsForSpecies(morphsForSpecies);
      setMaleReptiles(reptiles.filter((r) => 
        r.sex === 'male' && 
        r.species_id.toString() === speciesId.toString() &&
        (!r.morph_id || morphsList.some(m => m.id.toString() === r.morph_id.toString()))
      ));

      setFemaleReptiles(reptiles.filter((r) => 
        r.sex === 'female' && 
        r.species_id.toString() === speciesId.toString() &&
        (!r.morph_id || morphsList.some(m => m.id.toString() === r.morph_id.toString()))
      ));
    }
  }, [speciesId, reptiles]);

  return {
    selectedSpeciesId,
    maleReptiles,
    femaleReptiles,
    morphsForSpecies
  };
}