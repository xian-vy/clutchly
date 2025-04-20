'use client';

import { Card, CardContent } from "@/components/ui/card";
import { BreedingProject } from "@/lib/types/breeding";
import { GrowthEntry } from "@/lib/types/growth";
import { HealthLogEntry } from "@/lib/types/health";
import { Reptile } from "@/lib/types/reptile";
import { differenceInDays, parseISO } from "date-fns";
import { Dna, Heart, LineChart, Turtle } from "lucide-react";
import Link from "next/link";

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
      color: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-500"
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
      icon: Dna,
      description: "Active breeding projects",
      link: "/breeding",
      color: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-500"
    },
  ];

  return (
    <div className="grid  grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 3xl:gap-10">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Link href={stat.link} key={index}>
            <Card className={`hover:shadow-md transition-all cursor-pointer h-full border bg-card`}>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex justify-between items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`rounded-full flex-shrink-0 `}>
                          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-primary`} />
                        </div>
                        <p className="text-xs sm:text-sm xl:text-[0.9rem] font-medium text-primary  truncate">
                         {stat.title}
                        </p>
                    </div>  
                    <div className="text-xl sm:text-2xl xl:text-3xl font-bold ">{stat.value}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                      {stat.description}
                    </p>
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