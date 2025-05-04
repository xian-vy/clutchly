import { HetTrait, Reptile } from '@/lib/types/reptile';
import { Species } from '@/lib/types/species';
import { Morph } from '@/lib/types/morph';

// Mock data for ball python species
export const mockSpecies: Species = {
  id: 1,
  user_id: 'demo-user',
  name: 'Ball Python',
  scientific_name: 'Python regius',
  care_level: 'beginner',
  is_global: true
};

// Mock data for ball python morphs
export const mockMorphs: Morph[] = [
  {
    id: 1,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Normal',
    description: 'The wild-type coloration and pattern.',
    is_global: true
  },
  {
    id: 2,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Pastel',
    description: 'A co-dominant mutation that lightens the body color and enhances yellows and golds.',
    is_global: true
  },
  {
    id: 3,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Clown',
    description: 'A recessive mutation that alters the pattern with reduced pattern on the sides and a stripe down the back.',
    is_global: true
  },
  {
    id: 4,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Pastel Clown',
    description: 'A combination of Pastel and Clown genes, resulting in a lighter colored Clown pattern.',
    is_global: true
  },
  {
    id: 5,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Pied',
    description: 'A recessive mutation that creates white patches with normal pattern.',
    is_global: true
  }
];

// Mock data for 3 generations of reptiles with realistic ball python morphs and traits
export const generateMockReptiles = (): Reptile[] => {
  // Generate unique IDs
  const rootId = 'root-reptile';
  const damId = 'dam-reptile';
  const sireId = 'sire-reptile';
  const grandDam1Id = 'grand-dam-1';
  const grandSire1Id = 'grand-sire-1';
  const grandDam2Id = 'grand-dam-2';
  const grandSire2Id = 'grand-sire-2';

  // Common reptile properties
  const baseReptile = {
    created_at: new Date().toISOString(),
    user_id: 'demo-user',
    reptile_code: null,
    species_id: '1', // Using string to match the Reptile interface
    morph_id: '1', // Normal morph ID as string
    visual_traits: [] as string[],
    het_traits: [] as HetTrait[],
    weight: 500,
    length: 100,
    hatch_date: new Date(2020, 0, 1).toISOString(),
    acquisition_date: new Date(2020, 3, 15).toISOString(),
    status: 'active' as const,
    notes: null,
    last_modified: new Date().toISOString(),
    parent_clutch_id: null,
    location_id: null,
    original_breeder: 'Premium Breeders Inc.',
    project_ids: [] as string[]
  };

  // Create the reptiles with proper lineage connections and realistic morphs
  return [
    // Root reptile (current generation) - Pastel Clown
    {
      ...baseReptile,
      id: rootId,
      name: 'BP000001',
      sex: 'male' as const,
      dam_id: damId,
      sire_id: sireId,
      generation: 1,
      breeding_line: '',
      is_breeder: true,
      retired_breeder: false,
      morph_id: '4', // Pastel Clown
      visual_traits: ['Pastel', 'Clown'],
      het_traits: [
        {
          trait: 'Pied',
          percentage: 50,
          source: 'visual_parent',
          verified: false
        }
      ]
    },
    // Dam (1st generation) - Pastel het Clown
    {
      ...baseReptile,
      id: damId,
      name: 'BP000002',
      sex: 'female' as const,
      dam_id: grandDam1Id,
      sire_id: grandSire1Id,
      generation: 0,
      breeding_line: '',
      is_breeder: true,
      retired_breeder: false,
      morph_id: '2', // Pastel
      visual_traits: ['Pastel'],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        }
      ]
    },
    // Sire (1st generation) - Clown het Pied
    {
      ...baseReptile,
      id: sireId,
      name: 'BP000003',
      sex: 'male' as const,
      dam_id: grandDam2Id,
      sire_id: grandSire2Id,
      generation: 0,
      breeding_line: '',
      is_breeder: true,
      retired_breeder: false,
      morph_id: '3', // Clown
      visual_traits: ['Clown'],
      het_traits: [
        {
          trait: 'Pied',
          percentage: 100,
          source: 'genetic_test',
          verified: true
        }
      ]
    },
    // Maternal Grandmother (2nd generation) - Pastel
    {
      ...baseReptile,
      id: grandDam1Id,
      name: 'BP000004',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
      generation: -1,
      breeding_line: '',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '2', // Pastel
      visual_traits: ['Pastel'],
      het_traits: []
    },
    // Maternal Grandfather (2nd generation) - het Clown
    {
      ...baseReptile,
      id: grandSire1Id,
      name: 'BP000005',
      sex: 'male' as const,
      dam_id: null,
      sire_id: null,
      generation: -1,
      breeding_line: '',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '1', // Normal
      visual_traits: [],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        }
      ]
    },
    // Paternal Grandmother (2nd generation) - Clown
    {
      ...baseReptile,
      id: grandDam2Id,
      name: 'BP000006',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
      generation: -1,
      breeding_line: '',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '3', // Clown
      visual_traits: ['Clown'],
      het_traits: []
    },
    // Paternal Grandfather (2nd generation) - het Pied
    {
      ...baseReptile,
      id: grandSire2Id,
      name: 'BP000007',
      sex: 'male' as const,
      dam_id: null,
      sire_id: null,
      generation: -1,
      breeding_line: '',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '1', // Normal
      visual_traits: [],
      het_traits: [
        {
          trait: 'Pied',
          percentage: 100,
          source: 'genetic_test',
          verified: true
        }
      ]
    }
  ];
};

// Helper function to get mock reptile by ID
export const getMockReptileById = (id: string): Reptile | undefined => {
  return generateMockReptiles().find(reptile => reptile.id === id);
};

// Helper function to get mock morph by ID
export const getMockMorphById = (id: string): Morph | undefined => {
  return mockMorphs.find(morph => morph.id.toString() === id);
};