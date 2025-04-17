'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthEntry } from "@/lib/types/growth";
import { HealthLogEntry } from "@/lib/types/health";
import { Reptile } from "@/lib/types/reptile";
import { format, parseISO } from "date-fns";
import { Activity, TrendingUp } from "lucide-react";
import Link from "next/link";

interface RecentActivityProps {
  reptiles: Reptile[];
  healthLogs: HealthLogEntry[];
  growthEntries: GrowthEntry[];
}

export function RecentActivity({ reptiles, healthLogs, growthEntries }: RecentActivityProps) {
  // Get recent activity
  const recentActivity = [
    // Growth entries, newest first
    ...growthEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map(entry => {
        const reptile = reptiles.find(r => r.id === entry.reptile_id);
        return {
          type: 'growth',
          reptileName: reptile?.name || 'Unknown reptile',
          date: entry.date,
          icon: TrendingUp,
          details: `Weight: ${entry.weight}g, Length: ${entry.length}cm`
        };
      }),
    
    // Health entries, newest first  
    ...healthLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map(entry => {
        const reptile = reptiles.find(r => r.id === entry.reptile_id);
        return {
          type: 'health',
          reptileName: reptile?.name || 'Unknown reptile',
          date: entry.date,
          icon: Activity,
          details: `Health issue ${entry.resolved ? 'resolved' : 'unresolved'}`
        };
      })
  ]
  // Sort by most recent date first
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your collection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          recentActivity.map((activity, i) => {
            const ActivityIcon = activity.icon;
            const href = `/${activity.type}`;
            return (
              <div key={i} className="flex items-start space-x-3">
                <ActivityIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <Link href={href} className="text-sm font-medium hover:underline">
                    {activity.reptileName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(activity.date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/health">View Health Records</Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 