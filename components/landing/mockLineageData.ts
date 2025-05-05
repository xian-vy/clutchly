import { HetTrait, Reptile } from '@/lib/types/reptile';
import { Species } from '@/lib/types/species';
import { Morph } from '@/lib/types/morph';
import { ReptileNode } from '../dashboard/breeding/lineage/components/types';

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
  },
  {
    id: 6,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Spider',
    description: 'A dominant mutation that creates a web-like pattern.',
    is_global: true
  },
  {
    id: 7,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Pinstripe',
    description: 'A dominant mutation that creates a thin, pinstripe pattern along the back.',
    is_global: true
  },
  {
    id: 8,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Mojave',
    description: 'A co-dominant mutation that lightens the pattern and creates a blue-tinted pattern.',
    is_global: true
  },
  {
    id: 9,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Enchi',
    description: 'A co-dominant mutation that creates a reduced pattern with orange and gold coloration.',
    is_global: true
  },
  {
    id: 10,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Yellow Belly',
    description: 'A co-dominant mutation that enhances yellows on the sides and creates a flame pattern.',
    is_global: true
  },
  {
    id: 11,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Cinnamon',
    description: 'A co-dominant mutation that darkens the pattern and creates a rich, cinnamon-brown coloration.',
    is_global: true
  },
  {
    id: 12,
    user_id: 'demo-user',
    species_id: 1,
    name: 'Lesser',
    description: 'A co-dominant mutation that lightens the pattern and creates a clean, bright appearance.',
    is_global: true
  }
];

