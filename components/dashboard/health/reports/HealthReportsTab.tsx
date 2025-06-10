'use client';

import { getHealthCategories } from '@/app/api/health/categories';
import { getHealthLogs } from '@/app/api/health/entries';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthLogCategory, HealthLogEntry } from '@/lib/types/health';
import { Reptile } from '@/lib/types/reptile';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { AnalysisTab } from './AnalysisTab';
import { FilterControls } from './FilterControls';
import { OverviewTab } from './OverviewTab';
import { RecommendationsTab } from './RecommendationsTab';
import { useQuery } from '@tanstack/react-query';
import { getCurrentMonthDateRange } from '@/lib/utils';

export function HealthReportsTab() {
  const [selectedReptile, setSelectedReptile] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const { dateFrom, dateTo } = getCurrentMonthDateRange();
    return {
      start: dateFrom,
      end: dateTo
    };
  });
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: healthLogs = [], isLoading : isHealthLogsLoading } = useQuery<HealthLogEntry[]>({
    queryKey: ['healthLogs', dateRange],
    queryFn: () => getHealthLogs({ 
      startDate: dateRange.start || undefined, 
      endDate: dateRange.end || undefined 
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
    if (selectedReptile && log.reptile_id !== selectedReptile) return false;
    if (severityFilter && log.severity !== severityFilter) return false;
    if (statusFilter && (log.resolved ? 'resolved' : 'active') !== statusFilter) return false;
    if (categoryFilter && log.category_id !== categoryFilter) return false;
    
    if (dateRange.start && dateRange.end) {
      const logDate = new Date(log.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
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
        // Since resolved_date doesn't exist in the type, we'll use created_at as a fallback
        // This is a workaround until the type is updated
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
  const reptileHealthSummary = selectedReptile ? (() => {
    const reptile = reptiles.find(r => r.id === selectedReptile);
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
  
  // Reset filters
  const resetFilters = () => {
    setSelectedReptile(null);
    setDateRange({ start: '', end: '' });
    setSeverityFilter(null);
    setStatusFilter(null);
    setCategoryFilter(null);
  };
  
  // Export functions
  // const exportToCSV = () => {
  //   console.log('Export to CSV functionality will be implemented');
  // };
  
  // const exportToPDF = () => {
  //   console.log('Export to PDF functionality will be implemented');
  // };
  
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
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-start text-muted-foreground">Health Reports</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Comprehensive analysis of your health and events.
          </p>
          </div>
        {/* <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div> */}
      </div>
      
      <FilterControls
        categories={categories}
        selectedReptile={selectedReptile}
        setSelectedReptile={setSelectedReptile}
        dateRange={dateRange}
        setDateRange={setDateRange}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        resetFilters={resetFilters}
        filteredLogsCount={filteredLogs.length}
      />
      
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
    </div>
  );
} 