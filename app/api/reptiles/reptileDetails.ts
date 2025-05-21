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
  if (!reptileData) throw new Error('Reptile not found')

  // Parallel fetch of species, morph, and location data
  const [speciesResult, morphResult, locationResult] = await Promise.all([
    supabase
      .from('species')
      .select('id, name')
      .eq('id', reptileData.species_id)
      .single(),
    supabase
      .from('morphs')
      .select('id, name')
      .eq('id', reptileData.morph_id)
      .single(),
    supabase
      .from('locations')
      .select('id, label')
      .eq('id', reptileData.location_id)
      .single()
  ]);

  const speciesData = speciesResult.data;
  const morphData = morphResult.data;
  const locationData = locationResult.data;

  // Parallel fetch of independent data
  const [
    growthResult,
    healthResult,
    breedingSireResult,
    breedingDamResult,
    offspringResult,
    feedingResult,
    sheddingResult
  ] = await Promise.all([
    supabase
      .from('growth_entries')
      .select('*')
      .eq('reptile_id', id)
      .order('date', { ascending: false }),
    supabase
      .from('health_log_entries')
      .select('*')
      .eq('reptile_id', id)
      .order('date', { ascending: false }),
    supabase
      .from('breeding_projects')
      .select('*')
      .eq('male_id', id)
      .order('start_date', { ascending: false }),
    supabase
      .from('breeding_projects')
      .select('*')
      .eq('female_id', id)
      .order('start_date', { ascending: false }),
    supabase
      .from('reptiles')
      .select('*')
      .or(`dam_id.eq.${id},sire_id.eq.${id}`)
      .order('hatch_date', { ascending: false }),
    supabase
      .from('feeding_events')
      .select('*')
      .eq('reptile_id', id)
      .order('scheduled_date', { ascending: false })
      .limit(50),
    supabase
      .from('shedding')
      .select('*')
      .eq('reptile_id', id)
      .order('shed_date', { ascending: false })
  ]);

  // Check for errors in parallel queries
  if (growthResult.error) throw growthResult.error;
  if (healthResult.error) throw healthResult.error;
  if (breedingSireResult.error) throw breedingSireResult.error;
  if (breedingDamResult.error) throw breedingDamResult.error;
  if (offspringResult.error) throw offspringResult.error;
  if (feedingResult.error) throw feedingResult.error;
  if (sheddingResult.error) throw sheddingResult.error;

  // Get breeding project IDs for clutch lookup
  const breedingProjectIds = [
    ...(breedingSireResult.data || []).map(bp => bp.id),
    ...(breedingDamResult.data || []).map(bp => bp.id)
  ];

  // Fetch clutches if there are breeding projects
  let clutches: Clutch[] = [];
  if (breedingProjectIds.length > 0) {
    const { data: clutchData, error: clutchError } = await supabase
      .from('clutches')
      .select('*')
      .in('breeding_project_id', breedingProjectIds)
      .order('lay_date', { ascending: false });

    if (clutchError) throw clutchError;
    clutches = clutchData || [];
  }

  // Enhance health logs with category, subcategory, and type data in parallel
  const healthLogs = await Promise.all((healthResult.data || []).map(async (log) => {
    const [categoryResult, subcategoryResult, typeResult] = await Promise.all([
      log.category_id ? supabase
        .from('health_log_categories')
        .select('label')
        .eq('id', log.category_id)
        .single() : Promise.resolve({ data: null, error: null }),
      log.subcategory_id ? supabase
        .from('health_log_subcategories')
        .select('label')
        .eq('id', log.subcategory_id)
        .single() : Promise.resolve({ data: null, error: null }),
      log.type_id ? supabase
        .from('health_log_types')
        .select('label')
        .eq('id', log.type_id)
        .single() : Promise.resolve({ data: null, error: null })
    ]);

    return {
      ...log,
      category: categoryResult.data,
      subcategory: subcategoryResult.data,
      type: typeResult.data
    };
  }));

  // Construct the detailed reptile object
  const detailedReptile: DetailedReptile = {
    ...reptileData,
    species_name: speciesData?.name || "Unknown Species",
    morph_name: morphData?.name || "Unknown Morph",
    location_label: locationData?.label,
    growth_history: growthResult.data || [],
    health_logs: healthLogs || [],
    breeding_projects_as_sire: breedingSireResult.data || [],
    breeding_projects_as_dam: breedingDamResult.data || [],
    clutches: clutches || [],
    feeding_history: feedingResult.data || [],
    offspring: offspringResult.data || [],
    shedding_records: sheddingResult.data || []
  }

  return detailedReptile
} 