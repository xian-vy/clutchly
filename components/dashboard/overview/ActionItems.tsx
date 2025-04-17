'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SEVERITY_COLORS } from "@/lib/constants/colors";
import { BreedingProject, Clutch } from "@/lib/types/breeding";
import { GrowthEntry } from "@/lib/types/growth";
import { HealthLogEntry } from "@/lib/types/health";
import { Reptile } from "@/lib/types/reptile";
import { addDays, differenceInDays, isPast, isWithinInterval, parseISO } from "date-fns";
import { AlertTriangle, Calendar, Egg, Scale } from "lucide-react";
import Link from "next/link";

interface ActionItemsProps {
  reptiles: Reptile[];
  healthLogs: HealthLogEntry[];
  breedingProjects: BreedingProject[];
  growthEntries: GrowthEntry[];
  clutches: Clutch[];
}

export function ActionItems({ 
  reptiles, 
  healthLogs, 
  breedingProjects, 
  growthEntries,
  clutches 
}: ActionItemsProps) {
  // Calculate alert items
  const alertItems = [];
  
  // Add health alerts
  const unresolvedHealthIssues = healthLogs.filter(h => !h.resolved).length;
  if (unresolvedHealthIssues > 0) {
    alertItems.push({
      title: `${unresolvedHealthIssues} unresolved health issues`,
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
      title: `${reptilesDueForMeasurement} reptiles need growth updates`,
      icon: Scale,
      type: 'growth',
      priority: 'medium'
    });
  }
  
  // Add breeding alerts
  const clutchesPendingHatch = clutches.filter(c => c.incubation_status === 'in_progress').length;
  
  if (clutchesPendingHatch > 0) {
    alertItems.push({
      title: `${clutchesPendingHatch} clutches in incubation`,
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
      title: `${upcomingHatchDates} projects with upcoming hatch dates`,
      icon: Calendar,
      type: 'breeding',
      priority: 'medium'
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <CardDescription>Tasks that need your attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {alertItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No urgent tasks at the moment</p>
        ) : (
          alertItems.map((item, i) => {
            const ItemIcon = item.icon;
            const href = `/${item.type}`;
            return (
              <Link href={href} key={i}>
                <Alert className="cursor-pointer hover:bg-muted/50">
                  <ItemIcon className="h-4 w-4 mr-2" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <span>{item.title}</span>
                    <Badge className={SEVERITY_COLORS[item.priority.toLowerCase() as keyof typeof SEVERITY_COLORS]}>
                      {item.priority}
                    </Badge>
                  </AlertDescription>
                </Alert>
              </Link>
            );
          })
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/reptiles">View All Reptiles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 