import { createClient } from '@/lib/supabase/client';
import { startOfDay, endOfDay } from 'date-fns';

export interface FeedingReportData {
  totalFeedings: number;
  mostFedSpecies: { name: string; count: number }[];
  mostUsedFoodTypes: { name: string; count: number }[];
  successRate: number;
  refusalRate: number;
  feedingTrends: { date: string; count: number }[];
  feederTrends: { name: string; count: number }[];
}

export async function getFeedingReportData(
  dateRange?: { startDate?: string; endDate?: string }
): Promise<FeedingReportData> {
  const supabase = await createClient();

  // Build base query for feeding events
  let query = supabase
    .from('feeding_events')
    .select(`
      *,
      reptiles!reptile_id (
        id,
        name,
        species_id,
        morph_id
      ),
      feeder_sizes!feeder_size_id (
        id,
        name,
        feeder_types (
          id,
          name
        )
      )
    `);

  // Apply date filtering if range is provided
  if (dateRange) {
    if (dateRange.startDate) {
      query = query.gte('scheduled_date', startOfDay(new Date(dateRange.startDate)).toISOString());
    }
    if (dateRange.endDate) {
      query = query.lte('scheduled_date', endOfDay(new Date(dateRange.endDate)).toISOString());
    }
  }

  const { data: events, error } = await query;

  if (error) throw error;
  if (!events || events.length === 0) {
    return {
      totalFeedings: 0,
      mostFedSpecies: [],
      mostUsedFoodTypes: [],
      successRate: 0,
      refusalRate: 0,
      feedingTrends: [],
      feederTrends: []
    };
  }

  // Get species data
  const speciesIds = [...new Set(events.map(e => e.reptiles?.species_id).filter(Boolean))];
  const { data: species } = await supabase
    .from('species')
    .select('id, name')
    .in('id', speciesIds);

  const speciesMap = new Map(species?.map(s => [s.id, s.name]) || []);

  // Calculate statistics
  const totalFeedings = events.length;
  const fedCount = events.filter(e => e.fed).length;
  const successRate = (fedCount / totalFeedings) * 100;
  const refusalRate = 100 - successRate;

  // Calculate most fed species
  const speciesCounts = new Map<string, number>();
  events.forEach(event => {
    const speciesId = event.reptiles?.species_id;
    if (speciesId) {
      const count = speciesCounts.get(speciesId) || 0;
      speciesCounts.set(speciesId, count + 1);
    }
  });

  const mostFedSpecies = Array.from(speciesCounts.entries())
    .map(([id, count]) => ({
      name: speciesMap.get(id) || 'Unknown',
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate most used food types
  const foodTypeCounts = new Map<string, number>();
  events.forEach(event => {
    const foodType = event.feeder_sizes?.feeder_types?.name;
    if (foodType) {
      const count = foodTypeCounts.get(foodType) || 0;
      foodTypeCounts.set(foodType, count + 1);
    }
  });

  const mostUsedFoodTypes = Array.from(foodTypeCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate feeding trends (daily counts)
  const feedingTrends = new Map<string, number>();
  events.forEach(event => {
    const date = event.scheduled_date.split('T')[0];
    const count = feedingTrends.get(date) || 0;
    feedingTrends.set(date, count + 1);
  });

  const feedingTrendsArray = Array.from(feedingTrends.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate feeder trends
  const feederTrends = Array.from(foodTypeCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalFeedings,
    mostFedSpecies,
    mostUsedFoodTypes,
    successRate,
    refusalRate,
    feedingTrends: feedingTrendsArray,
    feederTrends
  };
} 