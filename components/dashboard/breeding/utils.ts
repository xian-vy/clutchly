import { Reptile } from '@/lib/types/reptile';

/**
 * Checks if two reptiles are related (share common ancestors)
 * @param male The male reptile (sire)
 * @param female The female reptile (dam)
 * @param reptiles Array of all reptiles for ancestry lookup
 * @param maxGenerations Maximum number of generations to check (default: 3)
 * @returns Object with inbreeding status and details
 */
export function checkInbreeding(
  male: Reptile | undefined,
  female: Reptile | undefined,
  reptiles: Reptile[],
  maxGenerations: number = 3
): { isInbreeding: boolean; relationship: string; commonAncestors: Reptile[] } {
  if (!male || !female) {
    return { isInbreeding: false, relationship: '', commonAncestors: [] };
  }

  // Check direct parent-offspring relationship
  if (male.id === female.dam_id || female.id === male.dam_id) {
    return {
      isInbreeding: true,
      relationship: 'Parent-Offspring',
      commonAncestors: [],
    };
  }

  // Check siblings (same parents)
  if (
    (male.dam_id && female.dam_id && male.dam_id === female.dam_id) ||
    (male.sire_id && female.sire_id && male.sire_id === female.sire_id)
  ) {
    const commonParents: Reptile[] = [];
    
    if (male.dam_id && male.dam_id === female.dam_id) {
      const dam = reptiles.find(r => r.id === male.dam_id);
      if (dam) commonParents.push(dam);
    }
    
    if (male.sire_id && male.sire_id === female.sire_id) {
      const sire = reptiles.find(r => r.id === male.sire_id);
      if (sire) commonParents.push(sire);
    }
    
    return {
      isInbreeding: true,
      relationship: commonParents.length === 2 ? 'Full Siblings' : 'Half Siblings',
      commonAncestors: commonParents,
    };
  }

  // Get ancestors for both reptiles
  const maleAncestors = getAncestors(male, reptiles, maxGenerations);
  const femaleAncestors = getAncestors(female, reptiles, maxGenerations);

  // Find common ancestors
  const commonAncestors = maleAncestors.filter(ancestor =>
    femaleAncestors.some(femaleAncestor => femaleAncestor.id === ancestor.id)
  );

  if (commonAncestors.length > 0) {
    return {
      isInbreeding: true,
      relationship: 'Related',
      commonAncestors,
    };
  }

  return { isInbreeding: false, relationship: '', commonAncestors: [] };
}

/**
 * Gets all ancestors of a reptile up to a specified number of generations
 * @param reptile The reptile to find ancestors for
 * @param allReptiles Array of all reptiles for lookup
 * @param maxGenerations Maximum number of generations to traverse
 * @param currentGeneration Current generation in the recursion
 * @returns Array of ancestor reptiles
 */
export function getAncestors(
  reptile: Reptile,
  allReptiles: Reptile[],
  maxGenerations: number = 3,
  currentGeneration: number = 0
): Reptile[] {
  if (currentGeneration >= maxGenerations) {
    return [];
  }

  const ancestors: Reptile[] = [];

  // Find dam (mother)
  if (reptile.dam_id) {
    const dam = allReptiles.find(r => r.id === reptile.dam_id);
    if (dam) {
      ancestors.push(dam);
      // Recursively get dam's ancestors
      ancestors.push(...getAncestors(dam, allReptiles, maxGenerations, currentGeneration + 1));
    }
  }

  // Find sire (father)
  if (reptile.sire_id) {
    const sire = allReptiles.find(r => r.id === reptile.sire_id);
    if (sire) {
      ancestors.push(sire);
      // Recursively get sire's ancestors
      ancestors.push(...getAncestors(sire, allReptiles, maxGenerations, currentGeneration + 1));
    }
  }

  return ancestors;
}