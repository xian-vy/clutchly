'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Turtle, Heart, LineChart, Users } from "lucide-react";
import Link from "next/link";
import { Reptile } from "@/lib/types/reptile";
import { HealthLogEntry } from "@/lib/types/health";
import { BreedingProject } from "@/lib/types/breeding";
import { GrowthEntry } from "@/lib/types/growth";
import { differenceInDays, parseISO } from "date-fns";

interface StatsCardsProps {
  reptiles: Reptile[];
  healthLogs: HealthLogEntry[];
  breedingProjects: BreedingProject[];
  growthEntries: GrowthEntry[];
}

export function StatsCards({ reptiles, healthLogs, breedingProjects, growthEntries }: StatsCardsProps) {
  // Calculate statistics
  const activeReptiles = reptiles.filter(r => r.status === 'active').length;
  const breedingPairs = breedingProjects.filter(p => p.status === 'active').length;
  const unresolvedHealthIssues = healthLogs.filter(h => !h.resolved).length;
  
  // Calculate reptiles due for growth measurement
  const reptilesDueForMeasurement = reptiles.filter(reptile => {
    const lastGrowthEntry = growthEntries
      .filter(entry => entry.reptile_id === reptile.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (!lastGrowthEntry) return true;
    
    const daysSinceLastMeasurement = differenceInDays(
      new Date(), 
      parseISO(lastGrowthEntry.date)
    );
    
    // Growth records due if none or last one older than 30 days
    return !lastGrowthEntry || daysSinceLastMeasurement > 30;
  }).length;

  const stats = [
    {
      title: "Total Reptiles",
      value: activeReptiles.toString(),
      icon: Turtle,
      description: "Active reptiles in your collection",
      link: "/reptiles"
    },
    {
      title: "Health Issues",
      value: unresolvedHealthIssues.toString(),
      icon: Heart,
      description: "Unresolved health issues",
      link: "/health"
    },
    {
      title: "Growth Records",
      value: reptilesDueForMeasurement.toString(),
      icon: LineChart,
      description: "Reptiles needing measurement",
      link: "/growth"
    },
    {
      title: "Breeding Projects",
      value: breedingPairs.toString(),
      icon: Users,
      description: "Active breeding projects",
      link: "/breeding"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Link href={stat.link} key={index}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
} 