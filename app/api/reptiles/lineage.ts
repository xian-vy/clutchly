import { createClient } from '@/lib/supabase/client';
import { Reptile } from '@/lib/types/reptile';
import { getUserAndOrganizationInfo } from '../utils_client';

interface ReptileNode extends Reptile {
  children: ReptileNode[];
  childrenWithoutDescendants: Reptile[];
  parents: {
    dam: ReptileNode | null;
    sire: ReptileNode | null;
  };
}

export async function getReptileLineage(reptileId: string, cachedReptiles?: Reptile[]): Promise<ReptileNode> {
  let reptiles: Reptile[] = cachedReptiles || [];

  // Only fetch if no cached data provided
  if (!cachedReptiles) {
    const { organization } = await getUserAndOrganizationInfo()

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reptiles')
      .select('*')
      .eq('org_id', organization.id);

    if (error) throw new Error(`Failed to fetch reptiles: ${error.message}`);
    if (!data || data.length === 0) throw new Error('No reptiles found');
    
    reptiles = data;
  } else {
    console.log("Using cached reptiles");
  }

  // Cache reptiles by ID for quick lookup
  const reptileMap = new Map<string, Reptile>(reptiles.map((r) => [r.id, r]));
  
  // Maximum depth to prevent infinite recursion
  const MAX_DEPTH = 10;
  
  // Track processed reptiles to avoid cycles
  const processedReptiles = new Map<string, ReptileNode>();
  
  // Track reptiles that have descendants (offspring with their own offspring)
  const hasDescendants = new Set<string>();

  // Build reptile node with depth limit
  function buildReptileNode(id: string, depth = 0): ReptileNode | null {
    // Check depth to prevent stack overflow
    if (depth > MAX_DEPTH) return null;
    
    // Return null if reptile doesn't exist
    if (!reptileMap.has(id)) return null;
    
    // Return already processed node to avoid cycles
    if (processedReptiles.has(id)) return processedReptiles.get(id)!;
    
    const reptile = reptileMap.get(id)!;
    
    // Create the node with empty children and parents
    const node: ReptileNode = {
      ...reptile,
      children: [],
      childrenWithoutDescendants: [],
      parents: { dam: null, sire: null },
    };
    
    // Save to processed map immediately to avoid cycles
    processedReptiles.set(id, node);
    
    // Process parents if depth allows
    if (depth < MAX_DEPTH) {
      if (reptile.dam_id) {
        node.parents.dam = buildReptileNode(reptile.dam_id, depth + 1);
      }
      
      if (reptile.sire_id) {
        node.parents.sire = buildReptileNode(reptile.sire_id, depth + 1);
      }
    }
    
    return node;
  }
  
  // Build the family tree starting from the root reptile
  const rootNode = buildReptileNode(reptileId);
  if (!rootNode) throw new Error('Reptile not found');
  
  // First identify all reptiles with descendants (offspring with offspring)
  for (const reptile of reptiles) {
    if (reptile.dam_id || reptile.sire_id) {
      // Find all offspring of this reptile
      const offspring = reptiles.filter(
        r => r.dam_id === reptile.id || r.sire_id === reptile.id
      );
      
      // If any offspring has its own offspring, mark as having descendants
      const hasOffspringWithOffspring = offspring.some(child => {
        return reptiles.some(r => r.dam_id === child.id || r.sire_id === child.id);
      });
      
      if (hasOffspringWithOffspring) {
        hasDescendants.add(reptile.id);
      }
    }
  }
  
  // Track parent pairs for grouping children without descendants
  const parentPairs = new Map<string, Set<string>>();
  
  // Now add children relationships
  // This approach first processes all relationships
  const addedChildRelations = new Set<string>();
  
  // First pass: identify parent pairs for each reptile
  for (const reptile of reptiles) {
    if (reptile.dam_id && reptile.sire_id) {
      const parentPairKey = reptile.dam_id < reptile.sire_id 
        ? `${reptile.dam_id}:${reptile.sire_id}`
        : `${reptile.sire_id}:${reptile.dam_id}`;
      
      if (!parentPairs.has(parentPairKey)) {
        parentPairs.set(parentPairKey, new Set());
      }
      
      // Only add to the set if this reptile doesn't have descendants AND is not already shown in the tree
      if (!hasDescendants.has(reptile.id) && !processedReptiles.has(reptile.id)) {
        parentPairs.get(parentPairKey)!.add(reptile.id);
      }
    }
  }
  
  // Now process children relationships normally
  for (const reptile of reptiles) {
    if (reptile.dam_id || reptile.sire_id) {
      // Skip if parent reptiles aren't in our tree
      if ((!reptile.dam_id || !processedReptiles.has(reptile.dam_id)) && 
          (!reptile.sire_id || !processedReptiles.has(reptile.sire_id))) {
        continue;
      }
      
      // Get or create the child node
      let childNode = processedReptiles.get(reptile.id);
      if (!childNode) {
        const newNode = buildReptileNode(reptile.id);
        if (!newNode) continue; // Skip if child node couldn't be created
        childNode = newNode;
      }
      
      // Only add as regular child if it has descendants
      if (hasDescendants.has(reptile.id)) {
        // Add as child to dam if dam exists in our tree
        if (reptile.dam_id && processedReptiles.has(reptile.dam_id)) {
          const relationKey = `${reptile.dam_id}-${reptile.id}`;
          if (!addedChildRelations.has(relationKey)) {
            const damNode = processedReptiles.get(reptile.dam_id)!;
            damNode.children.push(childNode);
            addedChildRelations.add(relationKey);
          }
        }
        
        // Add as child to sire if sire exists in our tree
        if (reptile.sire_id && processedReptiles.has(reptile.sire_id)) {
          const relationKey = `${reptile.sire_id}-${reptile.id}`;
          if (!addedChildRelations.has(relationKey)) {
            const sireNode = processedReptiles.get(reptile.sire_id)!;
            sireNode.children.push(childNode);
            addedChildRelations.add(relationKey);
          }
        }
      }
    }
  }
  
  // Process the parent pairs to create grouped children
  for (const [parentPairKey, childrenIds] of parentPairs.entries()) {
    if (childrenIds.size === 0) continue;
    
    const [parent1Id, parent2Id] = parentPairKey.split(':');
    
    // Skip if either parent is not in our processed tree
    if (!processedReptiles.has(parent1Id) || !processedReptiles.has(parent2Id)) {
      continue;
    }
    
    // Get both parents
    const parent1 = processedReptiles.get(parent1Id)!;
    const parent2 = processedReptiles.get(parent2Id)!;
    
    // Create the list of children without descendants
    const childrenWithoutDescendants: Reptile[] = [];
    for (const childId of childrenIds) {
      const reptile = reptileMap.get(childId);
      if (reptile) {
        childrenWithoutDescendants.push(reptile);
      }
    }
    
    // Store the children in both parents to support connecting to both
    if (childrenWithoutDescendants.length > 0) {
      parent1.childrenWithoutDescendants = childrenWithoutDescendants;
      parent2.childrenWithoutDescendants = childrenWithoutDescendants;
    }
  }
  
  return rootNode;
}