// Mock data for a more natural, asymmetrical 4-generation lineage with siblings and offspring grouping
export const generateMockReptiles = (): Reptile[] => {
  // Generate unique IDs for all reptiles in the lineage
  // Root reptile
  const rootId = 'root-reptile';
  
  // First generation (parents of root)
  const damId = 'dam-reptile';
  const sireId = 'sire-reptile';
  
  // Second generation (grandparents)
  // Note: We're only giving the dam complete parentage to make it asymmetrical
  const grandDam1Id = 'grand-dam-1';
  const grandSire1Id = 'grand-sire-1';
  
  // Third generation (great-grandparents)
  // Only two pairs at the top as requested
  const greatGrandDam1Id = 'great-grand-dam-1';
  const greatGrandSire1Id = 'great-grand-sire-1';
  const greatGrandDam2Id = 'great-grand-dam-2';
  const greatGrandSire2Id = 'great-grand-sire-2';
  
  // Siblings of the root (same parents, with/without offspring)
  const sibling1Id = 'sibling-1'; // This will have offspring
  const sibling2Id = 'sibling-2'; // This will have no offspring
  const sibling3Id = 'sibling-3'; // This will have no offspring
  
  // Offspring of root reptile (with no descendants)
  const offspring1Id = 'offspring-1';
  const offspring2Id = 'offspring-2';
  const offspring3Id = 'offspring-3';
  
  // Breeding partner of root
  const breedingPartnerId = 'breeding-partner';
  
  // Offspring of sibling (to demonstrate siblings with offspring)
  const siblingOffspring1Id = 'sibling-offspring-1';
  const siblingOffspring2Id = 'sibling-offspring-2';
  
  // Breeding partner of sibling
  const siblingPartnerId = 'sibling-partner';
  
  // New - Offspring of greatGrandSire2 (BP000019) with no descendants
  const greatGrandOffspring1Id = 'great-grand-offspring-1';
  const greatGrandOffspring2Id = 'great-grand-offspring-2';
  
  // New - Breeding partner for greatGrandSire2
  const greatGrandPartnerId = 'great-grand-partner';
  
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
    // Root reptile - Pastel Clown
    {
      ...baseReptile,
      id: rootId,
      name: 'BP000001',
      sex: 'male' as const,
      dam_id: grandDam1Id,
      sire_id: grandSire1Id,
      generation: 1,
      breeding_line: 'Clown Project',
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
        },
        {
          trait: 'Mojave',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },

    // Sibling 1 of root (with same parents) - this one has offspring
    {
      ...baseReptile,
      id: sibling1Id,
      name: 'BP000002',
      sex: 'female' as const,
      dam_id: grandDam1Id,
      sire_id: grandSire1Id,
      generation: 1,
      breeding_line: 'Clown Project',
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
        },
        {
          trait: 'Mojave',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    
    // Sibling 2 of root (with same parents) - no offspring
    {
      ...baseReptile,
      id: sibling2Id,
      name: 'BP000003',
      sex: 'male' as const,
      dam_id: grandDam1Id,
      sire_id: grandSire1Id,
      generation: 1,
      breeding_line: 'Clown Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '1', // Normal
      visual_traits: ['Normal'],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pastel',
          percentage: 66,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Mojave',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    
    // Sibling 3 of root (with same parents) - no offspring
    {
      ...baseReptile,
      id: sibling3Id,
      name: 'BP000004',
      sex: 'female' as const,
      dam_id: grandDam1Id,
      sire_id: grandSire1Id,
      generation: 1,
      breeding_line: 'Clown Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '3', // Clown
      visual_traits: ['Clown'],
      het_traits: [
        {
          trait: 'Pastel',
          percentage: 66,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Mojave',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },

    // Breeding partner for root to produce offspring
    {
      ...baseReptile,
      id: breedingPartnerId,
      name: 'BP000005',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
      generation: 1,
      breeding_line: 'Pied Project',
      is_breeder: true,
      retired_breeder: false,
      morph_id: '5', // Pied
      visual_traits: ['Pied'],
      het_traits: [
        {
          trait: 'Enchi',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        },
        {
          trait: 'Yellow Belly',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },

    // Breeding partner for sibling1
    {
      ...baseReptile,
      id: siblingPartnerId,
      name: 'BP000006',
      sex: 'male' as const,
      dam_id: null,
      sire_id: null,
      generation: 1,
      breeding_line: 'Spider Project',
      is_breeder: true,
      retired_breeder: false,
      morph_id: '6', // Spider
      visual_traits: ['Spider'],
      het_traits: [
        {
          trait: 'Pinstripe',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        },
        {
          trait: 'Pied',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    
    // Offspring of sibling1 (demonstrating that siblings can have offspring)
    {
      ...baseReptile,
      id: siblingOffspring1Id,
      name: 'BP000007',
      sex: 'female' as const,
      dam_id: sibling1Id,
      sire_id: siblingPartnerId,
      generation: 2,
      breeding_line: 'Spider-Pastel Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '2', // Pastel
      visual_traits: ['Pastel'],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Spider',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pinstripe',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pied',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Mojave',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    {
      ...baseReptile,
      id: siblingOffspring2Id,
      name: 'BP000008',
      sex: 'male' as const,
      dam_id: sibling1Id,
      sire_id: siblingPartnerId,
      generation: 2,
      breeding_line: 'Spider-Pastel Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '6', // Spider
      visual_traits: ['Spider'],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pastel',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pinstripe',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pied',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Mojave',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },

    // Offspring of root (with no descendants - to be grouped)
    {
      ...baseReptile,
      id: offspring1Id,
      name: 'BP000009',
      sex: 'male' as const,
      dam_id: breedingPartnerId,
      sire_id: rootId,
      generation: 2,
      breeding_line: 'Clown-Pied Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '2', // Pastel
      visual_traits: ['Pastel'],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pied',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Enchi',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Yellow Belly',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Mojave',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    {
      ...baseReptile,
      id: offspring2Id,
      name: 'BP000010',
      sex: 'female' as const,
      dam_id: breedingPartnerId,
      sire_id: rootId,
      generation: 2,
      breeding_line: 'Clown-Pied Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '3', // Clown
      visual_traits: ['Clown'],
      het_traits: [
        {
          trait: 'Pied',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pastel',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Enchi',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Yellow Belly',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Mojave',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    {
      ...baseReptile,
      id: offspring3Id,
      name: 'BP000011',
      sex: 'male' as const,
      dam_id: breedingPartnerId,
      sire_id: rootId,
      generation: 2,
      breeding_line: 'Clown-Pied Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '5', // Pied
      visual_traits: ['Pied'],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Pastel',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Enchi',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Yellow Belly',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Mojave',
          percentage: 25,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    
    // Dam (1st generation) - Pastel het Clown
    {
      ...baseReptile,
      id: damId,
      name: 'BP000012',
      sex: 'female' as const,
      dam_id: grandDam1Id,
      sire_id: grandSire1Id,
      generation: 0,
      breeding_line: 'Clown Project',
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
        },
        {
          trait: 'Mojave',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Cinnamon',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    
    // Sire (1st generation) - Clown
    {
      ...baseReptile,
      id: sireId,
      name: 'BP000013',
      sex: 'male' as const,
      dam_id: grandDam1Id, // Missing parentage to make the tree asymmetrical
      sire_id: grandSire1Id,
      generation: 0,
      breeding_line: 'Clown Project',
      is_breeder: true,
      retired_breeder: false,
      morph_id: '3', // Clown
      visual_traits: ['Clown'],
      het_traits: [
        {
          trait: 'Pastel',
          percentage: 66,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Mojave',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Cinnamon',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    
    // Maternal Grandmother (2nd generation) - Pastel
    {
      ...baseReptile,
      id: grandDam1Id,
      name: 'BP000014',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
      generation: -1,
      breeding_line: 'Pastel Project',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '2', // Pastel
      visual_traits: ['Pastel'],
      het_traits: [
        {
          trait: 'Cinnamon',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        },
        {
          trait: 'Lesser',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    
    // Maternal Grandfather (2nd generation) - het Clown
    {
      ...baseReptile,
      id: grandSire1Id,
      name: 'BP000015',
      sex: 'male' as const,
      dam_id: greatGrandDam2Id,
      sire_id: greatGrandSire2Id,
      generation: -1,
      breeding_line: 'Clown Project',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '1', // Normal
      visual_traits: ['Normal'],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        },
        {
          trait: 'Mojave',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        }
      ]
    },
    
    // Great-grandparents (3rd generation - max 2 pairs at top)
    {
      ...baseReptile,
      id: greatGrandDam1Id,
      name: 'BP000016',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
      generation: -2,
      breeding_line: 'Foundation',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '2', // Pastel
      visual_traits: ['Pastel'],
      het_traits: [
        {
          trait: 'Lesser',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        }
      ]
    },
    {
      ...baseReptile,
      id: greatGrandSire1Id,
      name: 'BP000017',
      sex: 'male' as const,
      dam_id: null,
      sire_id: null,
      generation: -2,
      breeding_line: 'Foundation',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '1', // Normal
      visual_traits: ['Normal'],
      het_traits: [
        {
          trait: 'Cinnamon',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        }
      ]
    },
    {
      ...baseReptile,
      id: greatGrandDam2Id,
      name: 'BP000018',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
      generation: -2,
      breeding_line: 'Foundation',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '1', // Normal
      visual_traits: ['Normal'],
      het_traits: [
        {
          trait: 'Mojave',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        }
      ]
    },
    {
      ...baseReptile,
      id: greatGrandSire2Id,
      name: 'BP000019',
      sex: 'male' as const,
      dam_id: null,
      sire_id: null,
      generation: -2,
      breeding_line: 'Clown Project',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '3', // Clown
      visual_traits: ['Clown'],
      het_traits: [
        {
          trait: 'Yellow Belly',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        }
      ]
    },
    
    // New - Breeding partner for greatGrandSire2 (BP000019)
    {
      ...baseReptile,
      id: greatGrandPartnerId,
      name: 'BP000020',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
      generation: -2,
      breeding_line: 'Mojave Project',
      is_breeder: false,
      retired_breeder: true,
      morph_id: '8', // Mojave
      visual_traits: ['Mojave'],
      het_traits: [
        {
          trait: 'Enchi',
          percentage: 100,
          source: 'breeding_odds',
          verified: true
        },
        {
          trait: 'Lesser',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    
    // New - Offspring of greatGrandSire2 (BP000019) with no descendants
    {
      ...baseReptile,
      id: greatGrandOffspring1Id,
      name: 'BP000021',
      sex: 'female' as const,
      dam_id: greatGrandDam2Id,
      sire_id: greatGrandSire2Id,
      generation: -1,
      breeding_line: 'Clown-Mojave Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '3', // Clown
      visual_traits: ['Clown'],
      het_traits: [
        {
          trait: 'Mojave',
          percentage: 100,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Yellow Belly',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
        }
      ]
    },
    {
      ...baseReptile,
      id: greatGrandOffspring2Id,
      name: 'BP000022',
      sex: 'male' as const,
      dam_id: greatGrandDam2Id,
      sire_id: greatGrandSire2Id,
      generation: -1,
      breeding_line: 'Clown-Mojave Project',
      is_breeder: false,
      retired_breeder: false,
      morph_id: '8', // Mojave
      visual_traits: ['Mojave'],
      het_traits: [
        {
          trait: 'Clown',
          percentage: 100,
          source: 'breeding_odds',
          verified: false
        },
        {
          trait: 'Yellow Belly',
          percentage: 50,
          source: 'breeding_odds',
          verified: false
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

// Function to create a mock ReptileNode with appropriate childrenWithoutDescendants
export const createMockReptileLineage = (reptileId: string): ReptileNode => {
  const reptiles = generateMockReptiles();
  const reptileMap = new Map<string, Reptile>(
    reptiles.map(reptile => [reptile.id, reptile])
  );
  
  // Create basic ReptileNode structure
  const createNode = (id: string): ReptileNode => {
    const reptile = reptileMap.get(id);
    if (!reptile) {
      throw new Error(`Reptile with ID ${id} not found`);
    }
    
    return {
      ...reptile,
      children: [],
      childrenWithoutDescendants: [],
      parents: {
        dam: null,
        sire: null
      }
    };
  };
  
  // Build the tree starting from the root
  const buildTree = (id: string, depth = 0): ReptileNode => {
    if (depth > 10 || !reptileMap.has(id)) return null as unknown as ReptileNode;
    
    const node = createNode(id);
    
    // Add parents
    if (node.dam_id && reptileMap.has(node.dam_id)) {
      node.parents.dam = buildTree(node.dam_id, depth + 1);
    }
    
    if (node.sire_id && reptileMap.has(node.sire_id)) {
      node.parents.sire = buildTree(node.sire_id, depth + 1);
    }
    
    // Find offspring with descendants (those that have their own offspring)
    const allOffspring = reptiles.filter(
      r => r.dam_id === id || r.sire_id === id
    );
    
    const offspringWithDescendants = allOffspring.filter(offspring => {
      return reptiles.some(r => r.dam_id === offspring.id || r.sire_id === offspring.id);
    });
    
    // Add offspring with descendants as children
    for (const offspring of offspringWithDescendants) {
      node.children.push(buildTree(offspring.id, depth + 1));
    }
    
    // Find offspring without descendants
    const offspringWithoutDescendants = allOffspring.filter(offspring => {
      return !reptiles.some(r => r.dam_id === offspring.id || r.sire_id === offspring.id);
    });
    
    // Set childrenWithoutDescendants property
    node.childrenWithoutDescendants = offspringWithoutDescendants;
    
    return node;
  };
  
  return buildTree(reptileId);
};