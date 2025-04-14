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

export async function getReptileLineage(reptileId: string): Promise<ReptileNode> {
  const supabase = await createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  // Fetch all reptiles for the user
  const { data: reptiles, error } = await supabase
    .from('reptiles')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to fetch reptiles: ${error.message}`);
  if (!reptiles || reptiles.length === 0) throw new Error('No reptiles found');

  // Cache reptiles by ID for quick lookup
  const reptileMap = new Map<string, Reptile>(reptiles.map((r) => [r.id, r]));

  function buildFamilyTree(id: string, visited = new Set<string>()): ReptileNode | null {
    if (!reptileMap.has(id)) return null;
    if (visited.has(id)) return null; // Prevent cycles in this path

    const reptile = reptileMap.get(id)!;
    visited.add(id);

    const node: ReptileNode = {
      ...reptile,
      children: [],
      parents: { dam: null, sire: null },
    };

    // Build parents
    if (reptile.dam_id) {
      node.parents.dam = buildFamilyTree(reptile.dam_id, new Set(visited));
    }
    if (reptile.sire_id) {
      node.parents.sire = buildFamilyTree(reptile.sire_id, new Set(visited));
    }

    // Build children
    const children = reptiles.filter((r) => r.dam_id === id || r.sire_id === id);
    node.children = children
      .map((child) => buildFamilyTree(child.id, new Set(visited)))
      .filter((child): child is ReptileNode => child !== null);

    return node;
  }

  const familyTree = buildFamilyTree(reptileId);
  if (!familyTree) throw new Error('Reptile not found or invalid lineage');

  return familyTree;
}