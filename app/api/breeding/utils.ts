import { createClient } from '@/lib/supabase/client'
import { Hatchling } from '@/lib/types/breeding'
import { NewReptile } from '@/lib/types/reptile'

const supabase = createClient()

/**
 * Converts a hatchling to a new reptile record
 * @param hatchling The hatchling to convert
 * @param name Optional name for the reptile (defaults to "Unnamed")
 * @returns A new reptile object ready to be inserted
 */
export function hatchlingToReptile(
  hatchling: Hatchling,
  name: string = "Unnamed"
): NewReptile {
  // Get the current date for acquisition_date
  const today = new Date().toISOString().split('T')[0]
  
  return {
    name,
    species: "", // This needs to be set by the user
    morph: hatchling.morph,
    sex: hatchling.sex,
    hatch_date: today, // Use current date as hatch date
    acquisition_date: today,
    status: 'active',
    notes: hatchling.notes || null,
    parent_clutch_id: hatchling.clutch_id
  }
}

/**
 * Creates a new reptile from a hatchling
 * @param hatchling The hatchling to convert
 * @param name Optional name for the reptile
 * @returns The created reptile
 */
export async function createReptileFromHatchling(
  hatchling: Hatchling,
  name: string = "Unnamed"
) {
  const reptileData = hatchlingToReptile(hatchling, name)
  
  const { data, error } = await supabase
    .from('reptiles')
    .insert([reptileData])
    .select()
    .single()
    
  if (error) throw error
  return data
} 