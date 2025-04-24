import { Reptile, Sex } from "@/lib/types/reptile";

/**
 * Generates a standardized reptile code based on the format:
 * SEQ_SPECIESINITIAL_MORPHNAME_HATCHYEAR_SEX
 * 
 * Examples: 
 * - 00001_BP_ALBINO_24_M (male)
 * - 00002_BP_PASTEL_24_F (female)
 * - 00003_BP_SPIDER_24_U (unknown)
 * 
 * @param reptiles - Array of existing reptiles (for sequence number generation)
 * @param speciesCode - Species code or initials (e.g., "BP" for Ball Python)
 * @param morphName - The name of the morph
 * @param hatchDate - The hatch date (or null if unknown)
 * @param sex - The reptile's sex (male/female/unknown)
 * @returns A standardized reptile code
 */
export const generateReptileCode = (
  reptiles: Reptile[],
  speciesCode: string,
  morphName: string,
  hatchDate: string | null,
  sex: Sex
): string => {
  // 1 billion
  const sequenceNumber = (reptiles.length + 1).toString().padStart(9, '0');
  
  // Extract year from hatch date or use current year if not available
  const year = hatchDate 
    ? new Date(hatchDate).getFullYear().toString().slice(-2)
    : new Date().getFullYear().toString().slice(-2);
  
  // Map sex to single character
  const sexCode = sex === 'male' ? 'M' : sex === 'female' ? 'F' : 'U';
  
  // Format the morphName (uppercase, replace spaces with underscores)
  const firstMorphWord = morphName.split(/\s+/)[0].toUpperCase();
  
  // Format: SEQ_SPECIESINITIAL_MORPHNAME_HATCHYEAR_SEX
  return `${sequenceNumber}_${speciesCode}_${firstMorphWord}_${year}_${sexCode}`;
};

/**
 * Extracts species code/initials from a species name
 * 
 * @param speciesName - The full species name
 * @returns The species code (initials of each word)
 */
export const getSpeciesCode = (speciesName: string): string => {
  return speciesName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

// Keeping the old function for backward compatibility, but making it use the new function
export const generateReptileName = generateReptileCode; 