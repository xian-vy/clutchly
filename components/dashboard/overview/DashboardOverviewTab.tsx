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
import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { FilterX } from 'lucide-react';
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
import { useAuthStore } from '@/lib/stores/authStore';
import useInitializeCommonData from '@/lib/hooks/useInitializeCommonData';
import { formatDateForApi } from '@/lib/utils';

export function DashboardOverviewTab() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const {organization} = useAuthStore();
  const { species} = useSpeciesStore();
  const { morphs } = useMorphsStore();
  useInitializeCommonData();

  const dateFilterParams = useMemo(() => {
    if (!dateRange) return undefined;
    return {
      startDate: dateRange.from ? formatDateForApi(dateRange.from) : undefined,
      endDate: dateRange.to ? formatDateForApi(dateRange.to) : undefined,
    };
  }, [dateRange]);

  const independentQueries = useQueries({
    queries: [
      {
        queryKey: ['reptiles'],
        queryFn: async () => {
          if (!organization) return [];
           return getReptiles(organization) 
        },
        enabled: !!organization,
      },
      {
        queryKey: ['health-logs', dateFilterParams],
        queryFn: async () => {
          if (!organization) return [];
          return dateFilterParams 
            ? getHealthLogsByDate(organization, dateFilterParams)
            : getHealthLogs(organization);
        },
        enabled: !!organization,
      },
      {
        queryKey: ['growth-entries', dateFilterParams],
        queryFn: async () => {
          if (!organization) return [];
          return dateFilterParams 
            ? getGrowthEntriesByDate(organization, dateFilterParams)
            : getGrowthEntries(organization);
        },
        enabled: !!organization,
      },
      {
        queryKey: ['breeding-projects', dateFilterParams],
        queryFn: async () => {
          if (!organization) return [];
          return dateFilterParams 
            ? getBreedingProjectsByDate(organization, { 
                ...dateFilterParams, 
                dateField: 'start_date' 
              })
            : getBreedingProjects(organization);
        },
        enabled: !!organization,
      },
      {
        queryKey: ['sales-summary', dateFilterParams, timePeriod],
        queryFn: async (): Promise<SalesSummary> => {
          if (!organization) return {} as SalesSummary;
          return getSalesSummary(organization, {
            ...dateFilterParams,
            period: timePeriod === 'custom' ? undefined : timePeriod,
          });
        },
        enabled: !!organization,
      },
      {
        queryKey: ['expenses-summary', dateFilterParams],
        queryFn: async (): Promise<ExpensesSummary> => {
          if (!organization) return {} as ExpensesSummary;
          return getExpensesSummary(organization, dateFilterParams);
        },
        enabled: !!organization,
      }
    ],
  });

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
         if (!organization) return [];
        return getAllClutchesByDate(organization,dateFilterParams);
      } else if (breedingProjects.length) {
        const clutchPromises = breedingProjects.map(project => getClutches(project.id));
        const clutchesArrays = await Promise.all(clutchPromises);
        return clutchesArrays.flat();
      }
      return [];
    },
    enabled: !breedingLoading && !!organization && !!breedingProjects,
  });
  
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
  };

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setTimePeriod(newPeriod);
  };
  
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
            <CardTitle className="text-lg sm:text-xl 2xl:text-2xl text-foreground/85 dark:text-foreground/95  font-bold">Dashboard</CardTitle>
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
            isLoading={reptilesLoading || healthLoading || growthLoading || breedingLoading || salesLoading || expensesLoading}
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
            isLoading={salesLoading || expensesLoading}
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
          isLoading={salesLoading || expensesLoading}
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
          isLoading={reptilesLoading || healthLoading || breedingLoading}
        />
      </div>
      
      {/* Main dashboard content - stacked layout */}
      <div className="grid grid-cols-1 gap-6">
        {/* Action items */}
        <div>
          <ActionItems 
            reptiles={reptiles}
            healthLogs={healthLogs}
            breedingProjects={breedingProjects}
            growthEntries={growthEntries}
            clutches={allClutches}
            isLoading={reptilesLoading || healthLoading || breedingLoading || growthLoading || clutchesLoading}
          />
        </div>
        
        {/* Recent activity */}
        <div>
          <RecentActivity 
            reptiles={reptiles}
            healthLogs={healthLogs}
            growthEntries={growthEntries}
            isLoading={reptilesLoading || healthLoading || growthLoading}
          />
        </div>
      </div>
    
    </div>
  );
}