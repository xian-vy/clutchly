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
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { FilterX, Loader2 } from 'lucide-react';
import { StatsCards } from './StatsCards';
import { ActionItems } from './ActionItems';
import { RecentActivity } from './RecentActivity';
import { CollectionOverview } from './CollectionOverview';
import { DateRangePicker } from './DateRangePicker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DashboardOverviewTab() {
  const [allClutches, setAllClutches] = useState<Clutch[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const queryClient = useQueryClient();
  
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
  const { species, isLoading: speciesLoading } = useSpeciesStore();
  const { morphs, isLoading: morphsLoading } = useMorphsStore();
  
  // Create date filter params for API calls
  const dateFilterParams = dateRange ? {
    startDate: dateRange.from ? formatDateForApi(dateRange.from) : undefined,
    endDate: dateRange.to ? formatDateForApi(dateRange.to) : undefined,
  } : undefined;
  
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
    breedingLoading;
  
  const hasActiveFilters = !!dateRange;
  
  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
        <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-3xl font-bold">Dashboard</CardTitle>
            
            <div className="flex items-center gap-2">
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
      
      {/* Stats cards */}
      <StatsCards 
        reptiles={reptiles} 
        healthLogs={healthLogs} 
        breedingProjects={breedingProjects} 
        growthEntries={growthEntries} 
      />
      
      {/* Main dashboard content */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left column for action items and recent activity */}
        <div className="lg:col-span-5 space-y-6">
          <ActionItems 
            reptiles={reptiles}
            healthLogs={healthLogs}
            breedingProjects={breedingProjects}
            growthEntries={growthEntries}
            clutches={allClutches}
          />
          
          <RecentActivity 
            reptiles={reptiles}
            healthLogs={healthLogs}
            growthEntries={growthEntries}
          />
        </div>
        
        {/* Right column for collection overview */}
        <div className="lg:col-span-7">
          <CollectionOverview 
            reptiles={reptiles}
            healthLogs={healthLogs}
            breedingProjects={breedingProjects}
            species={species}
            morphs={morphs}
          />
        </div>
      </div>
    </div>
  );
}