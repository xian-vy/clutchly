'use client';

import { getHealthCategories } from '@/app/api/health/categories';
import { getHealthLogs } from '@/app/api/health/entries';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthLogCategory, HealthLogEntry } from '@/lib/types/health';
import { Reptile } from '@/lib/types/reptile';
import { Loader2, Filter } from 'lucide-react';
import { useState } from 'react';
import { AnalysisTab } from './AnalysisTab';
import { OverviewTab } from './OverviewTab';
import { RecommendationsTab } from './RecommendationsTab';
import { useQuery } from '@tanstack/react-query';
import { getCurrentMonthDateRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HealthFilterDialog, HealthFilters } from './HealthFilterDialog';

export function HealthReportsTab() {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const currentMonthRange = getCurrentMonthDateRange();
  const [filters, setFilters] = useState<HealthFilters>({
    dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
  });

  const { data: healthLogs = [], isLoading : isHealthLogsLoading } = useQuery<HealthLogEntry[]>({
    queryKey: ['healthLogs', filters.dateRange],
    queryFn: () => getHealthLogs({ 
      startDate: filters.dateRange?.[0] || undefined, 
      endDate: filters.dateRange?.[1] || undefined 
    }),
  });

  const { data: reptiles = [], isLoading : isReptilesLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  const { data: categories = [], isLoading : isCategoriesLoading } = useQuery<HealthLogCategory[]>({
    queryKey: ['categories'],
    queryFn: getHealthCategories,
  });
  
  // Apply filters
  const filteredLogs = healthLogs.filter(log => {
    if (filters.reptileId && log.reptile_id !== filters.reptileId) return false;
    if (filters.severity && log.severity !== filters.severity) return false;
    if (filters.status && (log.resolved ? 'resolved' : 'active') !== filters.status) return false;
    if (filters.categoryId && log.category_id !== filters.categoryId) return false;
    
    if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
      const logDate = new Date(log.date);
      const startDate = new Date(filters.dateRange[0]);
      const endDate = new Date(filters.dateRange[1]);
      if (logDate < startDate || logDate > endDate) return false;
    }
    
    return true;
  });
  
  // Calculate statistics
  const stats = {
    totalIssues: filteredLogs.length,
    activeIssues: filteredLogs.filter(log => !log.resolved).length,
    resolvedIssues: filteredLogs.filter(log => log.resolved).length,
    highSeverityIssues: filteredLogs.filter(log => log.severity === 'high').length,
    moderateSeverityIssues: filteredLogs.filter(log => log.severity === 'moderate').length,
    lowSeverityIssues: filteredLogs.filter(log => log.severity === 'low').length,
    resolutionRate: filteredLogs.length > 0 
      ? (filteredLogs.filter(log => log.resolved).length / filteredLogs.length) * 100 
      : 0,
    avgResolutionDays: filteredLogs
      .filter(log => log.resolved)
      .reduce((acc, log) => {
        const resolvedDate = new Date(log.updated_at || log.created_at);
        const createdDate = new Date(log.date);
        const diffTime = Math.abs(resolvedDate.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return acc + diffDays;
      }, 0) / filteredLogs.filter(log => log.resolved).length || 0
  };
  
  // Calculate category distribution
  const categoryDistribution = categories.map(category => ({
    name: category.label,
    count: filteredLogs.filter(log => log.category_id === category.id).length
  }));
  
  // Calculate monthly trends
  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    const monthLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === date.getMonth() && 
             logDate.getFullYear() === date.getFullYear();
    });
    
    return {
      month: `${month} ${year}`,
      total: monthLogs.length,
      resolved: monthLogs.filter(log => log.resolved).length,
      active: monthLogs.filter(log => !log.resolved).length
    };
  }).reverse();
  
  // Get reptile health summary if a reptile is selected
  const reptileHealthSummary = filters.reptileId ? (() => {
    const reptile = reptiles.find(r => r.id === filters.reptileId);
    if (!reptile) return null;
    
    return {
      name: reptile.name,
      species: reptile.species_id,
      totalIssues: filteredLogs.length,
      activeIssues: filteredLogs.filter(log => !log.resolved).length,
      highSeverityIssues: filteredLogs.filter(log => log.severity === 'high').length,
      lastIssueDate: filteredLogs.length > 0 
        ? new Date(Math.max(...filteredLogs.map(log => new Date(log.date).getTime())))
            .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'No issues recorded'
    };
  })() : null;

  // Get active filter count for the badge
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== null && 
    value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;
  
  // Check if any data is still loading
  const isLoading = isHealthLogsLoading || isReptilesLoading || isCategoriesLoading;
  
  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg  font-semibold tracking-tight text-start text-muted-foreground">Health Reports</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Comprehensive analysis of your health and events.
          </p>
        </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFilterDialogOpen(true)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter
            {activeFilterCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute text-white rounded-sm -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 font-normal text-[0.65rem]"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
      </div>
      
      <Tabs defaultValue="overview" className="w-full space-y-5">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab
            stats={stats}
            reptileHealthSummary={reptileHealthSummary}
          />
        </TabsContent>
        
        <TabsContent value="analysis">
          <AnalysisTab
            categoryDistribution={categoryDistribution}
            monthlyTrends={monthlyTrends}
            filteredLogs={filteredLogs}
            reptiles={reptiles}
            categories={categories}
            stats={stats}
          />
        </TabsContent>
        
        <TabsContent value="recommendations">
          <RecommendationsTab
            filteredLogs={filteredLogs}
            reptiles={reptiles}
            categories={categories}
            stats={stats}
          />
        </TabsContent>
      </Tabs>

      <HealthFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
        categories={categories}
        reptiles={reptiles}
      />
    </div>
  );
} 