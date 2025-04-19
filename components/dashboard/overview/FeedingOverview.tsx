'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedingScheduleWithTargets } from "@/lib/types/feeding";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Calendar, Target, PawPrint, Utensils, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface FeedingOverviewProps {
  schedules: FeedingScheduleWithTargets[];
}

export function FeedingOverview({ schedules }: FeedingOverviewProps) {
  // Get upcoming feeding days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const getUpcomingFeedingDates = (schedule: FeedingScheduleWithTargets): Date[] => {
    const dates: Date[] = [];
    const startDate = parseISO(schedule.start_date);
    const endDate = schedule.end_date ? parseISO(schedule.end_date) : null;
    
    // If schedule has ended or hasn't started yet, return empty array
    if (
      (endDate && endDate < today) || 
      startDate > today
    ) {
      return [];
    }
    
    // Check next 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      // Skip if beyond end date
      if (endDate && checkDate > endDate) {
        continue;
      }
      
      const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Check if this day is a feeding day
      let isFeedingDay = false;
      
      switch (schedule.recurrence) {
        case 'daily':
          isFeedingDay = true;
          break;
        case 'weekly':
          // Weekly starts from the start_date's day of week
          const startDayOfWeek = startDate.getDay();
          isFeedingDay = dayOfWeek === startDayOfWeek;
          break;
        case 'custom':
          isFeedingDay = schedule.custom_days?.includes(dayOfWeek) || false;
          break;
      }
      
      if (isFeedingDay) {
        dates.push(new Date(checkDate));
      }
    }
    
    return dates;
  };
  
  // Get the next feeding dates for all schedules
  const upcomingFeedings = schedules.flatMap(schedule => {
    const dates = getUpcomingFeedingDates(schedule);
    return dates.map(date => ({
      schedule,
      date
    }));
  });
  
  // Sort by date
  upcomingFeedings.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Only keep the next 5 upcoming feedings
  const nearestFeedings = upcomingFeedings.slice(0, 5);
  
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
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Upcoming Feedings</CardTitle>
            <CardDescription>Recent and upcoming feeding schedules</CardDescription>
          </div>
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
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {nearestFeedings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Utensils className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">No upcoming feedings</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a feeding schedule to track your feeding routine
            </p>
          </div>
        ) : (
          nearestFeedings.map((item, i) => (
            <Link 
              href={`/feeding`} 
              key={i} 
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {item.schedule.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground truncate">
                    {getTargetsDisplay(item.schedule)}
                  </p>
                </div>
              </div>
              <Badge variant={isToday(item.date) ? "default" : "outline"} className="ml-auto">
                {formatDateDisplay(item.date)}
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
  );
} 