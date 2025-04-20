'use server'

import { createClient } from '@/lib/supabase/server'
import { Reptile } from '@/lib/types/reptile';
import { TargetType } from '@/lib/types/feeding';

interface ReptileWithDetails extends Reptile {
  species_name?: string;
  morph_name?: string;
}

export async function getReptilesByLocation(
  locationType: 'room' | 'rack' | 'level' | 'location',
  locationId: string
): Promise<ReptileWithDetails[]> {
  const supabase = await createClient();

  try {
    console.log(`Server: Fetching reptiles by ${locationType} with ID ${locationId}`);
    
    // For room, rack, or level, we need to get location IDs first
    let locationIds: string[] = [];
    
    if (locationType === 'location') {
      // For direct location query we just use the locationId
      locationIds = [locationId];
    } 
    else if (locationType === 'room') {
      console.log(`Server: Querying locations for room_id: ${locationId}`);
      
      // Get all locations in this room
      const { data: locations, error } = await supabase
        .from('locations')
        .select('id, label')
        .eq('room_id', locationId);
      
      if (error) {
        console.error('Error fetching locations by room:', error);
        throw error;
      }
      
      console.log(`Server: Found ${locations?.length || 0} locations in room:`, locations);
      locationIds = locations?.map(loc => loc.id) || [];
    } 
    else if (locationType === 'rack') {
      // Get all locations in this rack
      const { data: locations, error } = await supabase
        .from('locations')
        .select('id')
        .eq('rack_id', locationId);
      
      if (error) {
        console.error('Error fetching locations by rack:', error);
        throw error;
      }
      
      locationIds = locations?.map(loc => loc.id) || [];
    } 
    else if (locationType === 'level') {
      // For level (format is "rackId-levelNumber")
      const [rackId, levelNumber] = locationId.split('-');
      
      const { data: locations, error } = await supabase
        .from('locations')
        .select('id')
        .eq('rack_id', rackId)
        .eq('shelf_level', levelNumber);
      
      if (error) {
        console.error('Error fetching locations by level:', error);
        throw error;
      }
      
      locationIds = locations?.map(loc => loc.id) || [];
    }
    
    if (locationIds.length === 0) {
      console.log(`Server: No locations found for ${locationType} ${locationId}`);
      return [];
    }
    
    // Get reptiles for these location IDs
    console.log(`Server: Querying reptiles for location IDs: ${locationIds.join(', ')}`);
    
    const { data: reptiles, error } = await supabase
      .from('reptiles')
      .select('*')
      .in('location_id', locationIds)
      .order('name');
    
    if (error) {
      console.error('Error fetching reptiles by locations:', error);
      throw error;
    }
    
    if (!reptiles || reptiles.length === 0) {
      console.log(`Server: No reptiles found for ${locationType}`);
      return [];
    }
    
    console.log(`Server: Found ${reptiles.length} reptiles for ${locationType}`);
    
    // Get species and morphs for the reptiles in separate queries
    const speciesIds = reptiles.map(reptile => reptile.species_id).filter(Boolean);
    const morphIds = reptiles.map(reptile => reptile.morph_id).filter(Boolean);
    
    let speciesMap: Record<string, string> = {};
    let morphMap: Record<string, string> = {};
    
    // Fetch species data if we have any species IDs
    if (speciesIds.length > 0) {
      const { data: species, error: speciesError } = await supabase
        .from('species')
        .select('id, name')
        .in('id', speciesIds);
      
      if (speciesError) {
        console.error('Error fetching species:', speciesError);
      } else if (species) {
        // Create a map of species id to name
        speciesMap = species.reduce((map, s) => {
          map[s.id] = s.name;
          return map;
        }, {} as Record<string, string>);
      }
    }
    
    // Fetch morph data if we have any morph IDs
    if (morphIds.length > 0) {
      const { data: morphs, error: morphsError } = await supabase
        .from('morphs')
        .select('id, name')
        .in('id', morphIds);
      
      if (morphsError) {
        console.error('Error fetching morphs:', morphsError);
      } else if (morphs) {
        // Create a map of morph id to name
        morphMap = morphs.reduce((map, m) => {
          map[m.id] = m.name;
          return map;
        }, {} as Record<string, string>);
      }
    }
    
    // Enhance reptiles with species and morph names
    const reptilesWithDetails = reptiles.map(reptile => ({
      ...reptile,
      species_name: reptile.species_id ? speciesMap[reptile.species_id] || 'Unknown' : 'Unknown',
      morph_name: reptile.morph_id ? morphMap[reptile.morph_id] || 'Unknown' : 'Unknown'
    }));
    
    console.log(`Server: Successfully processed reptile details`);
    return reptilesWithDetails;
  } catch (error) {
    console.error('Error in getReptilesByLocation:', error);
    throw error;
  }
} 