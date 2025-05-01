'use client';

import { Card, CardContent } from "@/components/ui/card";
import { BreedingProject } from "@/lib/types/breeding";
import { ExpensesSummary } from "@/lib/types/expenses";
import { GrowthEntry } from "@/lib/types/growth";
import { HealthLogEntry } from "@/lib/types/health";
import { Reptile } from "@/lib/types/reptile";
import { SalesSummary } from "@/lib/types/sales";
import { differenceInDays, parseISO } from "date-fns";
import { BarChart, Dna, DollarSign, Heart, LineChart, Turtle, Wallet } from "lucide-react";
import Link from "next/link";

interface StatsCardsProps {
  reptiles: Reptile[];
  healthLogs: HealthLogEntry[];
  growthEntries: GrowthEntry[];
  salesSummary?: SalesSummary;
  expensesSummary?: ExpensesSummary;
  breedingProjects: BreedingProject[];
  tabIndex  : number
}

export function StatsCards({ 
  reptiles, 
  healthLogs, 
  growthEntries, 
  salesSummary, 
  expensesSummary ,
  breedingProjects,
  tabIndex
}: StatsCardsProps) {
  // Calculate statistics
  const activeReptiles = reptiles.filter(r => r.status === 'active').length;
  const unresolvedHealthIssues = healthLogs.filter(h => !h.resolved).length;
  const breedingPairs = breedingProjects.filter(p => p.status === 'active').length;
  const totalReptileSold = salesSummary?.total_sales

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

  // Extract sales and expenses data
  const totalSales = salesSummary?.total_revenue ?? 0;
  const totalExpenses = expensesSummary?.totalExpenses ?? 0;
  const totalProfit = totalSales - totalExpenses;

  const stats = [
    {
      title: "Total Reptiles",
      value: activeReptiles.toString(),
      icon: Turtle,
      description: "Active reptiles in your collection",
      link: "/reptiles",
      color: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-500",
      tabIndex : 0,
    },
    {
      title: "Health Issues",
      value: unresolvedHealthIssues.toString(),
      icon: Heart,
      description: "Unresolved health issues",
      link: "/health",
      color: "bg-red-50 dark:bg-red-950",
      iconColor: unresolvedHealthIssues > 0 ? "text-red-500" : "text-muted-foreground",
      tabIndex : 0,
    },
    {
      title: "Growth Records",
      value: reptilesDueForMeasurement.toString(),
      icon: LineChart,
      description: "Reptiles needing measurement",
      link: "/growth",
      color: "bg-green-50 dark:bg-green-950",
      iconColor: reptilesDueForMeasurement > 0 ? "text-green-500" : "text-muted-foreground",
      tabIndex : 0,
    },
    {
      title: "Breeding Projects",
      value: breedingPairs.toString(),
      icon: Dna,
      description: "Active breeding projects",
      link: "/breeding",
      tabIndex : 0,

    },
    {
      title: "Reptile Sold",
      value: totalReptileSold,
      icon: Turtle,
      description: "Total Reptiles Sold",
      link: "/sales",
      tabIndex : 1
    },
    {
      title: "Total Sales",
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      description: "Revenue from all sales",
      link: "/sales",
      color: "bg-emerald-50 dark:bg-emerald-950",
      iconColor: "text-emerald-500",
      tabIndex : 1
    },
    {
      title: "Total Expenses",
      value: `$${totalExpenses.toFixed(2)}`,
      icon: Wallet,
      description: "Cost of all expenses",
      link: "/expenses",
      color: "bg-amber-50 dark:bg-amber-950",
      iconColor: "text-amber-500",
      tabIndex : 1
    },
    {
      title: "Net Profit",
      value: `$${totalProfit.toFixed(2)}`,
      icon: BarChart,
      description: "Sales less expenses",
      link: "/reports",
      color: "bg-purple-50 dark:bg-purple-950",
      iconColor: totalProfit >= 0 ? "text-purple-500" : "text-red-500",
      tabIndex : 1
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2  xl:grid-cols-4 gap-4 xl:gap-5 3xl:gap-10">
      {stats
      .filter((st) => st.tabIndex === tabIndex)
      .map((stat, index) => {
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
                        <p className="text-xs sm:text-sm xl:text-[0.9rem] font-medium truncate">
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