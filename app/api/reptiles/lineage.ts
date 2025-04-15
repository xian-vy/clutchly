'use server';

import { createClient } from '@/lib/supabase/server';
import { Reptile } from '@/lib/types/reptile';

interface ReptileNode extends Reptile {
  children: ReptileNode[];
  parents: {
    dam: ReptileNode | null;
    sire: ReptileNode | null;
  };
}

export async function getReptileLineage(reptileId: string, cachedReptiles?: Reptile[]): Promise<ReptileNode> {
  let reptiles: Reptile[] = cachedReptiles || [];

  // Only fetch if no cached data provided
  if (!cachedReptiles) {
    const supabase = await createClient();
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
      .from('reptiles')
      .select('*')
      .eq('user_id', userId);

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
  
  // Now add children relationships with a separate non-recursive approach
  // to avoid stack overflows
  const addedChildRelations = new Set<string>();
  
  for (const reptile of reptiles) {
    if (reptile.dam_id || reptile.sire_id) {
      const childNode = processedReptiles.get(reptile.id);
      
      // Skip if this reptile wasn't included in our tree
      if (!childNode) continue;
      
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
  
  return rootNode;
}