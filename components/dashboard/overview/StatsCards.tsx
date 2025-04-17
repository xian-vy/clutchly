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
      link: "/reptiles",
      color: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Health Issues",
      value: unresolvedHealthIssues.toString(),
      icon: Heart,
      description: "Unresolved health issues",
      link: "/health",
      color: "bg-red-50 dark:bg-red-950",
      iconColor: unresolvedHealthIssues > 0 ? "text-red-500" : "text-muted-foreground"
    },
    {
      title: "Growth Records",
      value: reptilesDueForMeasurement.toString(),
      icon: LineChart,
      description: "Reptiles needing measurement",
      link: "/growth",
      color: "bg-green-50 dark:bg-green-950",
      iconColor: reptilesDueForMeasurement > 0 ? "text-green-500" : "text-muted-foreground"
    },
    {
      title: "Breeding Projects",
      value: breedingPairs.toString(),
      icon: Users,
      description: "Active breeding projects",
      link: "/breeding",
      color: "bg-purple-50 dark:bg-purple-950"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Link href={stat.link} key={index}>
            <Card className={`hover:shadow-md transition-all cursor-pointer h-full border ${stat.color}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`rounded-full p-2 ${stat.color}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor || "text-muted-foreground"}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
} 