'use client';

import { BreedingReportFilters, getBreedingStats, getDetailedBreedingProjects, getGeneticOutcomes } from '@/app/api/breeding/reports';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Database, FilterX, Loader2, PieChart, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { BreedingReportFilters as FilterComponent } from './BreedingReportFilters';
import { BreedingStatistics } from './BreedingStatistics';
import { GeneticOutcomes } from './GeneticOutcomes';
import { ProjectPerformance } from './ProjectPerformance';

export function BreedingReportsTab() {
  const [activeTab, setActiveTab] = useState('statistics');
  const [filters, setFilters] = useState<BreedingReportFilters>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { species } = useSpeciesStore();
  
  // Update filters when date range changes
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    
    if (newRange?.from) {
      // Ensure from is not undefined before using format
      const startDate = format(newRange.from, 'yyyy-MM-dd');
      setFilters(prev => ({
        ...prev,
        startDate
      }));
    } else {
      // Remove startDate if from is cleared
      const {  ...rest } = filters;
      setFilters(rest);
    }
    
    if (newRange?.to) {
      // Ensure to is not undefined before using format
      const endDate = format(newRange.to, 'yyyy-MM-dd');
      setFilters(prev => ({
        ...prev,
        endDate
      }));
    } else {
      // Remove endDate if to is cleared
      const { ...rest } = filters;
      setFilters(rest);
    }
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({});
    setDateRange(undefined);
  };
  
  // Fetch breeding statistics data
  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['breeding-stats', filters],
    queryFn: () => getBreedingStats(filters),
  });
  
  // Fetch detailed breeding projects data (lazy loaded)
  const { 
    data: detailedData, 
    isLoading: detailedLoading,
    refetch: fetchDetailedData
  } = useQuery({
    queryKey: ['detailed-breeding-projects', filters],
    queryFn: () => getDetailedBreedingProjects(filters),
    enabled: activeTab === 'projects', // Only fetch when this tab is active
  });
  
  // Fetch genetic outcomes data (lazy loaded)
  const { 
    data: geneticData, 
    isLoading: geneticLoading,
    refetch: fetchGeneticData
  } = useQuery({
    queryKey: ['genetic-outcomes', filters],
    queryFn: () => getGeneticOutcomes(filters),
    enabled: activeTab === 'genetics', // Only fetch when this tab is active
  });
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Trigger data fetching for the selected tab if needed
    if (value === 'projects' && !detailedData && !detailedLoading) {
      fetchDetailedData();
    } else if (value === 'genetics' && !geneticData && !geneticLoading) {
      fetchGeneticData();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm lg:text-lg font-semibold tracking-tight text-start">Breeding Reports</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of your breeding projects and outcomes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <DatePickerWithRange 
            date={dateRange} 
            onDateChange={handleDateRangeChange} 
          />
          <FilterComponent 
            onFilterChange={setFilters} 
            filters={filters}
            species={species}
          />
           <Button variant="outline" size="sm" onClick={handleResetFilters}>
            <FilterX className="h-4 w-4" />
            Reset 
          </Button>
        </div>
      </div>
      
    

      <Tabs defaultValue="statistics" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Database className="h-4 w-4 mr-2" />
            Project Analysis
          </TabsTrigger>
          <TabsTrigger value="genetics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4 mr-2" />
            Genetic Outcomes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="statistics" className="space-y-4">
          {statsLoading ? (
            <div className="h-60 w-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <BreedingStatistics data={statsData} />
          )}
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          {detailedLoading ? (
            <div className="h-60 w-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <ProjectPerformance data={detailedData} />
          )}
        </TabsContent>
        
        <TabsContent value="genetics" className="space-y-4">
          {geneticLoading ? (
            <div className="h-60 w-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <GeneticOutcomes data={geneticData} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 