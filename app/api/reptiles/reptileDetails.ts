import { createClient } from '@/lib/supabase/client'
import { GrowthEntry } from '@/lib/types/growth'
import { Reptile } from '@/lib/types/reptile'
import { BreedingProject, Clutch } from '@/lib/types/breeding'
import { FeedingEvent } from '@/lib/types/feeding'
import { HealthLogEntryWithCategory } from '@/lib/types/health'
import { Shedding } from '@/lib/types/shedding'

export interface DetailedReptile extends Reptile {
  species_name: string
  morph_name: string
  location_label?: string
  growth_history: GrowthEntry[]
  health_logs: HealthLogEntryWithCategory[]
  breeding_projects_as_sire: BreedingProject[]
  breeding_projects_as_dam: BreedingProject[]
  clutches: Clutch[]
  feeding_history: FeedingEvent[]
  offspring: Reptile[]
  shedding_records: Shedding[]
}

export async function getReptileDetails(id: string): Promise<DetailedReptile> {
  const supabase = await createClient()
  
  // Get base reptile data with species, morph, and location info
  const { data: reptileData, error } = await supabase
    .from('reptiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  // Get species, morph and location data separately
  let speciesData = null;
  try {
    const { data } = await supabase
      .from('species')
      .select('id, name')
      .eq('id', reptileData.species_id)
      .single();
    speciesData = data;
  } catch (err) {
    console.error("Error fetching species:", err);
  }
    
  let morphData = null;
  try {
    const { data } = await supabase
      .from('morphs')
      .select('id, name')
      .eq('id', reptileData.morph_id)
      .single();
    morphData = data;
  } catch (err) {
    console.error("Error fetching morph:", err);
  }
    
  let locationData = null;
  try {
    const { data } = await supabase
      .from('locations')
      .select('id, label')
      .eq('id', reptileData.location_id)
      .single();
    locationData = data;
  } catch (err) {
    console.error("Error fetching location:", err);
  }

  // Get growth history
  const { data: growthHistory, error: growthError } = await supabase
    .from('growth_entries')
    .select('*')
    .eq('reptile_id', id)
    .order('date', { ascending: false })

  if (growthError) throw growthError

  // Get health logs
  const { data: healthLogsRaw, error: healthError } = await supabase
    .from('health_log_entries')
    .select('*')
    .eq('reptile_id', id)
    .order('date', { ascending: false })

  if (healthError) throw healthError

  // Enhance health logs with category, subcategory, and type data
  const healthLogs = await Promise.all((healthLogsRaw || []).map(async (log) => {
    let category = null;
    let subcategory = null;
    let type = null;

    try {
      if (log.category_id) {
        const { data } = await supabase
          .from('health_log_categories')
          .select('label')
          .eq('id', log.category_id)
          .single();
        category = data;
      }
    } catch (err) {
      console.error("Error fetching health category:", err);
    }

    try {
      if (log.subcategory_id) {
        const { data } = await supabase
          .from('health_log_subcategories')
          .select('label')
          .eq('id', log.subcategory_id)
          .single();
        subcategory = data;
      }
    } catch (err) {
      console.error("Error fetching health subcategory:", err);
    }

    try {
      if (log.type_id) {
        const { data } = await supabase
          .from('health_log_types')
          .select('label')
          .eq('id', log.type_id)
          .single();
        type = data;
      }
    } catch (err) {
      console.error("Error fetching health type:", err);
    }

    return {
      ...log,
      category,
      subcategory,
      type
    };
  }));

  // Get breeding projects where this reptile is the sire
  const { data: breedingProjectsAsSire, error: sireError } = await supabase
    .from('breeding_projects')
    .select('*')
    .eq('male_id', id)
    .order('start_date', { ascending: false })

  if (sireError) throw sireError

  // Get breeding projects where this reptile is the dam
  const { data: breedingProjectsAsDam, error: damError } = await supabase
    .from('breeding_projects')
    .select('*')
    .eq('female_id', id)
    .order('start_date', { ascending: false })

  if (damError) throw damError

  // Get clutches from breeding projects
  const breedingProjectIds = [
    ...breedingProjectsAsSire.map(bp => bp.id),
    ...breedingProjectsAsDam.map(bp => bp.id)
  ]

  let clutches: Clutch[] = []
  if (breedingProjectIds.length > 0) {
    const { data: clutchData, error: clutchError } = await supabase
      .from('clutches')
      .select('*')
      .in('breeding_project_id', breedingProjectIds)
      .order('lay_date', { ascending: false })

    if (clutchError) throw clutchError
    clutches = clutchData
  }

  // Get offspring (reptiles where this reptile is the dam or sire)
  const { data: offspring, error: offspringError } = await supabase
    .from('reptiles')
    .select('*')
    .or(`dam_id.eq.${id},sire_id.eq.${id}`)
    .order('hatch_date', { ascending: false })

  if (offspringError) throw offspringError

  // Get feeding history
  const { data: feedingHistory, error: feedingError } = await supabase
    .from('feeding_events')
    .select('*')
    .eq('reptile_id', id)
    .order('scheduled_date', { ascending: false })
    .limit(50)

  if (feedingError) throw feedingError

  // Get shedding records
  const { data: sheddingRecords, error: sheddingError } = await supabase
    .from('shedding')
    .select('*')
    .eq('reptile_id', id)
    .order('shed_date', { ascending: false })

  if (sheddingError) throw sheddingError

  // Construct the detailed reptile object
  const detailedReptile: DetailedReptile = {
    ...reptileData,
    species_name: speciesData?.name || "Unknown Species",
    morph_name: morphData?.name || "Unknown Morph",
    location_label: locationData?.label,
    growth_history: growthHistory || [],
    health_logs: healthLogs || [],
    breeding_projects_as_sire: breedingProjectsAsSire || [],
    breeding_projects_as_dam: breedingProjectsAsDam || [],
    clutches: clutches || [],
    feeding_history: feedingHistory || [],
    offspring: offspring || [],
    shedding_records: sheddingRecords || []
  }

  return detailedReptile
} 