
import { createClient } from '@/lib/supabase/client'
import { CreateGrowthEntryInput } from '@/lib/types/growth'
import { NewReptile, Reptile } from '@/lib/types/reptile'
import { createFeedingEventForNewLocation } from '@/app/api/feeding/events'
import { generateReptileCode, getSpeciesCode } from '@/components/dashboard/reptiles/utils'
import { getUserAndOrganizationInfo } from '../utils_client'

export async function getReptiles() {
  const supabase =  createClient()
  const { organization } = await getUserAndOrganizationInfo()
  const { data: reptiles, error } = await supabase
    .from('reptiles')
    .select('*')
    .eq('org_id', organization.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return reptiles as Reptile[]
}

export async function getReptileById(id: string) {
  const supabase = await createClient()
  
  const { data: reptile, error } = await supabase
    .from('reptiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return reptile as Reptile
}

// In createReptile function, after creating the reptile:
export async function createReptile(reptile: NewReptile) {
  const supabase =  createClient()
  const { organization } = await getUserAndOrganizationInfo()


  // If a reptile_code is not provided or is empty, generate one
  if (!reptile.reptile_code || reptile.reptile_code.trim() === '') {
    // First, get all existing reptiles for sequence number generation
    const { data: existingReptiles } = await supabase
      .from('reptiles')
      .select('*')
    
    // Get species info for generating the code
    const { data: speciesInfo } = await supabase
      .from('species')
      .select('name')
      .eq('id', reptile.species_id)
      .single()
    
    // Get morph info for the name
    const { data: morphInfo } = await supabase
      .from('morphs')
      .select('name')
      .eq('id', reptile.morph_id)
      .single()
    
    if (speciesInfo && morphInfo) {
      const speciesCode = getSpeciesCode(speciesInfo.name)
      reptile.reptile_code = generateReptileCode(
        existingReptiles as Reptile[],
        speciesCode,
        morphInfo.name,
        reptile.hatch_date,
        reptile.sex
      )
    }
  }

  const newReptile = {
    ...reptile,
    org_id : organization.id,
  }
  const { data, error } = await supabase
    .from('reptiles')
    .insert([newReptile])
    .select()
    .single()

    if (error) {
      console.error("Error creating reptile :", error.message)
      throw error
    }

    const newReptileGrowth : CreateGrowthEntryInput = {
      reptile_id: data.id,
      org_id: organization.id || '',
      date: new Date().toISOString(), 
      weight: data.weight,
      length: data.length,
      notes: "",
      attachments: [],
    }

    const {error : growthError} = await supabase
    .from('growth_entries')
    .insert([newReptileGrowth])

  if (growthError) {
    console.error("Error creating growth after reptile :", growthError.message)
    throw error
  }
  
  // If a location is assigned, update the location availability status
  if (data.location_id) {
    const { error: locationError } = await supabase
      .from('locations')
      .update({ is_available: false })
      .eq('id', data.location_id)
    
    if (locationError) {
      console.error("Error updating location availability:", locationError.message)
    }
  }
  
  // After successful creation and location update
  if (data.location_id) {
    try {
      await createFeedingEventForNewLocation(data.id, data.location_id);
    } catch (error) {
      console.error("Error creating feeding event for new reptile:", error);
      // Don't throw the error as this is a non-critical operation
    }
  }
  
  return data as Reptile;
}

// In updateReptile function, after updating the reptile:
export async function updateReptile(id: string, updates: Partial<NewReptile>) {
  const supabase = await createClient()
  
  // First, get the current reptile to check for location changes
  const { data: currentReptile, error: fetchError } = await supabase
    .from('reptiles')
    .select('location_id, species_id, morph_id, sex, hatch_date')
    .eq('id', id)
    .single()
    
  if (fetchError) throw fetchError
  
  // Check if we need to regenerate the reptile_code
  // This happens if species_id, morph_id, sex, or hatch_date changed
  const shouldRegenerateCode = 
    (updates.species_id && updates.species_id !== currentReptile.species_id) ||
    (updates.morph_id && updates.morph_id !== currentReptile.morph_id) ||
    (updates.sex && updates.sex !== currentReptile.sex) ||
    (updates.hatch_date && updates.hatch_date !== currentReptile.hatch_date);
  
  // If key fields changed, regenerate the reptile_code
  if (shouldRegenerateCode) {
    // Get species info 
    const speciesId = updates.species_id || currentReptile.species_id;
    const { data: speciesInfo } = await supabase
      .from('species')
      .select('name')
      .eq('id', speciesId)
      .single()
    
    // Get morph info
    const morphId = updates.morph_id || currentReptile.morph_id;
    const { data: morphInfo } = await supabase
      .from('morphs')
      .select('name')
      .eq('id', morphId)
      .single()
    
    if (speciesInfo && morphInfo) {
      const speciesCode = getSpeciesCode(speciesInfo.name);
      
      // When updating, we should preserve the sequence number if possible
      // First see if we can extract it from the existing code
      let sequenceNumber = "00001"; // default
      const currentReptileWithDetails = await supabase
        .from('reptiles')
        .select('reptile_code')
        .eq('id', id)
        .single();
      
      if (currentReptileWithDetails?.data?.reptile_code) {
        const parts = currentReptileWithDetails.data.reptile_code.split('-');
        if (parts.length >= 1) {
          // Use the existing sequence number
          sequenceNumber = parts[0];
        }
      }
      
      // Generate the code while preserving the sequence number
      const hatchYear = updates.hatch_date || currentReptile.hatch_date 
        ? new Date(updates.hatch_date || currentReptile.hatch_date).getFullYear().toString().slice(-2)
        : new Date().getFullYear().toString().slice(-2);
        
      const sex = updates.sex || currentReptile.sex;
      const sexCode = sex === 'male' ? 'M' : sex === 'female' ? 'F' : 'U';
        // Get first 5 letters of morph name (uppercase), removing spaces
      const cleanedMorphName = morphInfo.name.replace(/\s+/g, '');
      const morphCode = cleanedMorphName.substring(0, 5).toUpperCase();
      
      updates.reptile_code = `${sequenceNumber}-${speciesCode}-${morphCode}-${hatchYear}-${sexCode}`;
    }
  }
  
  const { data, error } = await supabase
    .from('reptiles')
    .update({ ...updates, last_modified: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  // Handle location changes if needed
  if (updates.location_id !== undefined && 
      currentReptile.location_id !== updates.location_id) {
    // If the old location exists, mark it as available
    if (currentReptile.location_id) {
      await supabase
        .from('locations')
        .update({ is_available: true })
        .eq('id', currentReptile.location_id)
    }
    
    // If a new location is assigned, mark it as unavailable
    if (updates.location_id) {
      await supabase
        .from('locations')
        .update({ is_available: false })
        .eq('id', updates.location_id)

      // Add feeding event for the new location
      try {
        await createFeedingEventForNewLocation(id, updates.location_id);
      } catch (error) {
        console.error("Error creating feeding event for updated reptile:", error);
        // Don't throw the error as this is a non-critical operation
      }
    }
  }
  
  return data as Reptile
}

export async function deleteReptile(id: string): Promise<void> {
  const supabase = await createClient()
  
  // First, get the reptile's location ID if it exists
  const { data: reptile, error: fetchError } = await supabase
    .from('reptiles')
    .select('location_id')
    .eq('id', id)
    .single()
    
  if (fetchError) throw fetchError
  
  const { error } = await supabase
    .from('reptiles')
    .delete()
    .eq('id', id)

  if (error) throw error
  
  // If the reptile had a location, mark it as available again
  if (reptile.location_id) {
    await supabase
      .from('locations')
      .update({ is_available: true })
      .eq('id', reptile.location_id)
  }
} 

export async function getReptileByClutchId(clutch_id: string) {
  const supabase = await createClient()
  
  const { data: reptile, error } = await supabase
    .from('reptiles')
    .select('*')
    .eq('parent_clutch_id', clutch_id)

  if (error) throw error
  return reptile as Reptile[]
}

