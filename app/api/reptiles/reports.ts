import { createClient } from '@/lib/supabase/client';
import { Organization } from '@/lib/types/organizations';

export interface ReptileReportData {
  totalReptiles: number;
  speciesDistribution: { name: string; count: number; value: number }[];
  statusDistribution: { status: string; count: number }[];
  ageDistribution: { range: string; count: number }[];
  breedingStats: {
    totalBreeders: number;
    activeBreeders: number;
    retiredBreeders: number;
  };
  growthStats: {
    averageWeight: number;
    averageLength: number;
    weightTrends: { date: string; averageWeight: number }[];
  };
  valueStats: {
    totalValue: number;
    averageValue: number;
    valueBySpecies: { species: string; value: number }[];
    valueByStatus: { status: string; value: number }[];
  };
}

export async function getReptileReportData(organization : Organization): Promise<ReptileReportData> {
  const supabase =  createClient();

  // Get all reptiles with their details
  const { data: reptiles, error } = await supabase
    .from('reptiles')
    .select(`
      *,
      species:species_id (name),
      morph:morph_id (name)
    `)
    .eq('org_id', organization.id);

  if (error) throw error;
  if (!reptiles || reptiles.length === 0) {
    return {
      totalReptiles: 0,
      speciesDistribution: [],
      statusDistribution: [],
      ageDistribution: [],
      breedingStats: {
        totalBreeders: 0,
        activeBreeders: 0,
        retiredBreeders: 0
      },
      growthStats: {
        averageWeight: 0,
        averageLength: 0,
        weightTrends: []
      },
      valueStats: {
        totalValue: 0,
        averageValue: 0,
        valueBySpecies: [],
        valueByStatus: []
      }
    };
  }

  // Calculate species distribution with values
  const speciesData = new Map<string, { count: number; value: number }>();
  reptiles.forEach(reptile => {
    const speciesName = reptile.species?.name || 'Unknown';
    const current = speciesData.get(speciesName) || { count: 0, value: 0 };
    speciesData.set(speciesName, {
      count: current.count + 1,
      value: current.value + (reptile.price || 0)
    });
  });

  const speciesDistribution = Array.from(speciesData.entries())
    .map(([name, data]) => ({ name, count: data.count, value: data.value }))
    .sort((a, b) => b.count - a.count);

  // Calculate status distribution
  const statusCounts = new Map<string, number>();
  reptiles.forEach(reptile => {
    statusCounts.set(reptile.status, (statusCounts.get(reptile.status) || 0) + 1);
  });

  const statusDistribution = Array.from(statusCounts.entries())
    .map(([status, count]) => ({ status, count }));

  // Calculate age distribution
  const now = new Date();
  const ageRanges = {
    '0-6 months': 0,
    '6-12 months': 0,
    '1-2 years': 0,
    '2-5 years': 0,
    '5+ years': 0
  };

  reptiles.forEach(reptile => {
    if (reptile.hatch_date) {
      const ageInMonths = (now.getTime() - new Date(reptile.hatch_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (ageInMonths <= 6) ageRanges['0-6 months']++;
      else if (ageInMonths <= 12) ageRanges['6-12 months']++;
      else if (ageInMonths <= 24) ageRanges['1-2 years']++;
      else if (ageInMonths <= 60) ageRanges['2-5 years']++;
      else ageRanges['5+ years']++;
    }
  });

  const ageDistribution = Object.entries(ageRanges)
    .map(([range, count]) => ({ range, count }));

  // Calculate breeding stats
  const breedingStats = {
    totalBreeders: reptiles.filter(r => r.is_breeder).length,
    activeBreeders: reptiles.filter(r => r.is_breeder && !r.retired_breeder).length,
    retiredBreeders: reptiles.filter(r => r.retired_breeder).length
  };

  // Calculate growth stats
  const validWeights = reptiles.filter(r => r.weight > 0).map(r => r.weight);
  const validLengths = reptiles.filter(r => r.length > 0).map(r => r.length);

  const growthStats = {
    averageWeight: validWeights.length > 0 
      ? validWeights.reduce((a, b) => a + b, 0) / validWeights.length 
      : 0,
    averageLength: validLengths.length > 0 
      ? validLengths.reduce((a, b) => a + b, 0) / validLengths.length 
      : 0,
    weightTrends: [] // This would need to be calculated from growth entries if available
  };

  // Calculate value stats
  const totalValue = reptiles.reduce((sum, reptile) => sum + (reptile.price || 0), 0);
  const valueBySpecies = Array.from(speciesData.entries())
    .map(([species, data]) => ({ species, value: data.value }))
    .sort((a, b) => b.value - a.value);

  const statusValueMap = reptiles.reduce((acc, reptile) => {
    const status = reptile.status;
    acc.set(status, (acc.get(status) || 0) + (reptile.price || 0));
    return acc;
  }, new Map<string, number>());

  const valueByStatus = Array.from(statusValueMap.entries())
    .map((entry) => {
      const [status, value] = entry as [string, number];
      return { status, value };
    });

  return {
    totalReptiles: reptiles.length,
    speciesDistribution,
    statusDistribution,
    ageDistribution,
    breedingStats,
    growthStats,
    valueStats: {
      totalValue,
      averageValue: totalValue / reptiles.length,
      valueBySpecies,
      valueByStatus
    }
  };
} 