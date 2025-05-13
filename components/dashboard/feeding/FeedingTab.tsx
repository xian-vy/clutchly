'use client';

import { getFeedingSchedules } from '@/app/api/feeding/schedule';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useResource } from '@/lib/hooks/useResource';
import { useUpcomingFeedings } from '@/lib/hooks/useUpcomingFeedings';
import { FeedingScheduleWithTargets, NewFeedingSchedule } from '@/lib/types/feeding';
import { useQuery, useQueryClient,  } from '@tanstack/react-query';
import { differenceInDays, format, isToday, startOfDay } from 'date-fns';
import { AlertCircle, Calendar, Check, CheckCircle, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { FeedingEvents } from './FeedingEvents';
import { getScheduleStats } from './utils';



export function FeedingTab() {
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set());

  // Use the resource hook for schedules
  const {
    resources: schedules,
    isLoading: schedulesLoading,
  } = useResource<FeedingScheduleWithTargets, NewFeedingSchedule>({
    resourceName: 'Feeding Schedule',
    queryKey: ['feeding-schedules'],
    getResources: getFeedingSchedules,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });
  const queryClient = useQueryClient();

  const { 
    upcomingFeedings, 
    isLoadingStatus: upcomingLoading,
    refreshStatus: refreshUpcoming
  } = useUpcomingFeedings();

  const toggleExpanded = (scheduleId: string) => {
    setExpandedScheduleIds(current => {
      const newSet = new Set(current);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
      }
      return newSet;
    });
  };

  // Format recurrence display
  const getRecurrenceDisplay = (schedule: FeedingScheduleWithTargets) => {
    switch (schedule.recurrence) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'interval':
        return `Every ${schedule.interval_days} days`;
      case 'custom':
        if (!schedule.custom_days || schedule.custom_days.length === 0) {
          return 'Custom';
        }
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = schedule.custom_days.sort().map(day => dayNames[day]);
        return `Custom (${days.join(', ')})`;
    }
  };


  // Add a new query for schedule stats
  const { data: scheduleStats = {} } = useQuery({
    queryKey: ['schedule-stats', schedules],
    queryFn: async () => {
      const stats: Record<string, { locationCount: number; reptileCount: number; nextFeedingDate: Date }> = {};
      
      await Promise.all(
        schedules.map(async (schedule) => {
          stats[schedule.id] = await getScheduleStats(schedule);
        })
      );
      
      return stats;
    },
    enabled: schedules.length > 0
  });

  const isLoading = schedulesLoading || upcomingLoading;

  const refreshStatus = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['feeding-events'] });
    refreshUpcoming();
  }, [ queryClient,refreshUpcoming]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle>No Feeding Schedules</CardTitle>
          <CardDescription>
            Create a feeding schedule to get started with managing your reptile feeding.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => toast.info('Navigate to Schedules tab to create a new schedule')}>
            Create Your First Schedule
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Check if there are incomplete schedules for today
  const todayFeedings = upcomingFeedings.filter(feeding => isToday(feeding.date));
  const pendingTodayFeedings = todayFeedings.filter(feeding => !feeding.isCompleted);
  const hasPendingFeedings = pendingTodayFeedings.length > 0;


  return (
    <div className="space-y-3">
   
      <div className="flex justify-between items-center">
        {hasPendingFeedings ? (
          <Alert variant="info" className="flex-1">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Feeding reminder</AlertTitle>
            <AlertDescription>
              You have {pendingTodayFeedings.length} feeding schedule{pendingTodayFeedings.length > 1 ? 's' : ''} that need{pendingTodayFeedings.length === 1 ? 's' : ''} to be completed today.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex w-full items-center justify-center gap-3 text-primary text-xs 2xl:text-sm" >
               <CheckCircle strokeWidth={1.5} className='w-4 h-4 3xl:h-5 3xl:w-5' /> You&apos;re all set with Feedings.
          </div>
        )}

      </div>

      <div className="grid grid-cols-1 gap-6">
        {schedules
          .map((schedule) => {
            const stats = scheduleStats[schedule.id] || { locationCount: 0, reptileCount: 0, nextFeedingDate: new Date() };
            const status = upcomingFeedings.find((feeding) => feeding.schedule.id === schedule.id);
            
          // Check if the schedule was created today or in the future
          const scheduleCreatedAt = new Date(schedule.created_at);
          scheduleCreatedAt.setHours(0, 0, 0, 0);
          const today = startOfDay(new Date());
          today.setHours(0, 0, 0, 0);
          const isNewSchedule = scheduleCreatedAt > today 
          
          const isActiveToday = status?.date.toDateString() === format(new Date(), 'yyyy-MM-dd');
          const feedingDateString = status?.date 
            ? format(new Date(status.date), 'MMM d, yyyy')
            : null;
            console.log("status", status)
            console.log("isNewSchedule", !!(status && status.totalEvents > 0 && !status.isCompleted && !isNewSchedule))
          return (
            <Collapsible
              key={schedule.id}
              open={expandedScheduleIds.has(schedule.id)}
              onOpenChange={() => toggleExpanded(schedule.id)}
              className="border rounded-lg overflow-hidden bg-white dark:bg-card"
            >
              <Card className="border-0 shadow-none gap-5 3xl:gap-6">
                <CardHeader className="pb-0 px-6">
                  {status && (status.isCompleted || isNewSchedule) && (
                    <div className="mb-3">
                      <Badge variant="outline" className="flex justify-between !text-xs items-center  h-8 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                       <div className='flex items-center gap-1.5'>
                          <Calendar className="h-3 w-3 mb-0.5" />
                          Next feeding: {format(stats.nextFeedingDate, 'EEEE, MMM d, yyyy')}  
                        </div>
                       <>
                         {differenceInDays(stats.nextFeedingDate, new Date())} days to go
                        </>
                      </Badge>
                    </div>
                  )}
                  <div className="flex  items-center gap-5 2xl:gap-7">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base lg:text-lg 3xl:text-xl flex flex-col items-start">
                          {schedule.name}
                          <div className="flex items-center gap-1">
                              <Calendar strokeWidth={1.5} className="h-3 w-3 text-muted-foreground" />
                              <div className="text-xs font-normal text-muted-foreground">{getRecurrenceDisplay(schedule)}</div>        
                          </div>
                        </CardTitle>
                      
                      </div>

                    </div>
                    <div className='flex-1'>
                    {upcomingLoading ? (
                        <div className="h-8 flex items-center justify-center mb-3">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                        ) : status && status.totalEvents > 0 && !status.isCompleted && !isNewSchedule && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>
                                {isActiveToday ? 'Today\'s progress' : `Progress for ${feedingDateString}`}
                              </span>
                              <span>{status.completedEvents}/{status.totalEvents}%</span>
                            </div>
                            <Progress value={status.completedEvents * 100 / status.totalEvents} className="h-2" />
                          </div>
                        )}
                    </div>
                    <div>
                      {status && status.totalEvents > 0 && !isNewSchedule && (
                          <Badge variant={status.isCompleted ? "secondary" : "default"} className={`${status.isCompleted ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300" : ""}`}>
                            {status.isCompleted ? (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" /> Completed
                              </span>
                            ) : (
                              <span>{status.completedEvents}/{status.totalEvents} fed</span>
                            )}
                          </Badge>
                        )}
                    </div>
                  </div>
                  <div>
                     {schedule.description ? (
                        <CardDescription className="mt-2">{schedule.description}</CardDescription>
                      ):(
                        <CardDescription className="mt-2">No Description for this Schedule</CardDescription>
                      )}
                  </div>
                </CardHeader>
                <CardContent className="pb-0 px-6 flex justify-between w-full items-center">        

                  <div className="flex flex-wrap gap-1 mb-1">
                    {schedule.targets[0] && schedule.targets[0].target_type === 'reptile' &&
                      <Badge variant="secondary" className="text-xs capitalize">
                        {`Target: Selected ${schedule.targets[0].target_type}`}
                      </Badge>
                      }
                      { schedule.targets
                      .filter(target => ['location', 'room', 'rack', 'level'].includes(target.target_type))
                      .map((target, index) => {
                        let label = "Unknown location";
                        let tooltipContent = "Location";
                        
                        if (target.target_type === 'location' && target.location_label) {
                          label = target.location_label;
                          tooltipContent = `Location: ${target.location_label}`;
                        }
                        else if (target.target_type === 'room' && target.room_name) {
                          label = `Target: ${target.room_name}`;
                          tooltipContent = `Room: ${target.room_name}`;
                        }
                        else if (target.target_type === 'rack' && target.rack_name) {
                          label = `Target: ${target.rack_name}`;
                          tooltipContent = `Rack: ${target.rack_name}`;
                        }
                        else if (target.target_type === 'level' && target.rack_name && target.level_number) {
                          label = `Target: ${target.level_number}`;
                          tooltipContent = `Level ${target.level_number} in ${target.rack_name}`;
                        } 
                        
                        return (
                          <TooltipProvider key={`loc-${target.id}-${index}`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{tooltipContent}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}             
                  </div>
                  <Badge variant="secondary" className="text-xs">
                        {stats.reptileCount || 0} reptiles
                  </Badge>
                </CardContent>
              </Card>
                <div className=" px-2">
                  <FeedingEvents 
                    scheduleId={schedule.id} 
                    schedule={schedule}
                    onEventsUpdated={refreshStatus} 
                    isNewSchedule={isNewSchedule}
                  />
                </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}