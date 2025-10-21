import { useMemo } from "react";
import { Species } from "../types/species";

export function useSortedSpecies(
  species: Species[],
  selectedSpeciesIds: Array<number | string> | undefined
): Species[] {
  const selectedIdsSet = useMemo(
    () => new Set(selectedSpeciesIds?.map(String) ?? []),
    [selectedSpeciesIds]
  );

  return useMemo(() => {
    return [...species].sort((a, b) => {
      const aSelected = selectedIdsSet.has(String(a.id));
      const bSelected = selectedIdsSet.has(String(b.id));

      if (aSelected === bSelected) {
        return a.name.localeCompare(b.name);
      }
      return aSelected ? -1 : 1;
    });
  }, [species, selectedIdsSet]);
}
