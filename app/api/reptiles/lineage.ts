'use server'

import { createClient } from '@/lib/supabase/server'
import { Reptile } from '@/lib/types/reptile'

interface ReptileNode extends Reptile {
  children?: ReptileNode[]
  parents?: {
    dam?: ReptileNode | null
    sire?: ReptileNode | null
  }
}

export async function getReptileLineage(reptileId: string): Promise<ReptileNode> {
  const supabase = await createClient()
  
  // First, get the target reptile to find its parents
  const { data: mainReptile, error: mainError } = await supabase
    .from('reptiles')
    .select('*')
    .eq('id', reptileId)
    .single()

  if (mainError) throw mainError
  if (!mainReptile) throw new Error('Reptile not found')

  // Then get all related reptiles including parents and children
  const { data: reptiles, error } = await supabase
    .from('reptiles')
    .select('*')
    .or(
      `id.eq.${reptileId},` +
      `dam_id.eq.${reptileId},` +
      `sire_id.eq.${reptileId},` +
      (mainReptile.dam_id ? `id.eq.${mainReptile.dam_id},` : '') +
      (mainReptile.sire_id ? `id.eq.${mainReptile.sire_id}` : '')
    )
    .order('created_at')

  if (error) throw error
  if (!reptiles) throw new Error('No reptiles found')

  function buildFamilyTree(id: string, processed = new Set<string>()): ReptileNode | null {
    if (processed.has(id)) return null
    
    const reptile = reptiles?.find(r => r.id === id)
    if (!reptile) return null

    processed.add(id)
    
    const node: ReptileNode = {
      ...reptile,
      children: [],
      parents: {}
    }

    // Add parents if they exist
    if (reptile.dam_id) {
      node.parents!.dam = buildFamilyTree(reptile.dam_id, new Set(processed))
    }
    if (reptile.sire_id) {
      node.parents!.sire = buildFamilyTree(reptile.sire_id, new Set(processed))
    }

    // Find and add all direct offspring
    const children = reptiles?.filter(r => 
      (r.dam_id === id || r.sire_id === id) && !processed.has(r.id)
    )

    node.children = children
      ?.map(child => buildFamilyTree(child.id, new Set(processed)))
      .filter((child): child is ReptileNode => child !== null)

    return node
  }

  const familyTree = buildFamilyTree(reptileId)
  if (!familyTree) throw new Error('Could not build family tree')

  return familyTree
}