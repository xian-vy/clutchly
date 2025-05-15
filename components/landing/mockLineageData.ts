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
    hatch_date: "2020-04-15",
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
      id: 'BP000001',
      name: 'BP000001',
      sex: 'male' as const,
      dam_id: null,
      sire_id: null,
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
      id: 'BP000002',
      name: 'BP000002',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
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
      id: 'BP000003',
      name: 'BP000003',
      sex: 'male' as const,
      dam_id: 'BP000002',
      sire_id: 'BP000001',
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
      id:'BP000004',
      name: 'BP000004',
      sex: 'female' as const,
      dam_id: 'BP000002',
      sire_id: 'BP000001',
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
      id: 'BP000005',
      name: 'BP000005',
      sex: 'female' as const,
      dam_id: 'BP000002',
      sire_id: 'BP000001',
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
      id: 'BP000006',
      name: 'BP000006',
      sex: 'male' as const,
      dam_id: 'BP000002',
      sire_id: 'BP000001',
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
      id: 'BP000007',
      name: 'BP000007',
      sex: 'female' as const,
      dam_id: 'BP000004',
      sire_id: 'BP000003',
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
        }
      ]
    },
    {
      ...baseReptile,
      id: 'BP000008',
      name: 'BP000008',
      sex: 'male' as const,
      dam_id: 'BP000005',
      sire_id:'BP000006',
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
      id: 'BP000009',
      name: 'BP000009',
      sex: 'male' as const,
      dam_id:  'BP000007',
      sire_id:  'BP000008',
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
        }
      ]
    },
    {
      ...baseReptile,
      id: 'BP000010',
      name: 'BP000010',
      sex: 'female' as const,
      dam_id: 'BP000005',
      sire_id:'BP000006',
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
      ]
    },
    {
      ...baseReptile,
      id: 'BP000011',
      name: 'BP000011',
      sex: 'male' as const,
      dam_id: 'BP000005',
      sire_id:'BP000006',
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
        }
      ]
    },
    
    // Dam (1st generation) - Pastel het Clown
    {
      ...baseReptile,
      id: 'BP000012',
      name: 'BP000012',
      sex: 'female' as const,
      dam_id:  'BP000007',
      sire_id:  'BP000008',
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
      id: 'BP000013',
      name: 'BP000013',
      sex: 'male' as const,
      dam_id:  'BP000007',
      sire_id:  'BP000008',
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
      id: 'BP000014',
      name: 'BP000014',
      sex: 'female' as const,
      dam_id:  'BP000007',
      sire_id:  'BP000008',
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
    
    {
      ...baseReptile,
      id: 'BP000015',
      name: 'BP000015',
      sex: 'male' as const,
      dam_id:  'BP000007',
      sire_id:  'BP000008',
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
      id: 'BP000016',
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
      id: 'BP000017',
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
      id: 'BP000018',
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
      id: 'BP000019',
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
      id: 'BP000020',
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
      id: 'BP000021',
      name: 'BP000021',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
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
      id: 'BP000022',
      name: 'BP000022',
      sex: 'male' as const,
      dam_id: null,
      sire_id: null,
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
    },
    {
      ...baseReptile,
      id: 'BP000023',
      name: 'BP000023',
      sex: 'female' as const,
      dam_id: null,
      sire_id: null,
      generation: -1,
      breeding_line: 'Clown-Mojave Project',
      is_breeder: true,
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
    },
    {
      ...baseReptile,
      id: 'BP000024',
      name: 'BP000024',
      sex: 'male' as const,
      dam_id: null,
      sire_id: null,
      generation: -1,
      breeding_line: 'Clown-Mojave Project',
      is_breeder: true,
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
    },
    {
      ...baseReptile,
      id:'BP000025',
      name: 'BP000025',
      sex: 'female' as const,
      dam_id:  null,
      sire_id:  null,
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