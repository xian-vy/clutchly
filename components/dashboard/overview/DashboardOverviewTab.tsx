'use client';

import {  getReptiles } from '@/app/api/reptiles/reptiles';
import { getHealthLogs, getHealthLogsByDate } from '@/app/api/health/entries';
import { getGrowthEntries, getGrowthEntriesByDate } from '@/app/api/growth/entries';
import { getBreedingProjects, getBreedingProjectsByDate } from '@/app/api/breeding/projects';
import { getClutches, getAllClutchesByDate } from '@/app/api/breeding/clutches';
import { getSalesSummary } from '@/app/api/sales';
import { getExpensesSummary } from '@/app/api/expenses';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { Clutch } from '@/lib/types/breeding';
import { SalesSummary } from '@/lib/types/sales';
import { ExpensesSummary } from '@/lib/types/expenses';
import { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { FilterX, Loader2 } from 'lucide-react';
import { StatsCards } from './StatsCards';
import { ActionItems } from './ActionItems';
import { RecentActivity } from './RecentActivity';
import { CollectionOverview } from './CollectionOverview';
import { TimeRangeSelector, TimePeriod } from './TimeRangeSelector';
import { SalesExpensesChart } from './SalesExpensesChart';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedingOverview } from './FeedingOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Profile } from '@/lib/types/profile';
import { getProfile } from '@/app/api/profiles/profiles';
import { useFeedersStore } from '@/lib/stores/feedersStore';

