'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewTabProps {
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
  reptileHealthSummary: {
    name: string;
    species: string;
    totalIssues: number;
    activeIssues: number;
    highSeverityIssues: number;
    lastIssueDate: string;
  } | null;
}

export function OverviewTab({ stats, reptileHealthSummary }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Health Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.activeIssues}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolutionRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionDays} days</div>
          </CardContent>
        </Card>
      </div>
      
      {reptileHealthSummary && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Reptile Health Summary</CardTitle>
            <CardDescription>
              Health overview for {reptileHealthSummary.name} ({reptileHealthSummary.species})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-xl font-semibold">{reptileHealthSummary.totalIssues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Issues</p>
                <p className="text-xl font-semibold text-red-500">{reptileHealthSummary.activeIssues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">High Severity Issues</p>
                <p className="text-xl font-semibold text-orange-500">{reptileHealthSummary.highSeverityIssues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Issue</p>
                <p className="text-xl font-semibold">{reptileHealthSummary.lastIssueDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
          <CardDescription>Distribution of health issues by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="space-y-2">
                <div className="h-40 bg-red-100 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{stats.highSeverityIssues}</div>
                    <div className="text-sm text-red-600">High</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-40 bg-yellow-100 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{stats.moderateSeverityIssues}</div>
                    <div className="text-sm text-yellow-600">Moderate</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-40 bg-green-100 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.lowSeverityIssues}</div>
                    <div className="text-sm text-green-600">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 