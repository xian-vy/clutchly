'use client';

import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { getHealthLogs, getHealthLogsByDate } from '@/app/api/health/entries';
import { getGrowthEntries, getGrowthEntriesByDate } from '@/app/api/growth/entries';
import { getBreedingProjects, getBreedingProjectsByDate } from '@/app/api/breeding/projects';
import { getClutches, getAllClutchesByDate } from '@/app/api/breeding/clutches';
import { useResource } from '@/lib/hooks/useResource';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { Reptile, NewReptile } from '@/lib/types/reptile';
import { Clutch } from '@/lib/types/breeding';
import { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { FilterX, Loader2 } from 'lucide-react';
import { StatsCards } from './StatsCards';
import { ActionItems } from './ActionItems';
import { RecentActivity } from './RecentActivity';
import { CollectionOverview } from './CollectionOverview';
import { DateRangePicker } from './DateRangePicker';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeedingOverview } from './FeedingOverview';
import { getFeedingSchedules } from '@/app/api/feeding/schedule';

export function DashboardOverviewTab() {
  const [allClutches, setAllClutches] = useState<Clutch[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Format date string for API calls
  const formatDateForApi = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Get reptiles data using useResource hook
  const {
    resources: reptiles,
    isLoading: reptilesLoading,
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: createReptile,
    updateResource: updateReptile,
    deleteResource: deleteReptile,
  });
  
  // Get species and morph data from their respective stores
  const { species, isLoading: speciesLoading,fetchSpecies } = useSpeciesStore();
  const { morphs, isLoading: morphsLoading, fetchMorphs} = useMorphsStore();

  
  useEffect(() => {
    fetchSpecies();
    fetchMorphs();
  }, [])
  
  // Create date filter params for API calls
  const dateFilterParams = useMemo(() => {
    if (!dateRange) return undefined;
    return {
      startDate: dateRange.from ? formatDateForApi(dateRange.from) : undefined,
      endDate: dateRange.to ? formatDateForApi(dateRange.to) : undefined,
    };
  }, [dateRange]);
  // Fetch health logs using React Query with date filtering
  const { data: healthLogs = [], isLoading: healthLoading } = useQuery({
    queryKey: ['health-logs', dateFilterParams],
    queryFn: () => dateFilterParams 
      ? getHealthLogsByDate(dateFilterParams) 
      : getHealthLogs(),
  });
  
  // Fetch growth entries using React Query with date filtering
  const { data: growthEntries = [], isLoading: growthLoading } = useQuery({
    queryKey: ['growth-entries', dateFilterParams],
    queryFn: () => dateFilterParams 
      ? getGrowthEntriesByDate(dateFilterParams) 
      : getGrowthEntries(),
  });
  
  // Fetch breeding projects using React Query with date filtering
  const { data: breedingProjects = [], isLoading: breedingLoading } = useQuery({
    queryKey: ['breeding-projects', dateFilterParams],
    queryFn: () => dateFilterParams 
      ? getBreedingProjectsByDate({ 
          ...dateFilterParams, 
          dateField: 'start_date' 
        }) 
      : getBreedingProjects(),
  });

  // Fetch feeding schedules using React Query
  const { data: feedingSchedules = [], isLoading: feedingLoading } = useQuery({
    queryKey: ['feeding-schedules'],
    queryFn: getFeedingSchedules
  });
  
  // Fetch clutches for all breeding projects
  useEffect(() => {
    async function fetchAllClutches() {
      try {
        if (dateFilterParams) {
          const clutches = await getAllClutchesByDate(dateFilterParams);
          setAllClutches(clutches);
        } else if (breedingProjects.length) {
          const clutchPromises = breedingProjects.map(project => getClutches(project.id));
          const clutchesArrays = await Promise.all(clutchPromises);
          setAllClutches(clutchesArrays.flat());
        }
      } catch (error) {
        console.error("Error fetching clutches:", error);
        setAllClutches([]);
      }
    }
    
    fetchAllClutches();
  }, [breedingProjects, dateFilterParams]);
  
  // Handle date range changes
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setDateRange(undefined);
  };
  
  const isLoading = 
    reptilesLoading || 
    speciesLoading || 
    morphsLoading || 
    healthLoading || 
    growthLoading || 
    breedingLoading ||
    feedingLoading;
  
  const hasActiveFilters = !!dateRange;
  
  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
        <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <Card className="border-none shadow-none !py-0">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl 2xl:text-2xl 3xl:text-3xl font-bold">Overview</CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <DateRangePicker 
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
              />
              
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-9"
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Stats cards - responsive grid */}
      <ScrollArea className="w-full -mx-4 px-4 sm:mx-0 sm:px-0 pb-4 sm:pb-0">
        <div className="min-w-[640px]">
          <StatsCards 
            reptiles={reptiles} 
            healthLogs={healthLogs} 
            breedingProjects={breedingProjects} 
            growthEntries={growthEntries} 
          />
        </div>
      </ScrollArea>

      <FeedingOverview 
       schedules={feedingSchedules}
      />
      
      {/* Collection overview */}
      <div className="w-full">
        <CollectionOverview 
          reptiles={reptiles}
          healthLogs={healthLogs}
          breedingProjects={breedingProjects}
          species={species}
          morphs={morphs}
        />
      </div>


      
      {/* Main dashboard content - stacked layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action items */}
        <div>
          <ActionItems 
            reptiles={reptiles}
            healthLogs={healthLogs}
            breedingProjects={breedingProjects}
            growthEntries={growthEntries}
            clutches={allClutches}
          />
        </div>
        
        {/* Recent activity */}
        <div>
          <RecentActivity 
            reptiles={reptiles}
            healthLogs={healthLogs}
            growthEntries={growthEntries}
          />
        </div>
      </div>
    
    </div>
  );
}