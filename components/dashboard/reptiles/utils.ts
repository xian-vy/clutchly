import { Reptile, Sex } from "@/lib/types/reptile";

/**
 * Generates a standardized reptile code based on the format:
 * SEQ_SPECIESINITIAL_MORPHCODE_HATCHYEAR_SEX
 * 
 * Examples: 
 * - 00001-BP-ALBINO-24-M (male)
 * - 00002-BP-PASTEL-24-F (female)
 * - 00003-BP-SPIDER-24-U (unknown)
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
  // Extract year from hatch date or use current year if not available
  const year = hatchDate 
    ? new Date(hatchDate).getFullYear().toString().slice(-2)
    : new Date().getFullYear().toString().slice(-2);
  
  // Map sex to single character
  const sexCode = sex === 'male' ? 'M' : sex === 'female' ? 'F' : 'U';
  
  // Get first 5 letters of morph name (uppercase), removing spaces
  const cleanedMorphName = morphName.replace(/\s+/g, '');
  const morphCode = cleanedMorphName.substring(0, 5).toUpperCase();
  
  // Find the max sequence number among existing reptiles
  let maxSeq = 0;
  reptiles.forEach(r => {
    if (r.reptile_code) {
      const match = r.reptile_code.match(/^(\d{5})-/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }
  });
  const sequenceNumber = (maxSeq + 1).toString().padStart(5, '0');
  
  // Format: SEQ_SPECIESINITIAL_MORPHNAME_HATCHYEAR_SEX
  return `${sequenceNumber}-${speciesCode}-${morphCode}-${year}-${sexCode}`;
};

/**
 * Generates a reptile name based on morph and traits following reptile hobby naming conventions
 * Format: "Morph het trait1 het trait2 00035"
 * 
 * @param morphName - The name of the morph
 * @param hetTraits - Array of het traits
 * @param sequenceNumber - Optional sequence number to append
 * @returns A formatted reptile name
 */
export const generateReptileName = (
  morphName: string,
  hetTraits: Array<{ trait: string; percentage: number }> = [],
  sequenceNumber?: string
): string => {
  const parts: string[] = [];
  
  // Add morph name (capitalize first letter of each word)
  if (morphName) {
    const formattedMorph = morphName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    parts.push(formattedMorph);
  }
  
  // Add het traits (only if percentage > 0)
  hetTraits
    .filter(het => het.percentage > 0)
    .forEach(het => {
      const formattedHet = het.trait
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      parts.push(`het ${formattedHet}`);
    });
  
  // Add sequence number if provided
  if (sequenceNumber) {
    parts.push(sequenceNumber);
  }
  
  return parts.join(' ');
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