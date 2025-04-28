'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FilterX, Loader2 } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { SalesFilterParams, SalesFilters } from './reports/SalesFilters';
import { getSalesByMorphs, getSalesBySpecies, getSalesSummary } from '@/app/api/sales';
import { SalesSummaryStats } from './reports/SalesSummaryStats';
import { SalesByTimeChart } from './reports/charts/SalesByTimeChart';
import { DistributionPieCharts } from './reports/charts/DistributionPieCharts';
import { TimePeriod, TimeRangeSelector } from './reports/TimeRangeSelector';

export function SalesReportTab() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<SalesFilterParams>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  
  // Update filters when date range changes
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    
    if (newRange?.from) {
      const startDate = format(newRange.from, 'yyyy-MM-dd');
      setFilters(prev => ({
        ...prev,
        startDate
      }));
    } else {
      // Remove startDate if from is cleared
      const updatedFilters = { ...filters };
      delete updatedFilters.startDate;
      setFilters(updatedFilters);
    }
    
    if (newRange?.to) {
      const endDate = format(newRange.to, 'yyyy-MM-dd');
      setFilters(prev => ({
        ...prev,
        endDate
      }));
    } else {
      // Remove endDate if to is cleared
      const updatedFilters = { ...filters };
      delete updatedFilters.endDate;
      setFilters(updatedFilters);
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    setFilters(prev => ({
      ...prev,
      period
    }));
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({});
    setDateRange(undefined);
    setTimePeriod('monthly');
  };
  
  // Fetch sales summary data
  const { 
    data: salesSummary, 
    isLoading: summaryLoading 
  } = useQuery({
    queryKey: ['sales-summary', filters],
    queryFn: () => getSalesSummary(filters),
  });
  
  // Fetch species distribution data
  const { 
    data: speciesData, 
    isLoading: speciesLoading 
  } = useQuery({
    queryKey: ['sales-by-species', filters],
    queryFn: () => getSalesBySpecies(filters),
    enabled: activeTab === 'distributions', // Only fetch when on distributions tab
  });
  
  // Fetch morph distribution data
  const { 
    data: morphData, 
    isLoading: morphLoading 
  } = useQuery({
    queryKey: ['sales-by-morphs', filters],
    queryFn: () => getSalesByMorphs(filters),
    enabled: activeTab === 'distributions', // Only fetch when on distributions tab
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm lg:text-lg font-semibold tracking-tight text-start">Sales Reports</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of your sales data and trends
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <DatePickerWithRange 
            date={dateRange} 
            onDateChange={handleDateRangeChange} 
          />
          <SalesFilters 
            onFilterChange={setFilters} 
            filters={filters}
          />
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            <FilterX className="h-4 w-4 mr-2" />
            Reset 
          </Button>
        </div>
      </div>
      
      <div>
        <TimeRangeSelector 
          value={timePeriod} 
          onChange={handleTimePeriodChange} 
        />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distributions">Distribution Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {summaryLoading ? (
            <div className="h-60 w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <SalesSummaryStats data={salesSummary} />
              <SalesByTimeChart data={salesSummary} period={timePeriod} />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="distributions" className="space-y-6">
          {(speciesLoading || morphLoading || summaryLoading) ? (
            <div className="h-60 w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DistributionPieCharts 
              data={salesSummary} 
              speciesData={speciesData} 
              morphData={morphData}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 