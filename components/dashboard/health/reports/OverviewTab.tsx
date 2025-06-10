'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock, Activity, AlertTriangle, Info } from 'lucide-react';

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Total Health Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.totalIssues}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Active Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-destructive">{stats.activeIssues}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{stats.resolutionRate.toFixed(2)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Avg. Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.avgResolutionDays} days</div>
          </CardContent>
        </Card>
      </div>
      
      {reptileHealthSummary && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              Reptile Health Summary
            </CardTitle>
            <CardDescription>
              Health overview for {reptileHealthSummary.name} ({reptileHealthSummary.species})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Total Issues
                </p>
                <p className="text-xl font-semibold">{reptileHealthSummary.totalIssues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Active Issues
                </p>
                <p className="text-xl font-semibold text-destructive">{reptileHealthSummary.activeIssues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  High Severity Issues
                </p>
                <p className="text-xl font-semibold text-destructive">{reptileHealthSummary.highSeverityIssues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Issue
                </p>
                <p className="text-xl font-semibold">{reptileHealthSummary.lastIssueDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Severity Distribution
          </CardTitle>
          <CardDescription>Distribution of health issues by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="space-y-2">
                <div className="h-40 bg-card border rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive">{stats.highSeverityIssues}</div>
                    <div className="text-sm text-muted-foreground">High</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-40 bg-card border rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning">{stats.moderateSeverityIssues}</div>
                    <div className="text-sm text-muted-foreground">Moderate</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-40 bg-card border rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{stats.lowSeverityIssues}</div>
                    <div className="text-sm text-muted-foreground">Low</div>
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