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
  
  // Global visited set to prevent reptiles from appearing multiple times
  const globalVisited = new Set<string>();

  function buildFamilyTree(id: string, depth = 0, maxDepth = 10): ReptileNode | null {
    // Safety check to prevent infinite recursion
    if (depth > maxDepth) return null;
    
    if (!reptileMap.has(id)) return null;
    if (globalVisited.has(id)) return null; // Prevent cycles globally

    const reptile = reptileMap.get(id)!;
    globalVisited.add(id);

    const node: ReptileNode = {
      ...reptile,
      children: [],
      parents: { dam: null, sire: null },
    };

    // Build parents only if we haven't reached max depth
    if (depth < maxDepth) {
      if (reptile.dam_id && reptileMap.has(reptile.dam_id)) {
        node.parents.dam = buildFamilyTree(reptile.dam_id, depth + 1, maxDepth);
      }
      
      if (reptile.sire_id && reptileMap.has(reptile.sire_id)) {
        node.parents.sire = buildFamilyTree(reptile.sire_id, depth + 1, maxDepth);
      }
    }

    // Find direct children (where this reptile is either dam or sire)
    // Do not add children if they're already in the tree
    if (depth < maxDepth) {
      const childrenReptiles = reptiles.filter(
        (r) => (r.dam_id === id || r.sire_id === id) && !globalVisited.has(r.id)
      );
      
      for (const child of childrenReptiles) {
        const childNode = buildFamilyTree(child.id, depth + 1, maxDepth);
        if (childNode) node.children.push(childNode);
      }
    }

    return node;
  }

  // Find the root reptile and build the tree
  const familyTree = buildFamilyTree(reptileId);
  if (!familyTree) throw new Error('Reptile not found or invalid lineage');

  // Reset the global visited set to allow for proper tree traversal when rendering
  globalVisited.clear();
  
  return familyTree;
}