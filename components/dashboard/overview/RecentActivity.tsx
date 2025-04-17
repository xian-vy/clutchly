'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthEntry } from "@/lib/types/growth";
import { HealthLogEntry } from "@/lib/types/health";
import { Reptile } from "@/lib/types/reptile";
import { format, parseISO } from "date-fns";
import { Activity, Clock, TrendingUp } from "lucide-react";
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        <CardDescription>Latest updates in your collection</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">No recent activity</p>
            <p className="text-xs text-muted-foreground">Activities will appear here as you use the app</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, i) => {
              const ActivityIcon = activity.icon;
              const href = `/${activity.type}`;
              
              // Determine icon background color based on activity type
              const bgColor = activity.type === 'health' 
                ? 'bg-red-50 text-red-500 dark:bg-red-950'
                : 'bg-green-50 text-green-500 dark:bg-green-950';
                
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full mt-0.5 ${bgColor}`}>
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <Link href={href} className="text-sm font-medium hover:underline">
                        {activity.reptileName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(activity.date), "MMM d")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {recentActivity.length > 0 && (
        <CardFooter className="pt-0">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/activity">View All Activity</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 