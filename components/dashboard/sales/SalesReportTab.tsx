'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FilterX, Loader2 } from 'lucide-react';
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
  
  // Handle time period change
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    
    // If custom period selected, don't update filters yet
    // Wait for date range selection
    if (period !== 'custom') {
      setDateRange(undefined);
      setFilters(prev => ({
        ...prev,
        period,
        startDate: undefined,
        endDate: undefined
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        period
      }));
    }
  };
  
  // Update filters when date range changes for custom period
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    
    if (timePeriod === 'custom' && newRange) {
      const updatedFilters = { ...filters };
      
      if (newRange.from) {
        updatedFilters.startDate = format(newRange.from, 'yyyy-MM-dd');
      } else {
        delete updatedFilters.startDate;
      }
      
      if (newRange.to) {
        updatedFilters.endDate = format(newRange.to, 'yyyy-MM-dd');
      } else {
        delete updatedFilters.endDate;
      }
      
      setFilters(updatedFilters);
    }
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
  });
  
  // Fetch morph distribution data
  const { 
    data: morphData, 
    isLoading: morphLoading 
  } = useQuery({
    queryKey: ['sales-by-morphs', filters],
    queryFn: () => getSalesByMorphs(filters),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm lg:text-lg font-semibold tracking-tight text-start">Sales Reports</h2>
          <p className="text-xs sm:text-sm text-start text-muted-foreground">
            Comprehensive analysis of your sales data and trends
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div>
            <TimeRangeSelector 
              value={timePeriod} 
              onChange={handleTimePeriodChange}
              dateRange={dateRange}
              onDateChange={handleDateRangeChange}
            />
          </div>
          <SalesFilters 
            onFilterChange={setFilters} 
            filters={filters}
          />
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            <FilterX className="h-4 w-4 mr-2" />
            <span className='hidden sm:block'>Reset</span>
          </Button>
        </div>
      </div>
      
      

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distributions">Distribution Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {summaryLoading || speciesLoading || morphLoading ? (
            <div className="h-60 w-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <SalesSummaryStats 
                data={salesSummary} 
                // speciesData={speciesData}
                // morphData={morphData}
              />
              <SalesByTimeChart data={salesSummary} period={timePeriod} />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="distributions" className="space-y-6">
          {(speciesLoading || morphLoading || summaryLoading) ? (
            <div className="h-60 w-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
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