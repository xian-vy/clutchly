'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthCategory, HealthLogEntry } from '@/lib/types/health';
import { Reptile } from '@/lib/types/reptile';
import CategoryDistribution from './charts/CategoryDistribution';
import HealthIssues from './charts/HealthIssues';
import HighSeverityIssues from './charts/HighSeverityIssues';
import MonthlyTrends from './charts/MonthlyTrends';
import ResolutionTimeAnalysis from './charts/ResolutionTimeAnalysis';
import SeverityDistibution from './charts/SeverityDistibution';
import StatusDistribution from './charts/StatusDistribution';

interface AnalysisTabProps {
  categoryDistribution: { name: string; count: number }[];
  monthlyTrends: { month: string; total: number; resolved: number; active: number }[];
  filteredLogs: HealthLogEntry[];
  reptiles: Reptile[];
  categories: HealthCategory[];
  stats: {
    totalIssues: number;
    activeIssues: number;
    resolvedIssues: number;
    highSeverityIssues: number;
    moderateSeverityIssues: number;
    lowSeverityIssues: number;
    resolutionRate: number;
    avgResolutionDays: number;
  };
}

// Colors for charts

export function AnalysisTab({
  categoryDistribution,
  monthlyTrends,
  filteredLogs,
  reptiles,
  categories,
  stats
}: AnalysisTabProps) {
  // Prepare data for severity distribution pie chart
  const severityData = [
    { name: 'High', value: stats.highSeverityIssues },
    { name: 'Moderate', value: stats.moderateSeverityIssues },
    { name: 'Low', value: stats.lowSeverityIssues }
  ];

  // Prepare data for status distribution pie chart
  const statusData = [
    { name: 'Active', value: stats.activeIssues },
    { name: 'Resolved', value: stats.resolvedIssues }
  ];

  // Prepare data for reptile health issues bar chart
  const reptileHealthData = reptiles.map(reptile => {
    const reptileLogs = filteredLogs.filter(log => log.reptile_id === reptile.id);
    return {
      name: reptile.name,
      total: reptileLogs.length,
      active: reptileLogs.filter(log => !log.resolved).length,
      resolved: reptileLogs.filter(log => log.resolved).length
    };
  }).filter(data => data.total > 0);


  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SeverityDistibution severityData={severityData} />
              <StatusDistribution statusData={statusData} />
            </div>
            <HealthIssues reptileHealthData={reptileHealthData} />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4 pt-3"> 
             <MonthlyTrends monthlyTrends={monthlyTrends} />
             <ResolutionTimeAnalysis stats={stats} />
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-4 pt-3">
             <CategoryDistribution categoryDistribution={categoryDistribution} />
             <HighSeverityIssues filteredLogs={filteredLogs} categories={categories} reptiles={reptiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}