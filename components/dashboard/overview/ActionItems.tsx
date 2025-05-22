'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SEVERITY_COLORS } from "@/lib/constants/colors";
import { BreedingProject, Clutch } from "@/lib/types/breeding";
import { GrowthEntry } from "@/lib/types/growth";
import { HealthLogEntry } from "@/lib/types/health";
import { Reptile } from "@/lib/types/reptile";
import { differenceInDays, isPast, parseISO } from "date-fns";
import { AlertTriangle, Calendar, CheckCircle, Egg, Scale } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface ActionItemsProps {
  reptiles: Reptile[];
  healthLogs: HealthLogEntry[];
  breedingProjects: BreedingProject[];
  growthEntries: GrowthEntry[];
  clutches: Clutch[];
  isLoading: boolean;
}

export function ActionItems({ 
  reptiles, 
  healthLogs, 
  breedingProjects, 
  growthEntries,
  clutches,
  isLoading
}: ActionItemsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="pt-0">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Calculate alert items
  const alertItems = [];
  
  // Add health alerts
  const unresolvedHealthIssues = healthLogs.filter(h => !h.resolved).length;
  if (unresolvedHealthIssues > 0) {
    alertItems.push({
      title: `${unresolvedHealthIssues} unresolved health ${unresolvedHealthIssues === 1 ? 'issue' : 'issues'}`,
      icon: AlertTriangle,
      type: 'health',
      priority: 'high'
    });
  }
  
  // Add growth record alerts
  const reptilesDueForMeasurement = reptiles.filter(reptile => {
    const lastGrowthEntry = growthEntries
      .filter(entry => entry.reptile_id === reptile.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (!lastGrowthEntry) return true;
    
    const daysSinceLastMeasurement = differenceInDays(
      new Date(), 
      parseISO(lastGrowthEntry.date)
    );
    
    return !lastGrowthEntry || daysSinceLastMeasurement > 30;
  }).length;
  
  if (reptilesDueForMeasurement > 0) {
    alertItems.push({
      title: `${reptilesDueForMeasurement} ${reptilesDueForMeasurement === 1 ? 'reptile needs' : 'reptiles need'} measurement`,
      icon: Scale,
      type: 'growth',
      priority: 'medium'
    });
  }
  
  // Add breeding alerts
  const clutchesPendingHatch = clutches.filter(c => c.incubation_status === 'in_progress').length;
  
  if (clutchesPendingHatch > 0) {
    alertItems.push({
      title: `${clutchesPendingHatch} ${clutchesPendingHatch === 1 ? 'clutch' : 'clutches'} in incubation`,
      icon: Egg,
      type: 'breeding',
      priority: 'medium'
    });
  }
  
  const upcomingHatchDates = breedingProjects
    .filter(p => p.expected_hatch_date && !isPast(parseISO(p.expected_hatch_date)))
    .length;
  
  if (upcomingHatchDates > 0) {
    alertItems.push({
      title: `${upcomingHatchDates} ${upcomingHatchDates === 1 ? 'project' : 'projects'} with upcoming hatch`,
      icon: Calendar,
      type: 'breeding',
      priority: 'medium'
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Action Items</CardTitle>
        <CardDescription>Tasks requiring attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {alertItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-sm font-medium">All tasks complete</p>
            <p className="text-xs text-muted-foreground">No urgent tasks at the moment</p>
          </div>
        ) : (
          alertItems.map((item, i) => {
            const ItemIcon = item.icon;
            const href = `/${item.type}`;
            const priorityColors = {
              high: "text-red-500 bg-red-50 dark:bg-red-950",
              medium: "text-amber-500 bg-amber-50 dark:bg-amber-950",
              low: "text-blue-500 bg-blue-50 dark:bg-blue-950"
            };
            const bgColor = priorityColors[item.priority.toLowerCase() as keyof typeof priorityColors];
            
            return (
              <Link href={href} key={i}>
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className={`p-2 rounded-full ${bgColor}`}>
                    <ItemIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                  </div>
                  <Badge variant="outline" className={SEVERITY_COLORS[item.priority.toLowerCase() as keyof typeof SEVERITY_COLORS]}>
                    {item.priority}
                  </Badge>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
      {alertItems.length > 0 && (
        <CardFooter className="pt-0">
          <Button variant="outline" className="w-full" asChild>
            <Link href="#">View All Tasks</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 