export function DashboardOverviewTab() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  
  // Format date string for API calls
  const formatDateForApi = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };
  

  
  // Get species and morph data from their respective stores
  const { species, isLoading: speciesLoading, fetchSpecies } = useSpeciesStore();
  const { morphs, isLoading: morphsLoading,downloadCommonMorphs  } = useMorphsStore();
  const { feederSizes,feederTypes,fetchFeederSizes,fetchFeederTypes } = useFeedersStore();

  
  useEffect(() => {
    if (species.length === 0) {
      fetchSpecies()
    }
  }, [fetchSpecies,species])

  useEffect(() => {
    if (feederSizes.length === 0) {
      fetchFeederSizes()
    }
  }, [fetchFeederSizes,feederSizes])

  useEffect(() => {
    if (feederTypes.length === 0) {
      fetchFeederTypes()
    }
  }, [fetchFeederTypes,feederTypes])
 
  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile2'],
    queryFn: getProfile
  })

  // In the event local storage has been cleared (Refetch morphs base on profile sp selection)
  useEffect(() => {
    if (morphs.length === 0 && profile) {
       async function fetchMorphs() {
        if (!profile) {
          console.error('No profile found to download common morphs');
          return;
        }
        const speciesIds = profile.selected_species
        if (!speciesIds) {
          console.error('No species IDs found in profile');
          return;
        }
       await downloadCommonMorphs(speciesIds);
      }
      fetchMorphs()
    }
  }, [profile, morphs,downloadCommonMorphs]);

  // Create date filter params for API calls
  const dateFilterParams = useMemo(() => {
    if (!dateRange) return undefined;
    return {
      startDate: dateRange.from ? formatDateForApi(dateRange.from) : undefined,
      endDate: dateRange.to ? formatDateForApi(dateRange.to) : undefined,
    };
  }, [dateRange]);

  // Group independent queries together using useQueries
  const independentQueries = useQueries({
    queries: [
      {
        queryKey: ['reptiles', dateFilterParams],
        queryFn: getReptiles,
      },
      {
        queryKey: ['health-logs', dateFilterParams],
        queryFn: () => dateFilterParams 
          ? getHealthLogsByDate(dateFilterParams) 
          : getHealthLogs(),
      },
      {
        queryKey: ['growth-entries', dateFilterParams],
        queryFn: () => dateFilterParams 
          ? getGrowthEntriesByDate(dateFilterParams) 
          : getGrowthEntries(),
      },
      {
        queryKey: ['breeding-projects', dateFilterParams],
        queryFn: () => dateFilterParams 
          ? getBreedingProjectsByDate({ 
              ...dateFilterParams, 
              dateField: 'start_date' 
            }) 
          : getBreedingProjects(),
      },
      {
        queryKey: ['sales-summary', dateFilterParams, timePeriod],
        queryFn: (): Promise<SalesSummary> => getSalesSummary({
          ...dateFilterParams,
          period: timePeriod === 'custom' ? undefined : timePeriod,
        }),
      },
      {
        queryKey: ['expenses-summary', dateFilterParams],
        queryFn: (): Promise<ExpensesSummary> => getExpensesSummary(dateFilterParams),
      }
    ]
  });

  // Destructure the results
  const [
    { data: reptiles = [], isLoading: reptilesLoading },
    { data: healthLogs = [], isLoading: healthLoading },
    { data: growthEntries = [], isLoading: growthLoading },
    { data: breedingProjects = [], isLoading: breedingLoading },
    { data: salesSummary, isLoading: salesLoading },
    { data: expensesSummary, isLoading: expensesLoading }
  ] = independentQueries;

  // Keep the dependent clutches query separate since it depends on breedingProjects
  const { data: allClutches = [], isLoading: clutchesLoading } = useQuery<Clutch[]>({
    queryKey: ['clutches', dateFilterParams, breedingProjects],
    queryFn: async () => {
      if (dateFilterParams) {
        return getAllClutchesByDate(dateFilterParams);
      } else if (breedingProjects.length) {
        const clutchPromises = breedingProjects.map(project => getClutches(project.id));
        const clutchesArrays = await Promise.all(clutchPromises);
        return clutchesArrays.flat();
      }
      return [];
    },
    enabled: !breedingLoading && !!profile && !!breedingProjects,
  });
  
  // Handle date range changes
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
  };

  // Handle time period changes
  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setTimePeriod(newPeriod);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setDateRange(undefined);
    setTimePeriod('monthly');
  };
  
 
  
  const hasActiveFilters = !!dateRange || timePeriod !== 'monthly';
  

  
  return (
    <div className="space-y-2 md:space-y-3 xl:space-y-4 max-w-screen-2xl mx-auto">
      <Card className="border-none shadow-none !py-0">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl 2xl:text-2xl 3xl:text-3xl font-bold">Dashboard</CardTitle>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="0" className="space-y-2 md:space-y-3 xl:space-y-6 ">
        <div className="flex w-full justify-between">
            <div>
                <TabsList>
                  <TabsTrigger value="0">Overview</TabsTrigger>
                  <TabsTrigger value="1">Sales</TabsTrigger>
                </TabsList>
            </div>
            <div className="flex flex-wrap items-center gap-1">
                <TimeRangeSelector
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  period={timePeriod}
                  onPeriodChange={handlePeriodChange}
                />
                
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-9"
                  >
                    <FilterX className="h-4 w-4 " />
                  </Button>
                )}
            </div>
        </div>
        <TabsContent value="0">
                <StatsCards 
                  reptiles={reptiles} 
                  healthLogs={healthLogs}
                  growthEntries={growthEntries}
                  salesSummary={salesSummary}
                  expensesSummary={expensesSummary}
                  breedingProjects={breedingProjects}
                  tabIndex={0}
                />
        </TabsContent>
        <TabsContent value="1">
                <StatsCards 
                  reptiles={reptiles} 
                  healthLogs={healthLogs}
                  growthEntries={growthEntries}
                  salesSummary={salesSummary}
                  expensesSummary={expensesSummary}
                  breedingProjects={breedingProjects}
                  tabIndex={1}
                />
        </TabsContent>
      </Tabs>


      {/* Sales vs Expenses Chart */}
      <div className="w-full">
        <SalesExpensesChart
          salesSummary={salesSummary}
          expensesSummary={expensesSummary}
          period={timePeriod}
          startDate={dateRange?.from}
          endDate={dateRange?.to}
        />
      </div>

      <FeedingOverview />
      
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
      <div className="grid grid-cols-1  gap-6">
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