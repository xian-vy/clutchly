'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useUpcomingFeedings } from "@/lib/hooks/useUpcomingFeedings";
import { FeedingScheduleWithTargets } from "@/lib/types/feeding";
import { useQueryClient } from "@tanstack/react-query";
import { format, isToday, isTomorrow } from "date-fns";
import { AlertCircle, Calendar, Check, Clock, MoreHorizontal, RefreshCw, Target, Utensils } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";



export function FeedingOverview() {
  const queryClient = useQueryClient();

  // Get upcoming feeding days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { 
    upcomingFeedings, 
    isLoadingStatus: upcomingLoading,
    refreshStatus: refreshUpcoming
  } = useUpcomingFeedings();
  
  const handleRefreshStatus = useCallback(() => {
    refreshUpcoming();
    queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
    queryClient.invalidateQueries({ queryKey: ['feeding-events'] });
  }, [ queryClient,refreshUpcoming]);
  
  // Format the date display
  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMM d');
    }
  };
  
  // Format targets display
  const getTargetsDisplay = (schedule: FeedingScheduleWithTargets) => {
    const locationTargets = schedule.targets.filter(t => t.target_type === 'location');
    const reptileTargets = schedule.targets.filter(t => t.target_type === 'reptile');
    
    if (locationTargets.length > 0 && reptileTargets.length === 0) {
      return `${locationTargets.length} location${locationTargets.length > 1 ? 's' : ''}`;
    } else if (reptileTargets.length > 0 && locationTargets.length === 0) {
      return `${reptileTargets.length} reptile${reptileTargets.length > 1 ? 's' : ''}`;
    } else {
      return `${locationTargets.length} location${locationTargets.length > 1 ? 's' : ''}, ${reptileTargets.length} reptile${reptileTargets.length > 1 ? 's' : ''}`;
    }
  };

  // Get feeding schedules for today that need attention
  const todayFeedings = upcomingFeedings.filter(feeding => isToday(feeding.date));
  const pendingTodayFeedings = todayFeedings.filter(feeding => !feeding.isCompleted);
  const hasPendingFeedings = pendingTodayFeedings.length > 0;
  
  return (
    <div className="space-y-4">
      {hasPendingFeedings && (
        <Alert variant="info">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feeding reminder</AlertTitle>
          <AlertDescription>
            You have {pendingTodayFeedings.length} feeding schedule{pendingTodayFeedings.length > 1 ? 's' : ''} that need{pendingTodayFeedings.length === 1 ? 's' : ''} attention today.
          </AlertDescription>
        </Alert>
      )}
    
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-medium">Upcoming Feedings</CardTitle>
              <CardDescription>Recent and upcoming feeding schedules</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefreshStatus} 
                className="h-8 w-8"
                disabled={upcomingLoading}
              >
                {upcomingLoading ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="sr-only">Refresh</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/feeding" className="cursor-pointer">
                      View All Schedules
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/feeding" className="cursor-pointer">
                      Create New Schedule
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {upcomingLoading ? (
            <div className="flex items-center justify-center p-6">
              <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : upcomingFeedings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Utensils className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No upcoming feedings</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a feeding schedule to track your feeding routine
              </p>
            </div>
          ) : (
            upcomingFeedings.map((item, i) => (
              <Link 
                href={`/feeding`} 
                key={i} 
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-full ${isToday(item.date) 
                  ? item.isCompleted 
                    ? "bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400"
                    : "bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400" 
                  : "bg-muted text-muted-foreground"}`}>
                  {isToday(item.date) && item.isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {item.schedule.name}
                    </p>
                   
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      {getTargetsDisplay(item.schedule)}
                    </p>
                  </div>
                </div>
                <div >
                   {isToday(item.date) && item.totalEvents > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.completedEvents}/{item.totalEvents} fed
                      </Badge>
                    )}
                </div>
                <Badge variant={isToday(item.date) 
                  ? item.isCompleted ? "secondary" : "default"
                  : "outline"} 
                  className={`ml-auto ${isToday(item.date) && item.isCompleted ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300" : ""}`}
                >
                  {item.isCompleted ? "Complete" : formatDateDisplay(item.date)}
                </Badge>
              </Link>
            ))
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/feeding">Manage Feeding Schedules</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 